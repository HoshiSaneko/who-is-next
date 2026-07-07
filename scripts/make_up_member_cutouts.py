from collections import deque
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


SOURCE_DIR = Path("public/up-members")
OUTPUT_DIR = SOURCE_DIR / "cutouts"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PORTRAITS = [
    "amazong.png",
    "liyuanjun.png",
    "sanmu.png",
    "xudaxia.png",
    "yuge.png",
    "zhebie.png",
]


def is_checker_candidate(rgb: np.ndarray) -> np.ndarray:
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    brightness = rgb.mean(axis=2)
    return (spread <= 6) & (brightness >= 235)


def edge_connected_background(candidate: np.ndarray) -> np.ndarray:
    height, width = candidate.shape
    background = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        if candidate[y, x] and not background[y, x]:
            background[y, x] = True
            queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                add(nx, ny)

    return background


def make_cutout(source: Path, target: Path) -> None:
    image = Image.open(source).convert("RGB")
    rgb = np.array(image)

    background = edge_connected_background(is_checker_candidate(rgb))
    foreground = (~background).astype(np.uint8) * 255

    # Pull the edge inward to remove checkerboard contamination, then rebuild a
    # subtle antialiased transition instead of leaving a hard binary cutout.
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    solid_foreground = cv2.erode(foreground, kernel, iterations=2)
    alpha = cv2.GaussianBlur(solid_foreground, (0, 0), 1.1)
    alpha[background] = 0

    rgba = np.dstack([rgb, alpha]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(target)


for name in PORTRAITS:
    make_cutout(SOURCE_DIR / name, OUTPUT_DIR / name)
