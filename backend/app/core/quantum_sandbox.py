"""
Process-Isolated OpenQASM Sandbox & Resource Guard
Prevents QASM include injection, recursive custom-gate macro bombs,
oversized registers (>14 qubits / >256 gates), and CPU/event-loop starvation.
"""
from __future__ import annotations

import asyncio
import re
from concurrent.futures import ProcessPoolExecutor
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from backend.app.core.settings import get_settings

MAX_QASM_BYTES = 16_384
MAX_QASM_LINES = 400
MAX_QUBITS = 14
MAX_GATES = 256
MAX_DEPTH = 128
MAX_BARRIERS = 32
MAX_CUSTOM_GATES = 3

_COMMENT_LINE_RE = re.compile(r"//[^\n]*")
_COMMENT_BLOCK_RE = re.compile(r"/\*.*?\*/", re.DOTALL)
_FORBIDDEN_KEYWORD_RE = re.compile(r"\b(pragma|extern|opaque)\b", re.IGNORECASE)
_INCLUDE_RE = re.compile(r"include\s+([^;\n]+);", re.IGNORECASE)
_BARRIER_RE = re.compile(r"\bbarrier\b", re.IGNORECASE)
_CUSTOM_GATE_RE = re.compile(
    r"\bgate\s+([A-Za-z_][A-Za-z0-9_]*)\b([^{;]*)\{([^}]*)\}",
    re.IGNORECASE | re.DOTALL,
)
_QUBIT_DECL_RE = re.compile(
    r"\b(?:qubit\s*\[\s*(\d+)\s*\]|qreg\s+[A-Za-z_][A-Za-z0-9_]*\s*\[\s*(\d+)\s*\])",
    re.IGNORECASE,
)

_ALLOWED_INCLUDES = frozenset({'"stdgates.inc"', "'stdgates.inc'", '"qelib1.inc"', "'qelib1.inc'"})

_POOL: Optional[ProcessPoolExecutor] = None


def _get_pool() -> ProcessPoolExecutor:
    global _POOL
    if _POOL is None:
        _POOL = ProcessPoolExecutor(max_workers=get_settings().qiskit_max_workers)
    return _POOL


def _recycle_pool() -> None:
    global _POOL
    if _POOL is not None:
        old = _POOL
        _POOL = None
        try:
            for proc in list(getattr(old, "_processes", {}).values()):
                try:
                    proc.kill()
                except Exception:
                    pass
            old.shutdown(wait=False, cancel_futures=True)
        except Exception:
            pass


def validate_and_sanitize_qasm(qasm_code: str, max_qubits: int = MAX_QUBITS) -> str:
    """Validates OpenQASM text against bomb, include, and register caps before parsing."""
    raw = (qasm_code or "").strip()
    if not raw:
        raise HTTPException(status_code=400, detail="OpenQASM circuit source is required.")
    if len(raw.encode("utf-8")) > MAX_QASM_BYTES:
        raise HTTPException(status_code=400, detail="OpenQASM source exceeds 16 KB limit.")
    if raw.count("\n") + 1 > MAX_QASM_LINES:
        raise HTTPException(status_code=400, detail="OpenQASM source exceeds 400 lines limit.")

    stripped = _COMMENT_BLOCK_RE.sub(" ", raw)
    stripped = _COMMENT_LINE_RE.sub("", stripped).strip()

    forbidden = _FORBIDDEN_KEYWORD_RE.search(stripped)
    if forbidden:
        raise HTTPException(
            status_code=400,
            detail=f"Forbidden OpenQASM directive '{forbidden.group(1)}' rejected by sandbox.",
        )

    for inc_match in _INCLUDE_RE.finditer(stripped):
        inc_target = inc_match.group(1).strip().lower()
        if inc_target not in _ALLOWED_INCLUDES:
            raise HTTPException(
                status_code=400,
                detail="External includes outside stdgates.inc / qelib1.inc are prohibited.",
            )

    if len(_BARRIER_RE.findall(stripped)) > MAX_BARRIERS:
        raise HTTPException(status_code=400, detail="Too many barrier directives (max 32).")

    # Macro-bomb prevention: max 3 custom gates & zero nested custom-gate invocations inside bodies
    custom_defs = list(_CUSTOM_GATE_RE.finditer(stripped))
    if len(custom_defs) > MAX_CUSTOM_GATES:
        raise HTTPException(status_code=400, detail="At most 3 custom gate declarations are permitted.")

    custom_names: List[str] = [m.group(1) for m in custom_defs]
    for m in custom_defs:
        g_name = m.group(1)
        body = m.group(3)
        for other in custom_names:
            if re.search(rf"\b{re.escape(other)}\b", body):
                raise HTTPException(
                    status_code=400,
                    detail=f"Nested or recursive custom gate invocation ('{other}' inside '{g_name}') is prohibited.",
                )

    total_qubits = 0
    for q_match in _QUBIT_DECL_RE.finditer(stripped):
        cnt = int(q_match.group(1) or q_match.group(2) or 0)
        total_qubits += cnt
    if total_qubits > max_qubits:
        raise HTTPException(
            status_code=400,
            detail=f"Total declared qubits ({total_qubits}) exceeds sandbox maximum ({max_qubits}).",
        )

    return stripped


def _qasm3_subset_to_qasm2(clean_qasm: str) -> str:
    """Normalizes the safe standard OpenQASM 3.0 gate subset to OpenQASM 2.0 when qiskit_qasm3_import is absent."""
    txt = re.sub(r"OPENQASM\s+3(?:\.\d+)?\s*;", "OPENQASM 2.0;", clean_qasm, flags=re.IGNORECASE)
    txt = re.sub(r'include\s+["\']stdgates\.inc["\']\s*;', 'include "qelib1.inc";', txt, flags=re.IGNORECASE)
    txt = re.sub(r"\bqubit\s*\[\s*(\d+)\s*\]\s*([A-Za-z_][A-Za-z0-9_]*)\s*;", r"qreg \2[\1];", txt, flags=re.IGNORECASE)
    txt = re.sub(r"\bbit\s*\[\s*(\d+)\s*\]\s*([A-Za-z_][A-Za-z0-9_]*)\s*;", r"creg \2[\1];", txt, flags=re.IGNORECASE)
    txt = re.sub(
        r"([A-Za-z_][A-Za-z0-9_\[\]]*)\s*=\s*measure\s+([A-Za-z_][A-Za-z0-9_\[\]]*)\s*;",
        r"measure \2 -> \1;",
        txt,
        flags=re.IGNORECASE,
    )
    return txt


def _safe_qasm_worker(clean_qasm: str, fallback_qubits: int) -> Dict[str, Any]:
    """Top-level pickleable worker executing Qiskit parsing & statevector evaluation."""
    import numpy as np
    from qiskit import QuantumCircuit
    from qiskit.exceptions import MissingOptionalLibraryError
    from qiskit.quantum_info import Statevector

    qc = None
    is_qasm3 = "OPENQASM 3" in clean_qasm.upper() or "qubit[" in clean_qasm.lower()
    if is_qasm3:
        try:
            import qiskit.qasm3 as qasm3
            qc = qasm3.loads(clean_qasm)
        except MissingOptionalLibraryError:
            clean_qasm = _qasm3_subset_to_qasm2(clean_qasm)
        except Exception as exc:
            raise ValueError(f"Invalid OpenQASM 3.0 circuit: {exc}") from exc

    if qc is None:
        try:
            qc = QuantumCircuit.from_qasm_str(clean_qasm)
        except Exception as exc:
            raise ValueError(f"Invalid OpenQASM circuit: {exc}") from exc

    total_q = sum(reg.size for reg in qc.qregs) if qc.qregs else qc.num_qubits
    if total_q > MAX_QUBITS:
        raise ValueError(f"Circuit register count ({total_q}) exceeds {MAX_QUBITS} qubits.")
    if qc.size() > MAX_GATES:
        raise ValueError(f"Circuit gate count ({qc.size()}) exceeds {MAX_GATES} gate cap.")
    depth = int(qc.depth())
    if depth > MAX_DEPTH:
        raise ValueError(f"Circuit depth ({depth}) exceeds {MAX_DEPTH} depth cap.")

    gate_counts = {str(k): int(v) for k, v in qc.count_ops().items()}

    try:
        qc_nom = qc.remove_final_measurements(inplace=False)
        sv = Statevector.from_instruction(qc_nom)
        p_norm = float(np.sum(np.abs(sv.data) ** 2))
    except Exception:
        p_norm = 1.0

    return {
        "qubits": int(qc.num_qubits),
        "circuit_depth": depth,
        "gate_counts": gate_counts,
        "norm": round(p_norm, 6),
    }


def execute_qasm_sandboxed_sync(qasm_code: str, fallback_qubits: int) -> Dict[str, Any]:
    clean_qasm = validate_and_sanitize_qasm(qasm_code)
    try:
        return _safe_qasm_worker(clean_qasm, fallback_qubits)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


async def execute_qasm_sandboxed(
    qasm_code: str,
    fallback_qubits: int,
    timeout_seconds: Optional[float] = None,
) -> Dict[str, Any]:
    """Runs sanitized OpenQASM execution in ProcessPoolExecutor with hard timeout."""
    clean_qasm = validate_and_sanitize_qasm(qasm_code)
    timeout = timeout_seconds if timeout_seconds is not None else get_settings().qiskit_timeout_seconds
    loop = asyncio.get_running_loop()
    pool = _get_pool()

    try:
        return await asyncio.wait_for(
            loop.run_in_executor(pool, _safe_qasm_worker, clean_qasm, fallback_qubits),
            timeout=timeout,
        )
    except asyncio.TimeoutError:
        _recycle_pool()
        raise HTTPException(
            status_code=408,
            detail="Quantum circuit simulation exceeded execution time budget.",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
