"""
Image I/O, Streaming Upload Guard, Decompression Bomb Defense & Preset Resolution
Strips EXIF/XMP/ICC metadata cleanly via NumPy conversion and enforces magic-byte verification.
"""
from __future__ import annotations

import base64
import binascii
import io
import logging
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import tifffile
from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

logger = logging.getLogger("quantum_vision.image_io")

ROOT_DIR = Path(__file__).resolve().parents[3]

MAX_UPLOAD_BYTES = 5_242_880        # 5 MB hard byte limit
MAX_BASE64_CHARS = 7_500_000        # ~5.4 MB raw decoded equivalent
MAX_IMAGE_DIM = 2048                # Max pixel width/height
MIN_IMAGE_DIM = 8                   # Min pixel width/height
Image.MAX_IMAGE_PIXELS = 4_194_304  # 2048 x 2048 decompression bomb defense


async def read_upload_bounded(upload_file: UploadFile, max_bytes: int = MAX_UPLOAD_BYTES) -> bytes:
    """Streams an UploadFile in 64 KB chunks cleanly and aborts with HTTP 413 if oversized."""
    chunks = bytearray()
    while chunk := await upload_file.read(65_536):
        chunks.extend(chunk)
        if len(chunks) > max_bytes:
            raise HTTPException(status_code=413, detail="Uploaded image exceeds 5 MB size limit.")
    if not chunks:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty.")
    return bytes(chunks)


def verify_magic_bytes(file_bytes: bytes) -> str:
    """Accepts strictly PNG, JPEG, or WebP headers. Rejects SVG, XML, HTML, TIFF, GIF, and executables."""
    if len(file_bytes) < 12:
        raise ValueError("Unsupported or truncated image payload.")
    if file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if file_bytes.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if file_bytes[:4] == b"RIFF" and file_bytes[8:12] == b"WEBP":
        return "webp"
    raise ValueError("Unsupported image format. Strictly PNG, JPEG, and WebP are allowed.")


def decode_image_bytes(
    file_bytes: bytes,
    target_size: Optional[int] = None,
    strict_magic: bool = True,
) -> np.ndarray:
    """Decodes validated PNG/JPEG/WebP bytes to 2D uint8 array while stripping all metadata."""
    if not file_bytes or len(file_bytes) > MAX_UPLOAD_BYTES:
        raise ValueError("Image payload exceeds 5 MB limit.")

    if strict_magic:
        verify_magic_bytes(file_bytes)

    try:
        with io.BytesIO(file_bytes) as bio:
            with Image.open(bio) as pil_img:
                if getattr(pil_img, "n_frames", 1) != 1:
                    raise ValueError("Animated or multi-frame images are not permitted.")
                w, h = pil_img.size
                if w < MIN_IMAGE_DIM or h < MIN_IMAGE_DIM or w > MAX_IMAGE_DIM or h > MAX_IMAGE_DIM:
                    raise ValueError(
                        f"Image dimensions must stay between {MIN_IMAGE_DIM} and {MAX_IMAGE_DIM} pixels."
                    )
                # Explicit pixel array copy strips all EXIF, GPS, XMP, and ICC profiles
                gray = pil_img.convert("L")
                img = np.array(gray, dtype=np.uint8, copy=True)
    except ValueError:
        raise
    except (Image.DecompressionBombError, UnidentifiedImageError, OSError):
        raise ValueError("Invalid or corrupted image file.")
    except Exception:
        logger.warning("Unexpected image decode error suppressed from client output.")
        raise ValueError("Invalid image payload.")

    if target_size is not None and (img.shape[0] != target_size or img.shape[1] != target_size):
        img = cv2.resize(img, (target_size, target_size), interpolation=cv2.INTER_AREA)

    return img


def load_image_from_source(
    preset_id: Optional[str] = "synthetic_rim_512",
    image_base64: Optional[str] = None,
    target_size: int = 128,
) -> tuple[np.ndarray, str]:
    """Unified image resolver shared across Studio, Benchmark, and Presets."""
    if image_base64:
        if len(image_base64) > MAX_BASE64_CHARS:
            raise ValueError("Encoded image exceeds maximum upload size.")
        raw_b64 = image_base64.split(",", 1)[1] if "," in image_base64 else image_base64
        try:
            img_bytes = base64.b64decode(raw_b64, validate=True)
        except (binascii.Error, ValueError):
            raise ValueError("Malformed base64 image payload.")
        return decode_image_bytes(img_bytes, target_size=target_size, strict_magic=True), "Custom Uploaded Imagery"

    pid = (preset_id or "synthetic_rim_512").lower()
    size = max(8, min(int(target_size), 512))

    if pid == "lunar_geotiff_512":
        p_tif = ROOT_DIR / "data/sombench/cache/20f800becb64a0c7ad314652a683f97f0281fe67/M1290203799CE_r5872_c1112.tif"
        if p_tif.exists():
            tif_data = tifffile.imread(str(p_tif))
            band = tif_data[:, :, 0].astype(np.float64)
            img = ((band - band.min()) / max(1e-9, band.max() - band.min()) * 255.0).astype(np.uint8)
        else:
            img = np.full((size, size), 100, dtype=np.uint8)
            cv2.circle(img, (size // 2, size // 2), int(size * 0.35), 210, 3)
            cv2.circle(img, (size // 2, size // 2), int(size * 0.21), 45, -1)
        title = "LRO WAC Lunar GeoTIFF"
    elif pid == "apollo_crater_32":
        p_lunar = ROOT_DIR / "data/sombench/patches/1107931740CE_sub_wac_8x8.png"
        if p_lunar.exists():
            base_crater = cv2.imread(str(p_lunar), cv2.IMREAD_GRAYSCALE)
            img = cv2.resize(base_crater, (size, size), interpolation=cv2.INTER_CUBIC)
        else:
            img = np.full((size, size), 95, dtype=np.uint8)
            cv2.circle(img, (size // 2, size // 2), int(size * 0.33), 195, 2)
        title = "Apollo 16 Landing Site Crater"
    elif pid == "diagonal_ray":
        y_grid, x_grid = np.mgrid[0:size, 0:size]
        img = np.where(np.abs(x_grid - y_grid) < max(4, size // 12), 224, 42).astype(np.uint8)
        title = "Diagonal Crater Ray"
    elif pid == "concentric_craters":
        img = np.full((size, size), 38, dtype=np.uint8)
        for frac, val in [(0.40, 215), (0.28, 120), (0.15, 235)]:
            cv2.circle(img, (size // 2, size // 2), max(2, int(size * frac)), val, 2)
        title = "Concentric Terraced Crater"
    else:
        img = np.full((size, size), 35, dtype=np.uint8)
        cv2.circle(img, (size // 2, size // 2), int(size * 0.35), 235, 4)
        cv2.circle(img, (size // 2, size // 2), int(size * 0.18), 180, -1)
        title = "High Contrast Synthetic Rim"

    if img.shape[0] != size or img.shape[1] != size:
        img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)

    return img, title


def to_base64_png(array: np.ndarray) -> str:
    """Converts 2D uint8 array or 3D RGB array into data:image/png;base64 string."""
    if array.dtype != np.uint8:
        if array.max() <= 1.0:
            arr_u8 = (np.clip(array, 0, 1) * 255).astype(np.uint8)
        else:
            arr_u8 = np.clip(array, 0, 255).astype(np.uint8)
    else:
        arr_u8 = array

    if arr_u8.ndim == 2:
        success, encoded = cv2.imencode(".png", arr_u8)
    else:
        bgr = cv2.cvtColor(arr_u8, cv2.COLOR_RGB2BGR)
        success, encoded = cv2.imencode(".png", bgr)

    if not success:
        raise RuntimeError("Failed to encode PNG image")

    b64_str = base64.b64encode(encoded.tobytes()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"


def create_color_overlay(base_gray: np.ndarray, binary_mask: np.ndarray, color_rgb: list) -> str:
    """Creates a vivid color overlay of edge pixels on top of the grayscale background."""
    base_u8 = np.clip(base_gray, 0, 255).astype(np.uint8)
    rgb = np.stack([base_u8, base_u8, base_u8], axis=-1)
    mask = binary_mask > 0
    rgb[mask] = color_rgb
    return to_base64_png(rgb)
