# layout generator for the chapter-1 maps of part 3 (caves, 모래바람길, 물울림시, 물안개 산책길, 저수로)
import json
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
    def frame(s, ch): s.rect(0, 0, s.w, 1, ch); s.rect(0, s.h - 1, s.w, 1, ch); s.rect(0, 0, 1, s.h, ch); s.rect(s.w - 1, 0, 1, s.h, ch)
    def rows(s): return [''.join(r) for r in s.g]
    def building(s, x, y, w, h, doors):
        s.rect(x, y, w, h, '#')
        for d in doors: s.put(d, y + h - 1, 'D')
OUT = {}

# ---------------- 달숨동굴 입구층 (cave1) 24x18: bright, gentle
g = Grid(24, 18, '#')
g.rect(10, 13, 3, 4, '_'); g.put(11, 17, 'x')            # mouth corridor
g.rect(4, 8, 16, 6, '.')                                    # central hall
g.rect(8, 10, 7, 2, '_'); g.vl(11, 10, 13, '_')              # worn path through the hall
g.rect(3, 2, 6, 5, '.'); g.rect(5, 6, 2, 2, '.')             # west chamber
g.rect(16, 4, 3, 4, '.')                                    # passage north-east
g.rect(13, 2, 9, 3, '.'); g.hl(15, 23, 3, '_')               # upper chamber, path to the east exit
g.puts([(7, 3)], 'k'); g.puts([(6, 9), (17, 11), (14, 3)], 'r')
g.rect(4, 11, 3, 2, ','); g.rect(17, 8, 3, 2, ',')
g.puts([(13, 14), (14, 14)], 'c'); g.put(14, 15, 'X')       # rails of the cart lift at the entrance
OUT['cave1'] = ('cave', g.rows())

# ---------------- 반향층 (cave2) 32x20: dark; two stones bridge the chasm, a side stone hides the moonlit room
g = Grid(32, 20, '#')
g.rect(1, 8, 5, 5, '_'); g.put(2, 7, 'S'); g.rect(0, 10, 1, 1, '_')      # entrance landing (west edge row 10)
g.rect(6, 5, 11, 9, '.')                                                  # main room x6..16, y5..13
g.rect(6, 9, 11, 1, '_')                                                  # row 9 is the push lane
g.rect(7, 11, 3, 3, 'm')                                                  # mushroom grove
g.puts([(9, 7), (14, 12)], 'r')
g.rect(17, 9, 1, 1, '_'); g.puts([(18, 9), (19, 9)], 'u'); g.rect(20, 9, 11, 1, '_'); g.rect(31, 9, 1, 1, '_')   # chasm and the far corridor
g.rect(21, 7, 6, 5, '.'); g.hl(20, 30, 9, '_')                            # small cavern past the chasm
g.puts([(24, 8)], 'k')
# north niche and the moonlit corridor
g.vl(5, 4, 4, '_'); g.rect(5, 4, 1, 1, '_'); g.vl(5, 4, 5, '_')            # niche below the side stone (reached from the room's NW corner)
g.rect(2, 3, 4, 1, '_'); g.put(5, 2, '_'); g.put(2, 3, 'H')               # corridor row 3 and alcove (5,2); ladder at (2,3)
g.put(5, 3, '_')
# south: the patterned wall that answers echoes
g.vl(10, 14, 15, '_'); g.puts([(10, 16), (11, 16)], 'e'); g.rect(10, 17, 2, 1, '_'); g.put(11, 18, 'H')
g.put(11, 16, 'e'); g.put(10, 16, 'e'); g.rect(11, 14, 1, 2, '#')
OUT['cave2'] = ('cave', g.rows())

g = Grid(14, 10, '#')
g.rect(2, 1, 10, 7, 'l'); g.rect(6, 7, 3, 1, '_'); g.put(7, 8, 'H'); g.puts([(3, 2), (10, 6)], 'r')
OUT['moonroom'] = ('cave', g.rows())
g = Grid(12, 9, '#')
g.rect(2, 1, 8, 6, '_'); g.put(6, 7, 'H'); g.puts([(3, 2), (8, 2)], 'k')
OUT['echoroom'] = ('cave', g.rows())

# ---------------- 작업장 (cave3) 28x16: 새길상회 worksite, no wild monsters
g = Grid(28, 16, '#')
g.rect(0, 8, 9, 1, '_'); g.rect(1, 7, 8, 3, '_')                          # west corridor (rest point)
g.rect(9, 3, 18, 10, '_'); g.hl(9, 27, 8, '_')                            # worksite floor, exit row 8
g.hl(10, 25, 5, 'c'); g.vl(18, 5, 11, 'c')
g.puts([(11, 3), (12, 3), (24, 11), (25, 11), (15, 11)], 'X')            # crates
g.puts([(20, 3), (22, 3), (13, 12)], 'u')                                 # pits where resonance stone was cut out
g.puts([(9, 3), (26, 3), (9, 12), (26, 12)], '#')
OUT['cave3'] = ('cave', g.rows())

# ---------------- 동쪽 출구 (cave4) 22x14: the resonance pedestal
g = Grid(22, 14, '#')
g.rect(0, 7, 3, 1, '.'); g.rect(1, 3, 19, 8, '.')
g.rect(8, 4, 7, 5, '_'); g.put(11, 5, 'k')                               # pedestal
g.rect(20, 6, 1, 3, 'X'); g.rect(21, 6, 1, 3, 'X')                        # sealed exit
g.puts([(4, 4), (16, 9), (6, 9)], 'r'); g.hl(16, 19, 10, 'c'); g.put(20, 10, '#')
OUT['cave4'] = ('cave', g.rows())

# ---------------- 모래바람길 (sandwind) 36x16
g = Grid(36, 16, 's')
g.frame('T'); g.rect(0, 0, 2, 16, 'c'); g.put(1, 7, 'm'); g.put(0, 7, 'm')
g.rect(2, 1, 14, 6, 'z'); g.rect(3, 9, 9, 5, 'z')                       # dry grass (또아리)
g.rect(20, 2, 11, 4, 'Z'); g.rect(22, 11, 9, 3, 'Z')                    # sand-bank grass (모래콩)
g.hl(2, 33, 7, '='); g.hl(2, 33, 8, '=')                                  # the old stone road
g.rect(14, 10, 7, 4, 'w'); g.rect(17, 11, 2, 2, 's')                    # puddle with a sand bank
g.put(10, 3, 'y'); g.puts([(6, 12), (27, 4), (13, 2)], 'r')
g.rect(32, 1, 2, 14, 'w'); g.rect(32, 7, 2, 2, 'n')                     # side channel and the dry stone bridge
g.rect(34, 7, 2, 2, '='); g.put(35, 6, 'T'); g.put(35, 9, 'T')
OUT['sandwind'] = ('out', g.rows())

# ---------------- 물울림시 (mulullim) 32x26
g = Grid(32, 26, '.')
g.frame('T')
g.rect(0, 11, 32, 3, 'w')                                               # the canal
g.rect(20, 0, 2, 11, 'w')                                               # branch channel splitting the north bank
g.rect(9, 11, 2, 3, 'n')                                                # central stone bridge
g.rect(9, 0, 2, 11, '=')                                                # road north to the lab
g.building(2, 2, 5, 4, [4]); g.building(13, 2, 5, 4, [15])              # north-west houses
g.hl(4, 8, 6, '='); g.hl(11, 15, 6, '=')
g.building(23, 2, 7, 4, [26])                                           # gym (north-east quarter, ferry only)
g.hl(22, 30, 6, '.'); g.hl(23, 29, 7, 'f')
g.rect(24, 8, 5, 2, 'w'); g.puts([(23, 8), (23, 9), (29, 8), (29, 9)], 'd')   # the safe pool and its two docks
g.hl(22, 30, 10, '.'); g.put(24, 10, 'd'); g.put(24, 11, 'd')            # ferry dock (north-east)
g.puts([(6, 14), (6, 13)], 'd')                                         # ferry dock (south-west)
g.building(2, 16, 6, 4, [4, 5]); g.building(11, 16, 5, 4, [13]); g.building(18, 16, 4, 4, [19])
g.building(26, 15, 4, 4, [27])                                          # sluice house: stairs down to the reservoir
g.hl(0, 30, 21, '='); g.vl(9, 14, 21, '='); g.vl(10, 14, 21, '=')
g.hl(4, 5, 20, '='); g.vl(13, 20, 21, '='); g.vl(19, 20, 21, '='); g.vl(27, 19, 21, '=')
g.puts([(24, 17), (24, 22)], 'P'); g.puts([(2, 23), (16, 23), (29, 23)], 'F'); g.puts([(7, 8), (16, 8), (3, 9)], 'F')
g.rect(31, 11, 1, 3, 'R'); g.put(31, 14, 'X'); g.put(30, 14, '.')      # rapids past the gate
g.put(0, 21, '='); g.put(0, 22, '=')
OUT['mulullim'] = ('out', g.rows())

# ---------------- 물안개 산책길 (mistwalk) 24x30
g = Grid(24, 30, '.')
g.frame('T')
g.rect(1, 1, 22, 4, 'w'); g.rect(11, 2, 3, 1, 'o'); g.rect(6, 1, 2, 2, 'o'); g.rect(17, 2, 2, 1, 'o')
g.rect(12, 2, 2, 1, '.')                                                 # lotus island (the item)
g.building(8, 6, 8, 4, [11, 12])                                         # 수문연구소
g.rect(1, 5, 22, 1, '.')
g.vl(11, 10, 29, '='); g.vl(12, 10, 29, '='); g.hl(9, 14, 10, '=')
g.rect(2, 12, 7, 6, 'g'); g.rect(2, 20, 6, 6, 'g')                       # shade grass (잎뿌리, 꿈도치)
g.rect(16, 13, 6, 7, 'w'); g.rect(14, 12, 2, 9, 'j'); g.rect(16, 20, 6, 3, 'j')   # pond and the reeds (방울싹)
g.puts([(16, 16), (17, 16)], 'd')                                        # test dock
g.puts([(4, 18), (19, 25), (3, 27)], 'F'); g.put(20, 8, 'y'); g.puts([(5, 8), (18, 10)], 'r')
g.rect(0, 29, 24, 1, 'T'); g.rect(9, 29, 2, 1, '='); g.rect(11, 29, 2, 1, 'T')
g.vl(9, 26, 28, '='); g.vl(10, 26, 28, '='); g.hl(9, 12, 26, '=')
OUT['mistwalk'] = ('out', g.rows())

# ---------------- 저수로 (reservoir) 26x18: masonry platforms, channels, one vine, one stone, the main valve
g = Grid(26, 18, '#')
g.rect(1, 14, 12, 3, '_'); g.put(2, 15, 't')                              # entrance platform (stairs up at (2,15))
g.rect(1, 12, 24, 2, 'w')                                                # wide channel
g.rect(10, 12, 2, 2, '_')                                                # walkway across it
g.rect(1, 6, 24, 6, '_')                                                 # middle deck
g.rect(14, 6, 2, 6, 'w'); g.puts([(14, 9), (15, 9)], 'u')                 # channel with a gap: one stone bridges it... two slots
g.put(15, 9, 'u'); g.put(14, 9, 'u')
g.rect(6, 6, 1, 6, '#'); g.put(6, 8, 'V')               # a vine across the inner gate
g.rect(1, 1, 24, 4, '_'); g.rect(1, 5, 24, 1, '#'); g.rect(20, 5, 2, 1, 't')   # valve room up the stairs
g.put(22, 2, 'v'); g.rect(3, 2, 2, 1, 'g')
g.put(13, 15, '_'); g.rect(13, 14, 1, 3, '#')
OUT['reservoir'] = ('cave', g.rows())

json.dump(OUT, open('_maps3_rows.json', 'w'), ensure_ascii=False)
print('ok', {k: (len(v[1][0]), len(v[1])) for k, v in OUT.items()})
