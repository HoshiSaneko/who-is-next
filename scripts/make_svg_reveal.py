from __future__ import annotations

import re
from pathlib import Path


SOURCE_SVG = Path("public/images/basketball-line-art-traced-animation.svg")
OUTPUT_SVG = Path("public/images/basketball-line-art-reveal-animation.svg")
SOURCE_IMAGE = "basketball-line-art-source.png"


def main() -> None:
    source = SOURCE_SVG.read_text(encoding="utf-8")
    paths = re.findall(
        r'<path class="draw-line" style="([^"]+)" d="([^"]+)" pathLength="1"/>',
        source,
    )

    mask_paths = "\n".join(
        f'      <path class="mask-line" style="{style}" d="{path_d}" pathLength="1"/>'
        for style, path_d in paths
    )

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1086 1446" role="img" aria-labelledby="title desc">
  <title id="title">Animated reveal of basketball line art</title>
  <desc id="desc">The supplied basketball line illustration revealed by animated SVG stroke masks.</desc>
  <style>
    svg {{
      background: #ffffff;
    }}

    .mask-line {{
      fill: none;
      stroke: #ffffff;
      stroke-width: 22;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      animation: draw var(--duration) cubic-bezier(.55, .02, .18, .98) forwards;
      animation-delay: var(--delay);
    }}

    @keyframes draw {{
      to {{
        stroke-dashoffset: 0;
      }}
    }}

    @media (prefers-reduced-motion: reduce) {{
      .mask-line {{
        stroke-dashoffset: 0;
        animation: none;
      }}
    }}
  </style>
  <rect width="100%" height="100%" fill="#ffffff"/>
  <defs>
    <mask id="line-reveal-mask" maskUnits="userSpaceOnUse">
      <rect width="100%" height="100%" fill="#000000"/>
{mask_paths}
    </mask>
  </defs>
  <image href="{SOURCE_IMAGE}" x="0" y="0" width="1086" height="1446" preserveAspectRatio="xMidYMid meet" mask="url(#line-reveal-mask)"/>
</svg>
'''
    OUTPUT_SVG.write_text(svg, encoding="utf-8")
    print(f"Wrote {OUTPUT_SVG} with {len(paths)} reveal mask paths")


if __name__ == "__main__":
    main()
