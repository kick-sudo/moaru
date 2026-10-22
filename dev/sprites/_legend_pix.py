"""Legend sprites (금오 · 월백) from the four canonical transparent PNGs
   docs/planning/legend-stories/assets/{geumo,wolbaek}-{front,back}.png

python3 _legend_pix.py            build + write _ref/sprites_png.json, sprites.js, previews
python3 _legend_pix.py --dry      previews only

Unlike the paper character sheets (_pixelize.py), these sources carry a real alpha channel:
  * the source alpha is kept: colour is averaged with alpha weights (premultiplied), the pixel
    coverage decides the binary sprite alpha, and nothing is composited onto a background colour
    (the faint glow at the flame / fur edges falls under the coverage threshold instead of
    turning into a coloured fringe);
  * front and back are converted separately (never a mirror of each other);
  * the canvases are wide (not the square monster canvases) so the long wings / tails are not
    cropped or shortened; each sprite carries a body pivot used to place it in battle;
  * colours are mapped onto a small curated palette per legend, then each sprite pixel takes the
    dominant palette colour of its block (no muddy averages between the indigo feathers and their
    gold edges); a few named feature pixels (eyes, beak, nose, tail separators) are restored by hand
    in the touch-up tables below;
  * small views (icon / overworld mini) are drawn from the same palette as hand-placed pixel art,
    keeping the features that must stay readable (three legs, three eye-spot tail plumes, long wings;
    nine separate tail tips) instead of a plain shrink.
"""
import json, base64, io, sys, os
import numpy as np
import cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
# the four canonical PNGs (asset-manifest.json canonicalAssets): run from the repository top level, or point LEGEND_SRC at them
SRC = os.environ.get('LEGEND_SRC') or next((p for p in (os.path.join(HERE, 'docs', 'planning', 'legend-stories', 'assets'),
                                                         '/home/claude/moaru/docs/planning/legend-stories/assets') if os.path.isdir(p)),
                                           os.path.join(HERE, 'docs', 'planning', 'legend-stories', 'assets'))
OUT = os.path.join(HERE, '_sprites', 'legend')


def hexs(*h):
    return np.array([[int(x[i:i + 2], 16) for i in (1, 3, 5)] for x in h], float)


def load(name):
    im = Image.open(os.path.join(SRC, name + '.png')).convert('RGBA')
    a = np.asarray(im).astype(np.float32)
    al = a[..., 3] / 255.0
    ys, xs = np.where(al > 8 / 255)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return a[y0:y1, x0:x1, :3], al[y0:y1, x0:x1], (int(x0), int(y0), int(x1), int(y1))


def lab_of(rgb):
    return cv2.cvtColor(np.clip(rgb, 0, 255).astype(np.uint8).reshape(-1, 1, 3), cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(float)


def shrink(rgb, al, W, H):
    """premultiplied area downscale: colour (un-premultiplied) + alpha coverage"""
    pre = rgb * al[..., None]
    col = cv2.resize(pre, (W, H), interpolation=cv2.INTER_AREA)
    cov = cv2.resize(al, (W, H), interpolation=cv2.INTER_AREA)
    col = col / np.maximum(cov[..., None], 1e-4)
    return col, cov


def mode_shrink(name, W, pal, F=4, thr=0.5, prio=(), prio_frac=0.25, H=None, bias=None, lines=None, smooth=0):
    """-> palette index image (H, W) (-1 = transparent), scale (target px per source px), source box
    lines: optional {'r': radius, 'levels': [(min_blackhat, pal_index), ...], 'frac': f}
           thin dark valleys (fur partings between tails, engraved patterns) found with a black-hat
           at the working scale win the block when they cover at least `frac` of it"""
    rgb, al, box = load(name)
    h, w = al.shape
    if H is None: H = max(1, round(h * W / w))
    col, cov = shrink(rgb, al, W * F, H * F)
    for _ in range(smooth):   # flatten the painted feather / fur texture, keep the big shapes and edges
        col = cv2.bilateralFilter(np.clip(col, 0, 255).astype(np.float32), 5, 40, 3)
    d = ((lab_of(col.reshape(-1, 3))[:, None, :] - lab_of(pal)[None]) ** 2).sum(2)
    if bias is not None: d = d + np.asarray(bias, float)[None, :]
    idx = d.argmin(1).reshape(H * F, W * F)
    if lines:
        L = col.mean(2) * (cov > 0.5) + 255 * (cov <= 0.5)
        r = lines['r']
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
        bh = cv2.morphologyEx(L.astype(np.float32), cv2.MORPH_BLACKHAT, k)
        bh[cov <= 0.5] = 0
        lv = np.full(idx.shape, -1, int)
        for mn, pi in sorted(lines['levels']):
            lv[bh >= mn] = pi
    covT = cv2.resize(al, (W, H), interpolation=cv2.INTER_AREA)
    out = np.full((H, W), -1, int)
    n = len(pal)
    for y in range(H):
        for x in range(W):
            if covT[y, x] <= thr: continue
            sl = (slice(y * F, (y + 1) * F), slice(x * F, (x + 1) * F))
            bi = idx[sl].ravel()
            bw = cov[sl].ravel()
            hist = np.bincount(bi, weights=bw, minlength=n)
            tot = hist.sum()
            pick = hist.argmax()
            for p in prio:
                if hist[p] >= prio_frac * tot: pick = p; break
            if lines:
                lb = lv[sl].ravel()
                on = lb >= 0
                if on.sum() >= lines['frac'] * len(lb):
                    vals, cnt = np.unique(lb[on], return_counts=True)
                    pick = vals[cnt.argmax()]
            out[y, x] = pick
    return out, W / w, box


def despeckle(li, keep=()):
    """a pixel unlike all 8 neighbours takes the neighbours' majority (feature colours are kept)"""
    H, W = li.shape
    new = li.copy()
    P = np.pad(li, 1, constant_values=-1)
    for y in range(H):
        for x in range(W):
            v = li[y, x]
            if v < 0 or v in keep: continue
            nb = np.delete(P[y:y + 3, x:x + 3].ravel(), 4)
            nb = nb[nb >= 0]
            if len(nb) < 5 or (nb == v).any(): continue
            vals, cnt = np.unique(nb, return_counts=True)
            new[y, x] = vals[cnt.argmax()]
    return new


def to_rgba(li, pal):
    H, W = li.shape
    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    m = li >= 0
    rgba[m, :3] = np.clip(pal[li[m]], 0, 255).astype(np.uint8)
    rgba[m, 3] = 255
    return rgba


def outline_idx(li, pal, line, light_min=64, darker=None):
    """silhouette edge pixels of the solid parts -> the legend's outline colour.
    1-2 px wisps (flame tongues, crest plumes, fur tips) keep their own colour: outlining them would
    turn every thin bright plume into a dark line."""
    from scipy import ndimage
    mask = li >= 0
    thick = ndimage.binary_opening(mask, structure=np.ones((3, 3), bool))
    P = np.pad(mask, 1)
    edge = mask & ~(P[2:, 1:-1] & P[:-2, 1:-1] & P[1:-1, 2:] & P[1:-1, :-2])
    L = pal @ np.array([0.3, 0.59, 0.11])
    out = li.copy()
    for y, x in zip(*np.where(edge & thick)):
        v = li[y, x]
        if L[v] > light_min: out[y, x] = darker[v] if darker is not None else line
    return out


def apply(li, edits, pal_index):
    """edits: list of (x, y, colour-name or -1)"""
    out = li.copy()
    for x, y, c in edits:
        if 0 <= y < out.shape[0] and 0 <= x < out.shape[1]:
            out[y, x] = -1 if c in (-1, None, '') else pal_index[c]
    return out


def strokes(spec):
    """touch-up language, one op per line ('#' comments):
         c: x,y x,y ...        polyline in colour c (Bresenham)
         @x,y: chars           a row of pixels from x,y ('.' or ' ' keep, '_' clear, else a colour name)
         clear: x0,y0 x1,y1    rectangle -> transparent (inclusive)
         fill c: x0,y0 x1,y1   rectangle -> colour c"""
    ed = []
    for line in spec.strip().splitlines():
        line = line.split('#', 1)[0].rstrip() if not line.lstrip().startswith('@') else line.rstrip()
        if not line.strip(): continue
        line = line.strip()
        if line.startswith('@'):
            head, row = line[1:].split(':', 1)
            x0, y0 = (int(v) for v in head.split(','))
            row = row[1:] if row.startswith(' ') else row
            for i, ch in enumerate(row):
                if ch in '. ': continue
                ed.append((x0 + i, y0, None if ch == '_' else ch))
            continue
        c, pts = line.split(':', 1)
        P = [tuple(int(v) for v in p.split(',')) for p in pts.split()]
        c = c.strip()
        if c == 'clear' or c.startswith('fill'):
            col = None if c == 'clear' else c.split()[1]
            (x0, y0), (x1, y1) = P
            for yy in range(min(y0, y1), max(y0, y1) + 1):
                for xx in range(min(x0, x1), max(x0, x1) + 1): ed.append((xx, yy, col))
            continue
        if len(P) == 1: ed.append((P[0][0], P[0][1], c)); continue
        for (x0, y0), (x1, y1) in zip(P, P[1:]):
            dx, dy = abs(x1 - x0), -abs(y1 - y0)
            sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
            err = dx + dy
            while True:
                ed.append((x0, y0, c))
                if x0 == x1 and y0 == y1: break
                e2 = 2 * err
                if e2 >= dy: err += dy; x0 += sx
                if e2 <= dx: err += dx; y0 += sy
    return ed


def grid(rows, legend):
    """hand-drawn pixel art: rows of characters, legend char -> colour name ('.' transparent)"""
    H, W = len(rows), max(len(r) for r in rows)
    out = []
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in legend: out.append((x, y, legend[ch]))
    return (W, H), out


# ------------------------------------------------------------------ previews
def bg_img(kind, w, h):
    if kind == 'day':
        g = np.linspace(0, 1, h)[:, None]
        return np.dstack([143 + 87 * g, 208 + 38 * g, 244 + 6 * g]).repeat(w, 1)
    if kind == 'night':
        g = np.linspace(0, 1, h)[:, None]
        return np.dstack([28 + 62 * g, 32 + 42 * g, 72 + 66 * g]).repeat(w, 1)
    col = {'paper': (253, 251, 243), 'grass': (120, 192, 96), 'cave': (52, 46, 62), 'dirt': (216, 184, 138), 'white': (255, 255, 255)}[kind]
    return np.full((h, w, 3), col, float)


def on_bg(rgba, bg, S=3, pad=4):
    h, w = rgba.shape[:2]
    B = bg_img(bg, w + pad * 2, h + pad * 2).astype(np.uint8)
    im = Image.fromarray(B, 'RGB').convert('RGBA')
    im.alpha_composite(Image.fromarray(rgba, 'RGBA'), (pad, pad))
    return im.resize((im.width * S, im.height * S), Image.NEAREST)


def sheet(rows, path, gap=8, fill=(60, 60, 70, 255)):
    W = max(sum(t.width + gap for t in r) for r in rows) + gap
    H = sum(max(t.height for t in r) + gap for r in rows) + gap
    sh = Image.new('RGBA', (W, H), fill); y = gap
    for r in rows:
        x = gap
        for t in r: sh.alpha_composite(t, (x, y)); x += t.width + gap
        y += max(t.height for t in r) + gap
    sh.save(path)
    return sh.size


def zoom_grid(rgba, S=6, bg='day', every=10):
    """big zoom with a light ruler every 10 px (for writing touch-ups)"""
    from PIL import ImageDraw
    h, w = rgba.shape[:2]
    im = on_bg(rgba, bg, S=S, pad=0).convert('RGB')
    can = Image.new('RGB', (im.width + 26, im.height + 16), (30, 30, 36))
    can.paste(im, (26, 16))
    d = ImageDraw.Draw(can)
    for x in range(0, w + 1, every):
        d.line([(26 + x * S, 16), (26 + x * S, 16 + h * S)], fill=(255, 90, 90), width=1)
        d.text((26 + x * S + 2, 2), str(x), fill=(255, 220, 160))
    for y in range(0, h + 1, every):
        d.line([(26, 16 + y * S), (26 + w * S, 16 + y * S)], fill=(255, 90, 90), width=1)
        d.text((2, 16 + y * S + 2), str(y), fill=(255, 220, 160))
    return can


# ------------------------------------------------------------------ palettes
NAMES_G = ['k', 'p', 'i', 'I', 'b', 'r', 'R', 'o', 'O', 'a', 'g', 'G', 'c', 'm']
PAL_G = hexs('#1a0c10', '#2c1a2c', '#3b2f5c', '#4f4a8c', '#5a2414', '#8a3414', '#b84a16', '#e8661a', '#f48c24', '#f8b03a', '#fcd25a', '#fdeb8e', '#fffbd8', '#7a5a7a')
NAMES_W = ['k', 'd', 'D', 'm', 'M', 'l', 'L', 'w', 'W', 'h', 's', 'e', 'E', 'n']
PAL_W = hexs('#2a2430', '#4e4660', '#6e6888', '#8e88a8', '#aaa4c2', '#c4bfd6', '#d8d4e4', '#e8e6ef', '#f6f4f8', '#ffffff', '#8fa0c8', '#4a9ae8', '#bfe4ff', '#dfe6f4')
IX_G = {n: i for i, n in enumerate(NAMES_G)}
IX_W = {n: i for i, n in enumerate(NAMES_W)}


def edge_map_g(pal):
    L = pal @ np.array([0.3, 0.59, 0.11])
    return {i: (IX_G['b'] if L[i] > 140 else IX_G['k']) for i in range(len(pal))}


def edge_map_w(pal):
    return {i: IX_W['d'] for i in range(len(pal))}


def build_big(key):
    S = BIG[key]
    li, sc, box = mode_shrink(S['src'], S['W'], S['pal'], smooth=S.get('smooth', 0), lines=S.get('lines'), prio=S.get('prio', ()), prio_frac=S.get('prio_frac', 0.25))
    if S.get('lines_mask'):   # parting lines only where the tails are (the mane would turn into noise)
        li0, _, _ = mode_shrink(S['src'], S['W'], S['pal'], smooth=S.get('smooth', 0))
        m = np.zeros(li.shape, bool)
        for x0, y0, x1, y1 in S['lines_mask']: m[y0:y1, x0:x1] = True
        li = np.where(m, li, li0)
    li = despeckle(li, keep=S.get('keep', ()))
    li = apply(li, strokes(S.get('pre', '')), S['ix'])
    li = outline_idx(li, S['pal'], 0, light_min=S.get('light_min', 60), darker=S['edge'](S['pal']))
    import importlib, _legend_touch
    importlib.reload(_legend_touch)
    li = apply(li, strokes(_legend_touch.TOUCH.get(key, '')), S['ix'])
    return li, sc, box


BIG = {
    'geumo:front': dict(src='geumo-front', W=124, pal=PAL_G, ix=IX_G, smooth=1, edge=edge_map_g),
    'geumo:back': dict(src='geumo-back', W=128, pal=PAL_G, ix=IX_G, smooth=1, edge=edge_map_g),
    'wolbaek:front': dict(src='wolbaek-front', W=118, pal=PAL_W, ix=IX_W, smooth=1, edge=edge_map_w, light_min=40,
                          lines={'r': 5, 'levels': [(22, IX_W['M']), (40, IX_W['m']), (70, IX_W['D'])], 'frac': 0.25}, lines_mask=[(44, 0, 118, 82)]),
    'wolbaek:back': dict(src='wolbaek-back', W=128, pal=PAL_W, ix=IX_W, smooth=1, edge=edge_map_w, light_min=40,
                         lines={'r': 5, 'levels': [(22, IX_W['M']), (40, IX_W['m']), (70, IX_W['D'])], 'frac': 0.25}, lines_mask=[(0, 0, 100, 87)]),
}


# ------------------------------------------------------------------ small views drawn as shapes, then pixelated
def vec_pixels(W, H, shapes, names, F=8, cover=0.5):
    """shapes: [('poly', c, [(x, y), ...]), ('ell', c, cx, cy, rx, ry), ('line', c, [(x, y), ...], width)]
    in sprite-pixel units; drawn without anti-aliasing at F x, then each sprite pixel takes the most
    common colour of its block (transparent when less than `cover` of the block is painted)."""
    from PIL import ImageDraw
    ix = {n: i + 1 for i, n in enumerate(names)}
    im = Image.new('P', (W * F, H * F), 0)
    d = ImageDraw.Draw(im)
    for sh in shapes:
        kind, c = sh[0], ix[sh[1]]
        if kind == 'poly': d.polygon([(x * F, y * F) for x, y in sh[2]], fill=c)
        elif kind == 'ell':
            cx, cy, rx, ry = sh[2:6]; d.ellipse([(cx - rx) * F, (cy - ry) * F, (cx + rx) * F, (cy + ry) * F], fill=c)
        elif kind == 'line': d.line([(x * F, y * F) for x, y in sh[2]], fill=c, width=max(1, int(sh[3] * F)), joint='curve')
    a = np.asarray(im)
    out = np.full((H, W), -1, int)
    for y in range(H):
        for x in range(W):
            b = a[y * F:(y + 1) * F, x * F:(x + 1) * F].ravel()
            on = b[b > 0]
            if len(on) < cover * len(b): continue
            out[y, x] = np.bincount(on).argmax() - 1
    return out


def fan(Wd, H, root, tips, bend=0.22, rb=1.8, rm=2.7, order=(0, 8, 1, 7, 2, 6, 3, 5, 4), F=4):
    """월백's nine tails for the small views: one bushy curved wedge per tail from the root to its tip.
    Every pixel belongs to the front-most tail covering it; where two tails meet a parting line is drawn,
    the outer rim is outlined, so the nine tips stay countable at 1x."""
    import math
    yy, xx = np.mgrid[0:H * F, 0:Wd * F]
    X = (xx + 0.5) / F; Y = (yy + 0.5) / F
    own = np.full(X.shape, -1, int)
    for i in order:
        x0, y0 = root; x1, y1 = tips[i]
        dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); nx, ny = -dy / L, dx / L
        ts = np.linspace(0, 1, 40)
        cxs = x0 + dx * ts + nx * bend * L * (ts - ts ** 2); cys = y0 + dy * ts + ny * bend * L * (ts - ts ** 2)
        rad = np.where(ts < 0.55, rb + (rm - rb) * ts / 0.55, rm * (1 - (ts - 0.55) / 0.45) ** 0.8 + 0.35 * (ts - 0.55) / 0.45)
        d = np.full(X.shape, 1e9)
        for cx, cy, r in zip(cxs, cys, rad): d = np.minimum(d, np.hypot(X - cx, Y - cy) - r)
        own[d < 0] = i
    o1 = np.full((H, Wd), -1, int)
    for y in range(H):
        for x in range(Wd):
            b = own[y * F:(y + 1) * F, x * F:(x + 1) * F].ravel(); on = b[b >= 0]
            if len(on) >= 0.5 * len(b): o1[y, x] = np.bincount(on).argmax()
    rank = {t: k for k, t in enumerate(order)}
    li = np.full((H, Wd), -1, int)
    for y in range(H):
        for x in range(Wd):
            o = o1[y, x]
            if o < 0: continue
            nb = [(y + dy, x + dx) for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))]
            edge = any(not (0 <= a < H and 0 <= b < Wd) or o1[a, b] < 0 for a, b in nb)
            part = any(0 <= a < H and 0 <= b < Wd and o1[a, b] >= 0 and rank[o1[a, b]] > rank[o] for a, b in nb)
            dist = math.hypot(x + 0.5 - root[0], y + 0.5 - root[1])
            li[y, x] = IX_W['d'] if edge else IX_W['m'] if part else (IX_W['W'] if dist > 7 else IX_W['w'] if dist > 4 else IX_W['L'])
    return li


WOLBAEK_FAN = dict(root=(18.0, 13.0), tips=[(8, 3.2), (12, 0.6), (17, 0.3), (22.4, 0.5), (27.2, 2.4), (30.6, 5.8), (31.4, 10.6), (31.0, 15.6), (28.4, 20.4)])


def build_small(key):
    import importlib, _legend_touch
    importlib.reload(_legend_touch)
    if key == 'geumo:mini':
        li = np.full((24, 32), -1, int)
        return apply(li, strokes(_legend_touch.GEUMO_MINI), IX_G), PAL_G
    if key == 'wolbaek:mini':
        li = fan(32, 26, WOLBAEK_FAN['root'], WOLBAEK_FAN['tips'])
        return apply(li, strokes(_legend_touch.WOLBAEK_MINI_BODY), IX_W), PAL_W
    raise KeyError(key)


def to_canvas(li, W, H, bottom=1):
    """centre an index image at the bottom of a W x H canvas"""
    h, w = li.shape
    out = np.full((H, W), -1, int)
    ox, oy = (W - w) // 2, H - h - bottom
    out[oy:oy + h, ox:ox + w] = li
    return out


# body pivots (where the creature itself is, not the middle of the wide frame) and the feature points
# the encounter effects light up: 금오's three sun eyes, 월백's nine tail tips (moon-fire is an overlay,
# never painted into the sprite)
META = {
    'geumo:front': {'pivot': [46, 34], 'eyes': [[100, 30], [110, 44], [99, 54]]},
    'geumo:back': {'pivot': [78, 32], 'eyes': [[24, 44], [25, 56], [42, 63]]},
    'wolbaek:front': {'pivot': [32, 45], 'tips': [[44, 25], [49, 9], [66, 1], [90, 6], [111, 20], [116, 42], [115, 55], [113, 64], [102, 79]]},
    'wolbaek:back': {'pivot': [108, 38], 'tips': [[1, 47], [8, 28], [24, 20], [49, 9], [57, 1], [89, 23], [13, 65], [31, 73], [58, 81]]},
    'wolbaek:mini': {'tips': [[round(x), round(y)] for x, y in WOLBAEK_FAN['tips']]},
}


def to_png(rgba):
    h, w = rgba.shape[:2]
    flat = rgba.reshape(-1, 4)
    pal = {}; idx = np.zeros(len(flat), dtype=np.uint8)
    for i, p in enumerate(flat):
        if p[3] == 0: continue
        key = tuple(int(v) for v in p[:3])
        if key not in pal: pal[key] = len(pal) + 1
        idx[i] = pal[key]
    im = Image.fromarray(idx.reshape(h, w), 'P')
    flatp = [0, 0, 0] + [v for k in pal for v in k]
    im.putpalette(flatp + [0] * (768 - len(flatp)))
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True, transparency=0)
    return base64.b64encode(buf.getvalue()).decode()


def write_sprites_js(cache, meta):
    """same layout as _pixelize.py writes, plus the sprite metadata block"""
    lines = ["/* 모아루: 잠든 길의 노래 — pixel sprites converted from the designer's character sheets (PNG data) */", 'window.G = window.G || {};', 'G.SPRITES = {']
    for k in sorted(cache):
        lines.append(f"  '{k}': 'data:image/png;base64,{cache[k]}',")
    lines.append('};')
    if meta:
        lines.append('// wide sprites: body pivot and effect anchor points in sprite pixels (see _legend_pix.py)')
        lines.append('G.SPRITE_META = ' + json.dumps(meta, separators=(',', ':'), sort_keys=True) + ';')
    open(os.path.join(HERE, 'sprites.js'), 'w').write('\n'.join(lines) + '\n')


def build_all():
    out = {}
    for key in BIG:
        li, sc, box = build_big(key)
        out[key] = to_rgba(li, BIG[key]['pal'])
    for key in ('geumo:mini', 'wolbaek:mini'):
        li, pal = build_small(key)
        out[key] = to_rgba(li, pal)
        out[key.replace(':mini', ':icon')] = to_rgba(to_canvas(li, 32, 32), pal)
    return out


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    imgs = build_all()
    for k, rgba in imgs.items():
        Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, k.replace(':', '_') + '.png'))
    meta = dict(META)
    for k, rgba in imgs.items():
        meta.setdefault(k, {})['size'] = [int(rgba.shape[1]), int(rgba.shape[0])]
    rows = [[on_bg(imgs['geumo:front'], 'day'), on_bg(imgs['geumo:back'], 'day')],
            [on_bg(imgs['wolbaek:front'], 'day'), on_bg(imgs['wolbaek:back'], 'day')],
            [on_bg(imgs[k], bg, S=4) for k in ('geumo:mini', 'geumo:icon', 'wolbaek:mini', 'wolbaek:icon') for bg in ('grass', 'paper')]]
    print('preview', sheet(rows, os.path.join(OUT, 'legend_preview.png')))
    if '--dry' in sys.argv: sys.exit()
    cache_p = os.path.join(HERE, '_ref', 'sprites_png.json')
    if os.path.exists(cache_p): cache = json.load(open(cache_p))
    else:   # no cache next to the script (a fresh checkout): take every other sprite from the game's own sprites.js
        import re
        cache = dict(re.findall(r"^  '([^']+)': 'data:image/png;base64,([^']+)',$", open(os.path.join(HERE, 'sprites.js')).read(), re.M))
        os.makedirs(os.path.dirname(cache_p), exist_ok=True)
    for k in [k for k in cache if k.split(':')[0] in ('geumo', 'wolbaek')]: del cache[k]
    for k, rgba in imgs.items(): cache[k] = to_png(rgba)
    json.dump(cache, open(cache_p, 'w'))
    json.dump(meta, open(os.path.join(HERE, '_ref', 'sprite_meta.json'), 'w'), indent=1, sort_keys=True)
    write_sprites_js(cache, meta)
    print('sprites.js:', len(cache), 'images;', ', '.join(f"{k} {v['size'][0]}x{v['size'][1]}" for k, v in sorted(meta.items())))
