"""Flood-fill the light ground shadow (and paper) around a creature on a concept sheet, bounded by its dark outline."""
from collections import deque
from PIL import Image
import numpy as np

def mask(path, box, seeds, lum_min=200, rb_max=70):
    a = np.asarray(Image.open(path).convert('RGB')).astype(int)
    x0, y0, x1, y1 = box
    L = 0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2]
    ok = (L > lum_min) & ((a[..., 0] - a[..., 2]) < rb_max)    # light and not orange: paper or the beige shadow
    m = np.zeros(a.shape[:2], bool)
    q = deque()
    for (x, y) in seeds:
        if ok[y, x]: m[y, x] = True; q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if x0 <= nx < x1 and y0 <= ny < y1 and not m[ny, nx] and ok[ny, nx]:
                m[ny, nx] = True; q.append((nx, ny))
    return m
