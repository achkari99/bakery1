"""
Utility to inject planar UV mapping and textured materials into OBJ files.

The script normalizes vertex coordinates on the XZ plane to generate UVs that
project the original reference image onto the mesh. It also writes a companion
MTL file so the OBJ keeps a link to the texture.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence


@dataclass
class ObjConfig:
    texture_path: str  # texture path relative to OBJ
    material_name: str


def read_sections(lines: Sequence[str]) -> tuple[List[str], List[str], List[str]]:
    """
    Split the OBJ into three sections:
    - header (before the first vertex)
    - vertex block (all consecutive `v ` lines)
    - tail (everything after the vertex block)
    """
    header: List[str] = []
    vertices: List[str] = []
    tail: List[str] = []

    it = iter(enumerate(lines))
    index = 0
    for index, line in it:
        if line.startswith("v "):
            break
        header.append(line)
    else:
        # No vertex data -- return the original line grouping.
        return header, vertices, tail

    # We already consumed the first vertex line in the previous loop.
    vertices.append(lines[index])

    line_count = len(lines)
    for index in range(index + 1, line_count):
        line = lines[index]
        if not line.startswith("v "):
            tail = list(lines[index:])
            break
        vertices.append(line)
    else:
        tail = []

    return header, vertices, tail


def generate_uvs(vertex_lines: Iterable[str]) -> List[str]:
    """Create `vt` records by projecting vertices onto the XZ plane."""
    xs: List[float] = []
    zs: List[float] = []
    verts: List[tuple[float, float, float]] = []

    for line in vertex_lines:
        try:
            _, x_str, y_str, z_str = line.strip().split()
        except ValueError as exc:  # defensive
            raise ValueError(f"Unexpected vertex format: {line!r}") from exc
        x = float(x_str)
        z = float(z_str)
        xs.append(x)
        zs.append(z)
        verts.append((x, float(y_str), z))

    xmin, xmax = min(xs), max(xs)
    zmin, zmax = min(zs), max(zs)
    x_range = xmax - xmin or 1.0
    z_range = zmax - zmin or 1.0

    vt_lines: List[str] = []
    for x, _, z in verts:
        u = (x - xmin) / x_range
        v = 1.0 - ((z - zmin) / z_range)
        vt_lines.append(f"vt {u:.6f} {v:.6f}\n")
    return vt_lines


def rewrite_obj(path: Path, config: ObjConfig) -> None:
    original_lines = path.read_text().splitlines(keepends=True)
    header, vertex_block, tail = read_sections(original_lines)

    if not vertex_block:
        raise ValueError(f"No vertices found in {path}")

    mtllib_name = path.with_suffix(".mtl").name
    vt_lines = generate_uvs(vertex_block)

    cleaned_header = [line for line in header if not line.startswith("mtllib ")]
    rewritten: List[str] = []
    rewritten.extend(cleaned_header)
    rewritten.append(f"mtllib {mtllib_name}\n")

    rewritten.extend(vertex_block)
    rewritten.extend(vt_lines)

    material_inserted = False
    for line in tail:
        if line.startswith("vt "):
            continue
        if line.startswith("usemtl "):
            continue
        if line.startswith("f "):
            if not material_inserted:
                rewritten.append(f"usemtl {config.material_name}\n")
                material_inserted = True
            parts = line.strip().split()[1:]
            face_tokens: List[str] = []
            for part in parts:
                vertex_index = part.split("/")[0] if "/" in part else part
                face_tokens.append(f"{vertex_index}/{vertex_index}")
            rewritten.append("f " + " ".join(face_tokens) + "\n")
        else:
            rewritten.append(line)

    if not material_inserted:
        rewritten.append(f"usemtl {config.material_name}\n")

    path.write_text("".join(rewritten))

    mtl_contents = (
        f"newmtl {config.material_name}\n"
        "Ka 1.000000 1.000000 1.000000\n"
        "Kd 1.000000 1.000000 1.000000\n"
        "Ks 0.000000 0.000000 0.000000\n"
        "d 1.000000\n"
        "illum 2\n"
        f"map_Kd {config.texture_path}\n"
    )
    path.with_suffix(".mtl").write_text(mtl_contents)


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    configs = {
        Path(root / "lwli.obj"): ObjConfig(
            texture_path="assets/textures/lwli_palette.png",
            material_name="lwli_texture",
        ),
        Path(root / "la5ar.obj"): ObjConfig(
            texture_path="assets/textures/la5ar_palette.png",
            material_name="la5ar_texture",
        ),
    }

    for obj_path, cfg in configs.items():
        rewrite_obj(obj_path, cfg)


if __name__ == "__main__":
    main()

