"""
Generate stylised textures for the bakery 3D models using colours inspired by
their reference photography.

Each texture is built from scratch: we extract a concise palette from the photo,
then paint a soft radial gradient with gentle noise to mimic frosting depth.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

import numpy as np
from PIL import Image


DOWNSAMPLE_LIMIT = 256
TEXTURE_SIZE = 1024
NOISE_STRENGTH = 0.035
RNG = np.random.default_rng(42)


def load_reference_pixels(path: Path) -> np.ndarray:
    """Return image pixels as float32 array in range [0, 1]."""
    image = Image.open(path).convert("RGB")
    width, height = image.size
    scale = max(width, height) / DOWNSAMPLE_LIMIT
    if scale > 1:
        image = image.resize(
            (int(width / scale), int(height / scale)),
            resample=Image.Resampling.LANCZOS,
        )
    return np.asarray(image, dtype=np.float32) / 255.0


def kmeans_palette(pixels: np.ndarray, clusters: int = 5, iterations: int = 12) -> np.ndarray:
    """Simple k-means to derive a small palette from an image."""
    flat = pixels.reshape(-1, 3)
    # Filter out dark pixels so the palette focuses on frosting/topping.
    brightness = flat.mean(axis=1)
    usable = flat[brightness > 0.05]
    if usable.size == 0:
        usable = flat

    if usable.shape[0] < clusters:
        clusters = max(1, usable.shape[0])

    seeds = RNG.choice(usable.shape[0], size=clusters, replace=False)
    centroids = usable[seeds]

    for _ in range(iterations):
        distances = np.linalg.norm(usable[:, None, :] - centroids[None, :, :], axis=2)
        labels = distances.argmin(axis=1)
        new_centroids: List[np.ndarray] = []
        for idx in range(clusters):
            members = usable[labels == idx]
            if members.size == 0:
                # Re-seed empty cluster with a random pixel.
                new_centroids.append(usable[RNG.integers(0, usable.shape[0])])
            else:
                new_centroids.append(members.mean(axis=0))
        new_centroids_array = np.vstack(new_centroids)
        if np.allclose(new_centroids_array, centroids, atol=1e-3):
            centroids = new_centroids_array
            break
        centroids = new_centroids_array

    # Sort palette from lightest to darkest for gradient layering.
    brightness = centroids.mean(axis=1)
    order = np.argsort(brightness)[::-1]
    return centroids[order]


def generate_radial_gradient(palette: np.ndarray, size: int = TEXTURE_SIZE) -> np.ndarray:
    """Paint a radial gradient with palette bands and subtle stochastic details."""
    palette = palette.copy()
    palette = np.clip(palette, 0.0, 1.0)

    bands = len(palette)
    if bands == 1:
        palette = np.vstack([palette, palette])
        bands = 2

    y, x = np.indices((size, size), dtype=np.float32)
    center = (size - 1) / 2.0
    xs = (x - center) / center
    ys = (y - center) / center
    distance = np.sqrt(xs**2 + ys**2)
    angle = (np.arctan2(ys, xs) + np.pi) / (2 * np.pi)

    radial = np.clip(distance, 0.0, 1.0)
    swirl = (radial * 0.8 + angle * 0.6) * (bands - 1)
    base_indices = np.clip(np.floor(swirl).astype(int), 0, bands - 1)
    blend = np.clip(swirl - base_indices, 0.0, 1.0)

    upper_indices = np.clip(base_indices + 1, 0, bands - 1)

    colors_lower = palette[base_indices]
    colors_upper = palette[upper_indices]
    base_color = (1 - blend)[..., None] * colors_lower + blend[..., None] * colors_upper

    # Add subtle rim darkening and random speckles for organic feel.
    rim = np.clip(radial**1.8, 0.0, 1.0)[..., None]
    base_color *= (1 - 0.25 * rim)

    noise = RNG.normal(0.0, NOISE_STRENGTH, size=(size, size, 1))
    texture = np.clip(base_color + noise, 0.0, 1.0)
    return texture


def bake_texture(palette: np.ndarray, output_path: Path) -> None:
    texture = generate_radial_gradient(palette)
    image = Image.fromarray((texture * 255).astype(np.uint8), mode="RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="PNG")


@dataclass(frozen=True)
class TextureSpec:
    reference: Path
    output: Path
    clusters: int = 5


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    specs: Sequence[TextureSpec] = (
        TextureSpec(
            reference=root / "image.png",
            output=root / "assets" / "textures" / "lwli_palette.png",
            clusters=5,
        ),
        TextureSpec(
            reference=root / "images" / "image5.png",
            output=root / "assets" / "textures" / "la5ar_palette.png",
            clusters=4,
        ),
    )

    for spec in specs:
        pixels = load_reference_pixels(spec.reference)
        palette = kmeans_palette(pixels, clusters=spec.clusters)
        bake_texture(palette, spec.output)
        print(
            f"Wrote {spec.output.relative_to(root)} using palette "
            f"{np.round(palette * 255).astype(int).tolist()}"
        )


if __name__ == "__main__":
    main()
