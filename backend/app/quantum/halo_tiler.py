"""
Halo-Padded Patch Extraction & Seamless Reassembly Protocol (Section 4.1)
Eliminates QHED cyclic boundary wrap-around checkerboard artifacts.
Slices arbitrary images into 6x6 cores with 1-pixel reflective halos (8x8 quantum tiles).
Discards polluted outer halo post-measurement to yield seamless 512x512 edge maps.
"""
from __future__ import annotations
import math
import numpy as np
import cv2


class HaloTiler:
    def __init__(self, core_size: int = 6, halo_pad: int = 1, variance_threshold: float = 1.5e-4):
        self.core_size = core_size      # 6x6 inner core
        self.halo_pad = halo_pad        # 1-pixel outer halo ring
        self.patch_size = core_size + 2 * halo_pad  # 8x8 quantum register (6 position qubits)
        self.variance_threshold = variance_threshold

    def pad_image(self, img: np.ndarray) -> tuple[np.ndarray, int, int]:
        """Pads image with symmetric reflection so all 6x6 cores tile evenly."""
        h, w = img.shape[:2]
        num_tiles_y = math.ceil(h / self.core_size)
        num_tiles_x = math.ceil(w / self.core_size)

        pad_bottom = (num_tiles_y * self.core_size) - h + self.halo_pad
        pad_right = (num_tiles_x * self.core_size) - w + self.halo_pad
        pad_top = self.halo_pad
        pad_left = self.halo_pad

        padded = cv2.copyMakeBorder(
            img,
            top=pad_top,
            bottom=pad_bottom,
            left=pad_left,
            right=pad_right,
            borderType=cv2.BORDER_REFLECT_101
        )
        return padded, num_tiles_y, num_tiles_x

    def extract_patch(self, padded_img: np.ndarray, tile_y: int, tile_x: int) -> np.ndarray:
        """Extracts an 8x8 patch for tile coordinate (tile_y, tile_x)."""
        y0 = tile_y * self.core_size
        x0 = tile_x * self.core_size
        return padded_img[y0 : y0 + self.patch_size, x0 : x0 + self.patch_size]

    def is_flat_patch(self, patch_8x8: np.ndarray) -> bool:
        """O(1) variance culling test for smooth lunar mare / dark shadow tiles."""
        var = float(np.var(patch_8x8.astype(np.float64) / 255.0))
        return var < self.variance_threshold

    def crop_core(self, edge_8x8: np.ndarray) -> np.ndarray:
        """Crops out the 1-pixel halo border and returns the pure 6x6 core."""
        p = self.halo_pad
        c = self.core_size
        return edge_8x8[p : p + c, p : p + c]

    def assemble_canvas(
        self,
        core_tiles: list[tuple[int, int, np.ndarray]],
        target_h: int,
        target_w: int,
        num_tiles_y: int,
        num_tiles_x: int
    ) -> np.ndarray:
        """Assembles 6x6 core tiles into the seamless output edge canvas."""
        canvas = np.zeros((num_tiles_y * self.core_size, num_tiles_x * self.core_size), dtype=np.float32)
        for ty, tx, core_6x6 in core_tiles:
            y0 = ty * self.core_size
            x0 = tx * self.core_size
            canvas[y0 : y0 + self.core_size, x0 : x0 + self.core_size] = core_6x6

        return canvas[:target_h, :target_w]

