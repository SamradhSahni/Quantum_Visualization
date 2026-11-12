"""
Image Edge Detection Processing Router
Provides single-algorithm and 6-algorithm concurrent batch processing endpoints.
"""
from typing import Annotated, Optional
import numpy as np
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException

from backend.app.core.dependencies import (
    acquire_user_compute_slot,
    require_researcher,
    verify_hmac_csrf,
)
from backend.app.utils.image_io import (
    create_color_overlay,
    decode_image_bytes,
    read_upload_bounded,
    to_base64_png,
)
from backend.app.core.algorithms import (
    run_sobel,
    run_canny,
    run_robinson,
    run_frqi_qhed,
    run_qpie_qhed,
    run_neqr_gradient
)
from backend.app.core.metrics import (
    compute_intrinsic_quality_metrics,
    compute_comparative_rankings,
    generate_diagnostic_verdict
)

router = APIRouter(prefix="/api/process", tags=["process"])

ALGO_COLORS = {
    'FRQI-QHED': [255, 0, 180],       # Electric Magenta
    'QPIE-QHED': [0, 240, 255],       # Neon Cyan
    'NEQR-Gradient': [189, 147, 249], # Laser Purple
    'Sobel 3×3 Operator': [56, 189, 248], # Sky Blue
    'Canny 5-Stage': [255, 230, 0],   # Vivid Yellow
    'Robinson 8-Compass': [50, 255, 120] # Emerald Green
}


@router.post(
    "/single",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
async def process_single(
    file: Optional[UploadFile] = File(None),
    algorithm: Annotated[str, Form(max_length=48)] = "FRQI-QHED",
    resolution: Annotated[int, Form(ge=16, le=512)] = 128,
    shots: Annotated[int, Form(ge=64, le=16384)] = 4096,
):
    """Processes an image using one designated algorithm."""
    if file is None:
        raise HTTPException(status_code=400, detail="Image file is required")

    file_bytes = await read_upload_bounded(file)
    try:
        image = decode_image_bytes(file_bytes, target_size=resolution, strict_magic=True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    algo_name = algorithm.strip().lower()
    if 'frqi' in algo_name:
        res = run_frqi_qhed(image, shots=shots)
    elif 'qpie' in algo_name:
        res = run_qpie_qhed(image, shots=shots)
    elif 'neqr' in algo_name:
        res = run_neqr_gradient(image, shots=shots)
    elif 'canny' in algo_name:
        res = run_canny(image)
    elif 'robinson' in algo_name:
        res = run_robinson(image)
    else:
        res = run_sobel(image)

    metrics = compute_intrinsic_quality_metrics(res['binary'], res['confidence_map'])
    color = ALGO_COLORS.get(res['name'], [255, 255, 255])
    overlay_b64 = create_color_overlay(image, res['binary'], color)

    return {
        'algorithm': res['name'],
        'type': res['type'],
        'resolution': f"{image.shape[1]}x{image.shape[0]}",
        'latency_ms': res['latency_ms'],
        'threshold': res['threshold'],
        'qubits': res.get('qubits', 0),
        'metrics': metrics,
        'original_base64': to_base64_png(image),
        'confidence_base64': to_base64_png((res['confidence_map'] * 255).astype(np.uint8)),
        'binary_base64': to_base64_png((res['binary'] * 255).astype(np.uint8)),
        'overlay_base64': overlay_b64
    }


@router.post(
    "/all",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
async def process_all_algorithms(
    file: Optional[UploadFile] = File(None),
    resolution: Annotated[int, Form(ge=16, le=512)] = 128,
    shots: Annotated[int, Form(ge=64, le=16384)] = 4096,
):
    """
    Executes all 6 algorithms (3 Quantum + 3 Classical) on the uploaded image.
    Returns side-by-side curated overlays, intrinsic metrics, rankings, and diagnostic verdict.
    """
    if file is None:
        raise HTTPException(status_code=400, detail="Image file is required")

    file_bytes = await read_upload_bounded(file)
    try:
        image = decode_image_bytes(file_bytes, target_size=resolution, strict_magic=True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # 1. Execute all 6 algorithms
    executors = [
        ('FRQI-QHED', lambda img: run_frqi_qhed(img, shots=shots)),
        ('QPIE-QHED', lambda img: run_qpie_qhed(img, shots=shots)),
        ('NEQR-Gradient', lambda img: run_neqr_gradient(img, shots=shots)),
        ('Sobel 3×3 Operator', lambda img: run_sobel(img)),
        ('Canny 5-Stage', lambda img: run_canny(img)),
        ('Robinson 8-Compass', lambda img: run_robinson(img))
    ]

    results_data = {}
    metrics_summary = {}
    curated_gallery = []

    for name, fn in executors:
        r = fn(image)
        m = compute_intrinsic_quality_metrics(r['binary'], r['confidence_map'])
        results_data[name] = r
        metrics_summary[name] = m

        color = ALGO_COLORS.get(name, [255, 255, 255])
        overlay_b64 = create_color_overlay(image, r['binary'], color)

        curated_gallery.append({
            'name': name,
            'type': r['type'],
            'qubits': r.get('qubits', 0),
            'threshold': r['threshold'],
            'latency_ms': r['latency_ms'],
            'metrics': m,
            'confidence_base64': to_base64_png((r['confidence_map'] * 255).astype(np.uint8)),
            'binary_base64': to_base64_png((r['binary'] * 255).astype(np.uint8)),
            'overlay_base64': overlay_b64
        })

    # 2. Compute Comparative Rankings & Composite Scores
    rankings = compute_comparative_rankings(metrics_summary)
    champion_name, champion_score = rankings[0]
    verdict = generate_diagnostic_verdict(champion_name, metrics_summary[champion_name])

    # 3. Build Scorecard Rows
    scorecard = []
    medals = ['🥇 Champion', '🥈 Runner-up', '🥉 3rd', '🏅 4th', '5th', '6th']
    for rank_idx, (m_name, score) in enumerate(rankings):
        m_info = metrics_summary[m_name]
        r_info = results_data[m_name]
        scorecard.append({
            'rank': medals[rank_idx] if rank_idx < len(medals) else f"{rank_idx + 1}th",
            'algorithm': m_name,
            'composite_score': score,
            'thinness_pct': m_info['thinness_pct'],
            'snr': m_info['snr'],
            'coverage_pct': m_info['coverage_pct'],
            'edge_pixels': m_info['edge_px'],
            'entropy': m_info['entropy'],
            'qubits': r_info.get('qubits', 0),
            'latency_ms': r_info['latency_ms']
        })

    return {
        'resolution': f"{image.shape[1]}x{image.shape[0]}",
        'original_base64': to_base64_png(image),
        'champion': champion_name,
        'champion_score': champion_score,
        'verdict': verdict['verdict_text'],
        'scorecard': scorecard,
        'gallery': curated_gallery
    }

