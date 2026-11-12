"""
Quantum Circuit Schematics & Gate Metadata Router
Provides detailed quantum circuit topologies, wire definitions, gate breakdowns, and diagrams.
"""
from fastapi import APIRouter, HTTPException
from backend.app.core.algorithms import get_circuit_metadata

router = APIRouter(prefix="/api/circuits", tags=["circuits"])


@router.get("/{algorithm}")
def get_circuit_info(algorithm: str):
    """Retrieve full circuit layout and gate progression for specified algorithm."""
    meta = get_circuit_metadata(algorithm)
    if not meta.get('is_quantum', False):
        raise HTTPException(status_code=400, detail=f"{algorithm} is a classical algorithm without quantum circuit registers.")
    return meta

