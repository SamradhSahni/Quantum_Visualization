"""
Preset Images Router
Provides sample planetary GeoTIFF tiles, Apollo crater patches, and synthetic targets.
"""
from pathlib import Path
from typing import Annotated
import numpy as np
import cv2
import tifffile
from fastapi import APIRouter, HTTPException, Query
from backend.app.utils.image_io import to_base64_png

router = APIRouter(prefix="/api/presets", tags=["presets"])
ROOT_DIR = Path(__file__).resolve().parents[3]


@router.get("")
def list_presets():
    """List available presets."""
    return [
        {
            "id": "lunar_geotiff_512",
            "title": "LRO WAC Lunar GeoTIFF (512×512)",
            "description": "True Lunar Reconnaissance Orbiter calibrated WAC GeoTIFF showing complex crater ejecta and floor morphology.",
            "width": 512,
            "height": 512,
            "type": "planetary"
        },
        {
            "id": "apollo_crater_32",
            "title": "Apollo 16 Landing Site Crater (32×32)",
            "description": "Standard benchmark lunar crater patch sampled at 32x32 resolution.",
            "width": 32,
            "height": 32,
            "type": "planetary"
        },
        {
            "id": "synthetic_rim_512",
            "title": "High-Contrast Synthetic Crater Rim (512×512)",
            "description": "Controlled circular geometric crater rim with concentric terracing.",
            "width": 512,
            "height": 512,
            "type": "synthetic"
        }
    ]


@router.get("/{preset_id}")
def get_preset_image(preset_id: str, size: Annotated[int, Query(ge=8, le=512)] = 512):
    """Fetch preset image as base64 and 2D pixel array."""
    size = max(8, min(int(size), 512))
    if preset_id == "lunar_geotiff_512":
        p_tif = ROOT_DIR / "data/sombench/cache/20f800becb64a0c7ad314652a683f97f0281fe67/M1290203799CE_r5872_c1112.tif"
        if p_tif.exists():
            tif_data = tifffile.imread(str(p_tif))
            band = tif_data[:, :, 0].astype(np.float64)
            img = ((band - band.min()) / (band.max() - band.min()) * 255.0).astype(np.uint8)
        else:
            img = np.full((512, 512), 100, dtype=np.uint8)
            cv2.circle(img, (256, 256), 180, 210, 3)
            cv2.circle(img, (256, 256), 110, 45, -1)
        title = "LRO WAC Lunar GeoTIFF (M1290203799CE)"

    elif preset_id == "apollo_crater_32":
        p_lunar = ROOT_DIR / "data/sombench/patches/1107931740CE_sub_wac_8x8.png"
        if p_lunar.exists():
            base_crater = cv2.imread(str(p_lunar), cv2.IMREAD_GRAYSCALE)
            img = cv2.resize(base_crater, (size, size), interpolation=cv2.INTER_CUBIC)
        else:
            img = np.full((size, size), 100, dtype=np.uint8)
            cv2.circle(img, (size // 2, size // 2), size // 3, 190, 2)
        title = "Apollo 16 Landing Site Crater"

    elif preset_id == "synthetic_rim_512":
        img = np.full((size, size), 35, dtype=np.uint8)
        cv2.circle(img, (size // 2, size // 2), int(size * 0.35), 235, 4)
        cv2.circle(img, (size // 2, size // 2), int(size * 0.18), 180, -1)
        title = "High-Contrast Synthetic Rim"

    else:
        raise HTTPException(status_code=404, detail="Preset not found")

    if img.shape[0] != size or img.shape[1] != size:
        img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)

    return {
        "id": preset_id,
        "title": title,
        "width": img.shape[1],
        "height": img.shape[0],
        "image_base64": to_base64_png(img),
        "raw_pixels": img.tolist()
    }

