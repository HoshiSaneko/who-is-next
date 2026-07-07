from __future__ import annotations

import argparse
import html
import math
from pathlib import Path

import cv2
import numpy as np


def zhang_suen_thinning(binary: np.ndarray, max_iterations: int = 80) -> np.ndarray:
    """Return a 1-pixel skeleton for a black-line binary image."""
    img = (binary > 0).astype(np.uint8)
    padded = np.pad(img, 1, mode="constant")

    for _ in range(max_iterations):
        changed = False
        for step in (0, 1):
            p2 = padded[:-2, 1:-1]
            p3 = padded[:-2, 2:]
            p4 = padded[1:-1, 2:]
            p5 = padded[2:, 2:]
            p6 = padded[2:, 1:-1]
            p7 = padded[2:, :-2]
            p8 = padded[1:-1, :-2]
            p9 = padded[:-2, :-2]
            center = padded[1:-1, 1:-1]

            neighbors = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
            transitions = (
                ((p2 == 0) & (p3 == 1)).astype(np.uint8)
                + ((p3 == 0) & (p4 == 1)).astype(np.uint8)
                + ((p4 == 0) & (p5 == 1)).astype(np.uint8)
                + ((p5 == 0) & (p6 == 1)).astype(np.uint8)
                + ((p6 == 0) & (p7 == 1)).astype(np.uint8)
                + ((p7 == 0) & (p8 == 1)).astype(np.uint8)
                + ((p8 == 0) & (p9 == 1)).astype(np.uint8)
                + ((p9 == 0) & (p2 == 1)).astype(np.uint8)
            )

            if step == 0:
                keep_a = (p2 * p4 * p6) == 0
                keep_b = (p4 * p6 * p8) == 0
            else:
                keep_a = (p2 * p4 * p8) == 0
                keep_b = (p2 * p6 * p8) == 0

            remove = (
                (center == 1)
                & (neighbors >= 2)
                & (neighbors <= 6)
                & (transitions == 1)
                & keep_a
                & keep_b
            )
            if np.any(remove):
                padded[1:-1, 1:-1][remove] = 0
                changed = True

        if not changed:
            break

    return padded[1:-1, 1:-1].astype(bool)


def point_neighbors(point: tuple[int, int], points: set[tuple[int, int]]) -> list[tuple[int, int]]:
    x, y = point
    result: list[tuple[int, int]] = []
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dx == 0 and dy == 0:
                continue
            candidate = (x + dx, y + dy)
            if candidate in points:
                result.append(candidate)
    return result


def trace_skeleton(skeleton: np.ndarray) -> list[list[tuple[int, int]]]:
    ys, xs = np.where(skeleton)
    points = set(zip(xs.tolist(), ys.tolist()))
    if not points:
        return []

    degree = {point: len(point_neighbors(point, points)) for point in points}
    starts = [point for point, count in degree.items() if count != 2]
    visited_edges: set[frozenset[tuple[int, int]]] = set()
    paths: list[list[tuple[int, int]]] = []

    def walk(start: tuple[int, int], first: tuple[int, int]) -> list[tuple[int, int]]:
        path = [start, first]
        prev, current = start, first
        visited_edges.add(frozenset((prev, current)))

        while degree.get(current, 0) == 2:
            candidates = [
                n
                for n in point_neighbors(current, points)
                if n != prev and frozenset((current, n)) not in visited_edges
            ]
            if not candidates:
                break
            nxt = candidates[0]
            path.append(nxt)
            visited_edges.add(frozenset((current, nxt)))
            prev, current = current, nxt
        return path

    for start in starts:
        for neighbor in point_neighbors(start, points):
            edge = frozenset((start, neighbor))
            if edge in visited_edges:
                continue
            paths.append(walk(start, neighbor))

    # Closed loops have no endpoint. Walk any remaining unvisited edge.
    for point in list(points):
        for neighbor in point_neighbors(point, points):
            edge = frozenset((point, neighbor))
            if edge in visited_edges:
                continue
            loop = walk(point, neighbor)
            if len(loop) > 2:
                paths.append(loop)

    return paths


def simplify_path(path: list[tuple[int, int]], epsilon: float) -> list[tuple[int, int]]:
    if len(path) < 3:
        return path
    contour = np.array(path, dtype=np.float32).reshape((-1, 1, 2))
    approx = cv2.approxPolyDP(contour, epsilon, False)
    return [(int(round(x)), int(round(y))) for [[x, y]] in approx.tolist()]


def path_length(path: list[tuple[int, int]]) -> float:
    return sum(
        math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1])
        for i in range(1, len(path))
    )


def path_to_d(path: list[tuple[int, int]], scale: float) -> str:
    first = path[0]
    parts = [f"M{first[0] * scale:.1f} {first[1] * scale:.1f}"]
    for x, y in path[1:]:
        parts.append(f"L{x * scale:.1f} {y * scale:.1f}")
    return " ".join(parts)


def build_svg(
    paths: list[list[tuple[int, int]]],
    width: int,
    height: int,
    scale: float,
    stroke_width: float,
    title: str,
    description: str,
) -> str:
    scaled_width = width * scale
    scaled_height = height * scale
    sorted_paths = sorted(
        paths,
        key=lambda p: (
            min(y for _, y in p),
            min(x for x, _ in p),
            -path_length(p),
        ),
    )

    path_tags: list[str] = []
    total = max(len(sorted_paths), 1)
    for index, path in enumerate(sorted_paths):
        delay = min(0.025 * index, 4.8)
        duration = 0.7 + min(path_length(path) / 500, 0.65)
        path_tags.append(
            f'    <path class="draw-line" style="--delay:{delay:.3f}s;'
            f'--duration:{duration:.3f}s" d="{path_to_d(path, scale)}" pathLength="1"/>'
        )

    title = html.escape(title)
    description = html.escape(description)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {scaled_width:.0f} {scaled_height:.0f}" role="img" aria-labelledby="title desc">
  <title id="title">{title}</title>
  <desc id="desc">{description}</desc>
  <style>
    svg {{
      color: #111111;
      background: #ffffff;
    }}

    .draw-line {{
      fill: none;
      stroke: currentColor;
      stroke-width: {stroke_width:.2f};
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      vector-effect: non-scaling-stroke;
      animation: draw var(--duration) cubic-bezier(.55, .02, .18, .98) forwards;
      animation-delay: var(--delay);
    }}

    @keyframes draw {{
      to {{
        stroke-dashoffset: 0;
      }}
    }}

    @media (prefers-reduced-motion: reduce) {{
      .draw-line {{
        stroke-dashoffset: 0;
        animation: none;
      }}
    }}
  </style>
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g>
{chr(10).join(path_tags)}
  </g>
</svg>
'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--max-width", type=int, default=900)
    parser.add_argument("--threshold", type=int, default=172)
    parser.add_argument("--min-length", type=float, default=18)
    parser.add_argument("--epsilon", type=float, default=1.35)
    parser.add_argument("--stroke-width", type=float, default=5.6)
    parser.add_argument("--morph-open", action="store_true")
    args = parser.parse_args()

    image = cv2.imread(str(args.input), cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise SystemExit(f"Could not read image: {args.input}")

    height, width = image.shape
    scale_down = min(1.0, args.max_width / width)
    if scale_down < 1:
        image = cv2.resize(
            image,
            (int(width * scale_down), int(height * scale_down)),
            interpolation=cv2.INTER_AREA,
        )

    blurred = cv2.GaussianBlur(image, (3, 3), 0)
    binary = (blurred < args.threshold).astype(np.uint8)
    if args.morph_open:
        binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    skeleton = zhang_suen_thinning(binary)

    raw_paths = trace_skeleton(skeleton)
    simplified = [simplify_path(path, args.epsilon) for path in raw_paths]
    simplified = [path for path in simplified if len(path) > 1 and path_length(path) >= args.min_length]

    proc_height, proc_width = skeleton.shape
    output_scale = width / proc_width
    svg = build_svg(
        simplified,
        proc_width,
        proc_height,
        output_scale,
        args.stroke_width,
        "Animated basketball line illustration",
        "The supplied basketball character line art converted into animated SVG drawing paths.",
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(svg, encoding="utf-8")
    print(f"Wrote {args.output} with {len(simplified)} animated paths")


if __name__ == "__main__":
    main()
