"""
FastAPI Routes for Suite 3 & Pillar 3: NISQ Hardware Realism, Error Mitigation & Microwave Pulse Lab
SABRE SWAP routing, Pauli-Twirled ZNE, OpenPulse DRAG Oscilloscope, and FTQC Surface Code Estimation.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from backend.app.core.dependencies import (
    acquire_user_compute_slot,
    require_researcher,
    verify_hmac_csrf,
)

from backend.app.domain.hardware.nisq_channels import simulate_noisy_edge_snr, HARDWARE_PROFILES
from backend.app.domain.hardware.zne_pauli_twirl import compute_4way_mitigation_comparison, apply_richardson_zne
from backend.app.domain.hardware.topology_sabre import route_circuit_sabre, get_topology_details
from backend.app.domain.hardware.openpulse_waveform import generate_openpulse_schedule
from backend.app.domain.hardware.readout_mitigator import mitigate_readout_probabilities
from backend.app.domain.hardware.ftqc_surface_code import estimate_ftqc_surface_code, estimate_ftqc_resources

router = APIRouter(prefix="/api/v1/hardware", tags=["hardware"])


class NisqSimulateRequest(BaseModel):
    hardware_profile: str = Field(default="IBM_HERON_133Q")
    logical_qubits: int = Field(default=7, ge=1, le=14)
    circuit_depth: int = Field(default=40, ge=1, le=200)
    ideal_snr: float = Field(default=2.14, ge=0.5, le=10.0)
    enable_zne: bool = True


class FtqcEstimateRequest(BaseModel):
    image_dim: int = Field(default=512, ge=8, le=4096)
    algorithm: str = Field(default="FRQI")
    target_precision_eps: float = Field(default=1e-4)


class NisqLabContractRequest(BaseModel):
    algorithm: str = "FRQI_QHED"
    hardware_topology: str = "IBM_HERON_156Q_HEAVY_HEX"
    inspected_pixel_intensity: int = Field(default=218, ge=0, le=255)
    zne_scale_factors: List[int] = Field(default_factory=lambda: [1, 3, 5])
    enable_pauli_twirling: bool = True
    enable_readout_mitigation: bool = True


@router.post(
    "/simulate-nisq",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def simulate_nisq_noise(req: NisqSimulateRequest) -> Dict[str, Any]:
    """
    Simulates hardware noise at lambda=1, 3, 5 and computes Richardson ZNE mitigated recovery.
    """
    res_1 = simulate_noisy_edge_snr(req.ideal_snr, req.hardware_profile, req.circuit_depth, noise_scale=1.0)
    res_3 = simulate_noisy_edge_snr(req.ideal_snr, req.hardware_profile, req.circuit_depth, noise_scale=3.0)
    res_5 = simulate_noisy_edge_snr(req.ideal_snr, req.hardware_profile, req.circuit_depth, noise_scale=5.0)

    mitigated_snr, zne_meta = apply_richardson_zne(
        res_1["noisy_snr"],
        res_3["noisy_snr"],
        res_5["noisy_snr"]
    )

    sabre_meta = route_circuit_sabre(
        req.logical_qubits,
        req.circuit_depth,
        req.hardware_profile
    )

    topo = get_topology_details(req.hardware_profile)

    return {
        "status": "success",
        "hardware_profile": req.hardware_profile,
        "raw_noisy_snr": res_1["noisy_snr"],
        "mitigated_snr": mitigated_snr if req.enable_zne else res_1["noisy_snr"],
        "zne_metadata": zne_meta,
        "sabre_routing": sabre_meta,
        "topology": topo
    }


@router.post(
    "/estimate-ftqc",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def estimate_ftqc(req: FtqcEstimateRequest) -> Dict[str, Any]:
    """
    Estimates Fault-Tolerant Clifford+T gates and Surface Code physical qubit count.
    """
    return estimate_ftqc_surface_code(
        image_dim=req.image_dim,
        algorithm=req.algorithm,
        target_precision_eps=req.target_precision_eps
    )


@router.post(
    "/nisq-lab",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def full_nisq_lab(req: NisqLabContractRequest) -> Dict[str, Any]:
    """
    Contract 3: Full SABRE Topology Routing + 4-Way Mitigation Comparison + OpenPulse Waveforms + FTQC.
    """
    # 1. SABRE SWAP Routing
    sabre_res = route_circuit_sabre(
        num_logical_qubits=7,
        logical_depth=14,
        profile_key=req.hardware_topology
    )
    
    # 2. 4-Way Error Mitigation
    mitigation_res = compute_4way_mitigation_comparison(
        ideal_snr=2.14,
        hardware_profile=req.hardware_topology,
        enable_pauli_twirl=req.enable_pauli_twirling
    )
    
    # 3. OpenPulse Microwave Waveforms
    openpulse_res = generate_openpulse_schedule(
        pixel_intensity=req.inspected_pixel_intensity,
        qpu_profile=req.hardware_topology
    )
    
    # 4. Readout confusion sample
    _, readout_meta = mitigate_readout_probabilities(
        np.array([0.46, 0.54]),
        p_1_given_0=0.015,
        p_0_given_1=0.035
    )
    
    # 5. FTQC resource snapshot
    ftqc_res = estimate_ftqc_surface_code(image_dim=512, algorithm=req.algorithm)
    
    return {
        "status": "success",
        "algorithm": req.algorithm,
        "hardware_topology": req.hardware_topology,
        "sabre_routing": sabre_res,
        "mitigation_comparison": mitigation_res,
        "openpulse_schedule": openpulse_res,
        "readout_mitigation_sample": readout_meta,
        "ftqc_resource_snapshot": ftqc_res
    }
