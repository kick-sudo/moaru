# Legend sanctuaries (docs/planning/legend-stories): LGZ01 햇귀절벽 (from 바람등성이) and LGZ02 월은못 (from 달숨동굴 달빛방)
# python3 _mapgen8.py --none  ->  _maps8_rows.json   (maps8.js = _maps8_tpl.js + these rows, see _build_maps8.py)
# Connection points (keep in sync with _maps8_tpl.js and the rows changed in _mapgen4.py (바람등성이) / _build_maps3.py (달빛방)):
#   ridge cliff gap (2,24) <-> lg_suncliff east path (22,12)      [ridge haul stone Q(4,24) -> support ^(5,25)]
#   moonroom east passage (13,4) <-> lg_moonpool west shore (1,7)  [moonroom haul stone Q(12,4) -> support ^(11,2)]
import json, sys


class Grid:
    def __init__(s, w, h, fill): s.w, s.h = w, h; s.g = [[fill] * w for _ in range(h)]
    def rect(s, x, y, w, h, ch):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                if 0 <= xx < s.w and 0 <= yy < s.h: s.g[yy][xx] = ch
    def put(s, x, y, ch): s.g[y][x] = ch
    def puts(s, pts, ch):
        for x, y in pts: s.g[y][x] = ch
    def hl(s, x0, x1, y, ch): s.rect(min(x0, x1), y, abs(x1 - x0) + 1, 1, ch)
    def vl(s, x, y0, y1, ch): s.rect(x, min(y0, y1), 1, abs(y1 - y0) + 1, ch)
    def rows(s): return [''.join(r) for r in s.g]


OUT = {}
def add(name, kind, rows):
    assert len(set(len(r) for r in rows)) == 1, name
    OUT[name] = (kind, rows)


# ---------------------------------------------------------------- LGZ01 햇귀절벽 24x16 (outdoor, a wind-scoured cliff top)
# The path comes in from the east. Two hand-turned windbreaks (A, B) throw three feather shadows; when all three fall on
# the ring-marked safe stone (P) the gusts at the gate (11,4) die down and the ledge above, where 금오 perches, opens.
LG1 = dict(A=(6, 9), B=(15, 9), P=(11, 7), gate=(11, 4), tablet=(19, 13), perch=(11, 1), log=(17, 13))
g = Grid(24, 16, 'c')
g.rect(9, 1, 5, 2, 'G'); g.rect(8, 2, 7, 1, 'G')                    # the perch ledge
g.rect(10, 3, 3, 1, '.'); g.put(11, 4, '.')                           # the narrow climb and its windy gate
g.rect(6, 5, 11, 1, '.'); g.rect(5, 6, 13, 1, '.'); g.rect(4, 7, 15, 5, '.'); g.rect(5, 12, 13, 1, '.')
g.rect(17, 11, 7, 3, '.'); g.hl(17, 23, 12, '=')                       # the way in from 바람등성이
g.rect(7, 8, 3, 2, 'M'); g.rect(13, 10, 3, 1, 'M')                    # wind-flattened moss patches (no wild encounters up here)
g.put(*LG1['A'], 'X'); g.put(*LG1['B'], 'X')                          # windbreak posts (drawn by the template)
g.put(*LG1['tablet'], 'N')                                            # reset tablet
g.put(*LG1['log'], 'X')                                               # weathered field-log box (현장 일지)
g.puts([(4, 11), (18, 7), (5, 5)], 'r')
add('lg_suncliff', 'out', g.rows())

# ---------------------------------------------------------------- LGZ02 월은못 22x16 (cave, moonlit through an open ceiling)
# The way out runs on real stepping stones along the top of the pool to the moon basin; their reflections lie lower in
# the water (drawn by the template, not walkable). Touching the basin lights the hidden way back along the middle; come
# back to the shore and leave the first stone (S) empty, and the nine tails light up one by one.
OUTP = [(5, 6), (6, 6), (7, 6), (7, 5), (8, 5), (9, 5), (9, 4), (10, 4), (11, 4), (12, 4), (12, 3), (13, 3), (14, 3), (15, 3), (16, 3)]
BACKP = [(17, 5), (17, 6), (17, 7), (16, 7), (15, 7), (15, 8), (14, 8), (13, 8), (12, 8), (11, 8), (10, 8), (9, 8), (8, 8), (7, 8), (6, 8), (5, 8)]
LG2 = dict(S=OUTP[0], out=OUTP, back=BACKP, basin=(19, 3), shore=(4, 8), tablet=(2, 3), entry=(1, 7))
g = Grid(22, 16, '#')
g.rect(1, 2, 4, 12, '_')                                              # west shore
g.rect(5, 2, 13, 12, 'w')                                             # the still pool
g.rect(17, 2, 4, 3, '_'); g.rect(18, 5, 3, 2, '_')                    # the far ledge
g.puts(OUTP, '_')
g.put(*LG2['basin'], 'X')                                             # moon basin (drawn by the template)
g.put(*LG2['tablet'], 'S')
g.put(0, 7, '#'); g.put(*LG2['entry'], '_')
g.puts([(1, 2), (1, 13), (20, 6)], 'r')
add('lg_moonpool', 'cave', g.rows())

if __name__ == '__main__':
    json.dump(OUT, open('_maps8_rows.json', 'w'), ensure_ascii=False)
    json.dump({'LG1': LG1, 'LG2': LG2}, open('_maps8_marks.json', 'w'))
    if '--none' not in sys.argv:
        for k, (kind, rows) in OUT.items():
            print(k, kind, len(rows[0]), 'x', len(rows))
            print('   ' + ''.join(str(x % 10) for x in range(len(rows[0]))))
            for y, r in enumerate(rows): print('%2d %s' % (y, r))
