# Chapter 3 layouts (흰부표 해로 → 해무나루 → 너울잠굴 → 바닷솔길 → 푸른숨시 → 침전수로 → 굽이강 → 강굽이 쉼터 → 제방들길 → 돌바퀴시 → 옛 배차소 → 높은물길 입구)
# Connection points (keep in sync with _maps6_tpl.js / _maps7_tpl.js):
#   searoute s (x10..13, surfing, after q24_start) <-> r13 n (x10..13)
#   r13 e (33,18..19) <-> m07 w (0,18..19)
#   r13 s (x0..15, surfing, after q25) <-> r14 n (x0..15)
#   m07 cave mouth 'm'(3,23) -> nw1 (14,18);  nw1 'x'(14..15,19) -> m07 (3,24);  nw1 top 'x'(14,0) <-> nw2 x(3,19);  nw2 east 'x'(31,9) <-> nw3 'm'(0,8)
#   nw3 e (29,7..8) <-> r14 w (0,7..8) (pier restored after q25)
#   r14 e (41,7..8) <-> m08 w (0,7..8)
#   m07 n (x15..20, riding the river mouth, after q30_start) <-> r15 s (x7..12)
#   r15 e (25,22..23) <-> h02 w (0,7..8)
#   h02 e (27,7..8, the low bridge after q30) <-> r16 w (0,7..8)
#   r16 e (43,7..8) <-> m09 w (0,9..10)
#   m09 w rows 3..4 (stairs) <-> r17 e (29,14..15);  m09 n (x30..31, after the haul stone moves) <-> r18 s (x12..13)
#   m08 정화소 door (26,5) -> d10a (5..6,18);  d10a 'H'(29,4) <-> d10b 'H'(14,15);  m09 D11 gate (28..29,22) <-> d11b gate (15..16,19)
#   haul supports '^' (seated stone '%'): m09 (28,3) for Q(31,2), m09 yard (16,25) for Q(12,25), r16 (15,5)/(33,10), r17 (28,5)
#   westpath w (0,8, after SQ3-07) <-> oldtrail e (19,5)
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
    def rows(s): return [''.join(r) for r in s.g]
    def building(s, x, y, w, h, doors):
        s.rect(x, y, w, h, '#')
        for d in doors: s.put(d, y + h - 1, 'D')

OUT = {}
def add(name, kind, rows):
    w = len(rows[0])
    for i, r in enumerate(rows): assert len(r) == w, (name, i, len(r), w, r)
    OUT[name] = (kind, rows)

# ---------------------------------------------------------------- R13 흰부표 해로 34x26 (sea lane, rescue islet, the island's west beach)
g = Grid(34, 26, 'O')
g.rect(18, 13, 16, 12, 's'); g.rect(22, 11, 12, 2, 's'); g.rect(28, 9, 6, 2, 's')     # the beach of 해무 island
g.vl(33, 9, 17, 'T'); g.vl(33, 20, 25, 'T'); g.hl(18, 33, 25, 'T'); g.rect(29, 9, 4, 1, 'T')
g.puts([(18, 13), (19, 13), (18, 14), (22, 11), (23, 11), (18, 24), (19, 24)], 'r')    # rocks along the waterline
g.rect(24, 14, 4, 3, 'Z'); g.rect(29, 20, 3, 3, 'Z'); g.rect(21, 21, 3, 2, 'Z'); g.rect(29, 13, 3, 2, 'Z')   # beach grass
g.hl(19, 33, 18, '='); g.hl(19, 33, 19, '=')                                         # beach path east to 해무나루
g.puts([(17, 18), (17, 19)], 'd')                                                     # landing planks (하선점)
g.put(18, 21, 'h')                                                                    # fishing mound
g.puts([(22, 15), (27, 23), (31, 12)], 'e')                                           # three shell beds (SQ3-02)
g.puts([(15, 23), (16, 23), (15, 24)], 'r')                                           # the cove where a buoy is snagged (SQ3-01)
g.puts([(20, 23), (23, 23)], 'r')                                                     # two ring posts on the beach
g.put(12, 18, 'r')                                                                    # observation buoy rock out at sea (SQ3-08)
g.rect(2, 7, 7, 5, 'r'); g.rect(3, 8, 5, 3, 's'); g.put(8, 9, 'd')                     # the rescue islet
g.put(7, 8, 'S'); g.put(20, 17, 'S')
add('r13', 'out', g.rows())

# ---------------------------------------------------------------- M07 해무나루 40x30 (island village)
g = Grid(40, 30, '.')
g.vl(0, 0, 29, 'T'); g.hl(0, 39, 0, 'T'); g.hl(0, 39, 29, 'T')
g.put(0, 18, '='); g.put(0, 19, '=')                                                  # west entrance from the beach
g.rect(34, 0, 6, 30, 'O')                                                              # the east sea
g.rect(14, 0, 1, 8, 'c'); g.rect(21, 0, 1, 8, 'c')                                     # river mouth banks
g.rect(15, 0, 6, 7, 'w'); g.hl(15, 20, 7, 'd')                                         # calm river mouth + its landing
g.rect(22, 1, 11, 6, 'w'); g.hl(22, 32, 2, 'R'); g.hl(22, 32, 5, 'R'); g.put(32, 1, 'd')   # 급류 강습장: two marked current bands and the far landing plank
g.hl(22, 33, 0, 'f'); g.vl(33, 0, 7, 'f'); g.hl(22, 33, 7, 'f'); g.rect(26, 7, 2, 1, 'd')
g.hl(1, 33, 18, '='); g.hl(1, 33, 19, '=')                                             # main street
g.vl(17, 8, 19, '='); g.vl(18, 8, 19, '=')
g.building(2, 10, 6, 4, [4, 5])        # center
g.building(9, 10, 5, 4, [11])          # shop
g.building(22, 9, 7, 5, [25])          # 구조대
g.building(29, 9, 5, 4, [31])          # 조개 관찰소
g.building(2, 15, 5, 3, [4])           # house
g.building(9, 15, 5, 3, [11])          # 우편 취급소
g.vl(25, 14, 17, '='); g.vl(31, 13, 17, '='); g.vl(4, 14, 14, '='); g.vl(5, 14, 14, '='); g.put(11, 14, '=')
g.rect(33, 20, 2, 9, 's'); g.hl(33, 38, 21, 'd'); g.hl(33, 38, 22, 'd')               # 정기선 부두 (two planks wide)
g.rect(1, 22, 32, 7, 's'); g.rect(1, 20, 4, 4, 'c'); g.put(3, 23, 'm')                 # south beach; the cave cliff with its mouth facing the beach
g.puts([(2, 26), (7, 27), (8, 25)], 'r'); g.vl(5, 20, 24, '='); g.hl(3, 5, 24, '=')
g.rect(12, 26, 21, 3, 'O'); g.put(20, 25, 'h')                                         # a sheltered cove with a fishing mound
g.puts([(15, 21), (24, 21), (31, 20)], 'l')
g.puts([(20, 9), (14, 17)], 'S'); g.put(9, 21, 'K')
g.puts([(28, 23), (31, 24)], 'r')
g.puts([(2, 1), (3, 1), (4, 1), (8, 2), (9, 1)], 'F'); g.rect(2, 3, 4, 3, 'y'); g.rect(3, 4, 2, 1, '.')
add('m07', 'out', g.rows())

# ---------------------------------------------------------------- D09 너울잠굴 1 · 입구 암반길 30x20 (cave): a fallen rock on the way up (F06), side alcoves
g = Grid(30, 20, '#')
g.put(14, 0, 'x'); g.put(14, 1, '_'); g.put(14, 2, 'J')                                  # exit up to the sluice hall, behind a fallen rock
g.rect(9, 3, 13, 1, '_'); g.rect(6, 4, 19, 3, '.'); g.rect(13, 4, 3, 3, '_'); g.put(14, 5, 'S')
g.puts([(8, 4), (22, 4)], 'i'); g.puts([(8, 6), (22, 6)], 'r')
g.rect(10, 7, 3, 1, '.'); g.rect(13, 7, 5, 1, '_'); g.rect(18, 7, 3, 1, '.')
g.rect(13, 8, 3, 7, '_'); g.rect(6, 8, 7, 1, '.'); g.rect(16, 8, 8, 1, '.')
g.put(7, 8, 'J'); g.put(23, 8, 'J')                                                      # side alcoves behind small fallen rocks
g.rect(3, 8, 4, 4, '_'); g.rect(24, 8, 4, 4, '_'); g.puts([(4, 10), (26, 10)], 'i')
g.rect(7, 12, 16, 3, '.'); g.rect(13, 12, 3, 3, '_'); g.puts([(10, 13), (19, 13)], 'r'); g.put(20, 12, 'i')
g.rect(13, 15, 5, 3, '_'); g.rect(13, 18, 5, 1, '_'); g.put(15, 18, 'S'); g.puts([(14, 19), (15, 19)], 'x')
add('nw1', 'cave', g.rows())

# ---------------------------------------------------------------- D09 너울잠굴 2 · 관측 수문 32x20 (cave, works): two stones into the channel seats, then the pier lever
g = Grid(32, 20, '#')
g.rect(2, 2, 11, 14, '_'); g.rect(2, 9, 5, 5, '.'); g.put(4, 11, 'i')                    # west hall
g.rect(13, 2, 2, 14, 'w'); g.puts([(13, 6), (14, 6)], 'u')                               # the channel and its two stone seats
g.rect(15, 2, 14, 14, '_'); g.rect(20, 10, 8, 5, '.'); g.put(24, 12, 'i')                 # east hall
g.put(22, 2, 'Y'); g.put(20, 2, 'S')                                                      # the old pier lever and its plate
g.rect(3, 16, 8, 3, '_'); g.put(3, 19, 'x'); g.put(11, 15, 'S')                          # entrance corridor · reset tablet
g.rect(29, 8, 2, 3, '_'); g.put(31, 9, 'x')                                              # out to the old pier
add('nw2', 'cave', g.rows())

# ---------------------------------------------------------------- D09 너울잠굴 3 · 옛 부두 30x16 (outdoors at the cave's sea mouth)
g = Grid(30, 16, 'O')
g.rect(0, 0, 30, 3, 'c'); g.rect(0, 3, 6, 13, 'c'); g.rect(6, 3, 2, 2, 'c')
g.rect(1, 6, 5, 5, 's'); g.put(0, 8, 'm')                                              # the cave mouth and a sandy ledge
g.hl(6, 28, 7, 'd'); g.hl(6, 28, 8, 'd')                                               # the old pier, two planks wide
g.puts([(11, 7), (11, 8), (17, 7), (17, 8), (23, 7), (23, 8)], 'O')                    # broken spans (restored by Q25)
g.rect(26, 3, 4, 13, 's'); g.vl(29, 3, 15, 'T'); g.put(29, 7, 's'); g.put(29, 8, 's')
g.puts([(26, 7), (26, 8), (27, 7), (27, 8), (28, 7), (28, 8)], 'd')
g.put(3, 7, 'S'); g.puts([(8, 5), (14, 10)], 'r'); g.put(27, 5, 'S')
add('nw3', 'out', g.rows())

# ---------------------------------------------------------------- R14 바닷솔길 42x16
g = Grid(42, 16, '.')
g.rect(0, 0, 16, 4, 'O'); g.rect(16, 0, 26, 1, 'T'); g.rect(0, 15, 42, 1, 'T'); g.vl(41, 0, 15, 'T')
g.rect(0, 4, 16, 2, 's'); g.puts([(5, 4), (6, 4)], 't')                                # the bright sand landing from the sea
g.vl(0, 6, 14, 'c'); g.put(0, 7, '='); g.put(0, 8, '=')
g.hl(1, 41, 7, '='); g.hl(1, 41, 8, '='); g.put(41, 7, '='); g.put(41, 8, '=')
g.rect(3, 10, 6, 4, 'z'); g.rect(13, 2, 5, 4, 'z'); g.rect(20, 10, 8, 4, 'z'); g.rect(31, 2, 6, 4, 'z'); g.rect(35, 10, 4, 4, 'z')
g.puts([(19, 3), (28, 2), (29, 3), (12, 11), (17, 12), (30, 11), (33, 13), (24, 4), (38, 4), (19, 1), (39, 2)], 'T')
g.rect(21, 2, 6, 4, '.'); g.put(22, 3, 'E'); g.puts([(21, 5), (26, 5)], 'b')           # 바닷솔 쉼터
g.put(2, 6, 'S'); g.put(40, 6, 'S'); g.put(16, 9, 'K'); g.put(9, 11, 'y')
add('r14', 'out', g.rows())

# ---------------------------------------------------------------- M08 푸른숨시 44x32 (white canals, the purification works)
g = Grid(44, 32, 'p')
g.vl(0, 0, 31, 'T'); g.hl(0, 43, 0, 'T'); g.vl(43, 0, 31, 'T')
g.put(0, 7, '='); g.put(0, 8, '=')
g.hl(1, 42, 7, '='); g.hl(1, 42, 8, '=')
g.rect(1, 13, 42, 2, 'w'); g.puts([(6, 13), (6, 14), (7, 13), (7, 14), (21, 13), (21, 14), (22, 13), (22, 14), (36, 13), (36, 14), (37, 13), (37, 14)], 'n')   # canal and bridges
g.rect(20, 1, 1, 6, 'w'); g.rect(20, 9, 1, 4, 'w'); g.puts([(20, 7), (20, 8)], 'n')     # the side canal from the works
g.building(2, 2, 6, 4, [4, 5])         # center
g.building(9, 2, 5, 4, [11])           # shop
g.building(22, 1, 9, 5, [26])          # 정화소 (D10)
g.building(32, 2, 6, 4, [34])          # 정화 안내실
g.rect(39, 1, 3, 5, 'C'); g.put(40, 5, 't')                                             # 환기탑 and its stairs (rooftop deck)
g.building(2, 16, 9, 6, [6, 7])        # gym 5 (보건 체육관)
g.building(13, 17, 5, 4, [15])         # 운송 접수소
g.building(25, 17, 5, 3, [27])         # house
g.building(32, 17, 5, 3, [34])         # house
g.rect(14, 9, 5, 3, 'F'); g.rect(23, 9, 4, 3, '.'); g.puts([(23, 10), (26, 10)], 'b')   # rest flowerbeds and the 휴식대 lawn

g.vl(6, 9, 12, '='); g.vl(7, 9, 12, '='); g.vl(6, 15, 15, '='); g.vl(7, 15, 15, '=')
g.vl(15, 15, 16, '='); g.vl(27, 15, 16, '='); g.vl(34, 15, 16, '='); g.vl(26, 6, 6, '=')
g.rect(1, 23, 42, 3, 'G'); g.rect(1, 26, 42, 6, 'O'); g.hl(1, 42, 31, 'O')              # the quay and the sea
g.rect(8, 26, 2, 3, 'd'); g.rect(30, 26, 2, 3, 'd')                                     # 정기선 부두 · 관찰 잔교
g.put(31, 28, 'h'); g.put(18, 25, 'i')                                                   # fishing mound · quayside observation pool
g.rect(38, 17, 4, 5, 'G'); g.vl(39, 17, 21, 'B'); g.vl(40, 17, 21, 'B')                  # 화차역 platform (rails north-south)
g.puts([(5, 23), (24, 23), (35, 23)], 'l'); g.puts([(12, 6), (19, 22), (37, 9)], 'S'); g.put(29, 23, 'K')
add('m08', 'out', g.rows())

# ---------------------------------------------------------------- D10 침전수로 1 · 취수층 32x20 (works): board across the intake basin, seat a stone in the bypass
g = Grid(32, 20, '#')
g.rect(1, 12, 10, 7, '_'); g.rect(1, 15, 4, 3, '.'); g.put(2, 16, 'i'); g.rect(5, 18, 2, 1, '_'); g.puts([(5, 19), (6, 19)], 'x')
g.rect(5, 9, 2, 3, '_'); g.rect(1, 3, 10, 6, '_'); g.rect(2, 4, 5, 3, '.'); g.put(3, 5, 'i')     # north-west platform
g.rect(11, 3, 14, 14, 'o')                                                                # the intake basin (board across)
g.rect(25, 3, 6, 14, '_'); g.rect(26, 13, 4, 3, '.'); g.put(28, 14, 'i')                  # east platform
g.put(28, 8, 'u'); g.put(29, 4, 'H')                                                      # the bypass seat · inspection hatch down
g.puts([(2, 12), (25, 16)], 'S')
add('d10a', 'cave', g.rows())

# ---------------------------------------------------------------- D10 침전수로 2 · 우회수로와 휴식대 30x18 (works): three valves in order, the rest platform
g = Grid(30, 18, '#')
g.rect(12, 13, 6, 3, '_'); g.put(14, 15, 'H')                                             # up to the intake level
g.rect(1, 8, 28, 5, '_')                                                                  # main gallery
g.rect(1, 2, 8, 6, '_'); g.rect(2, 4, 5, 3, '.'); g.put(3, 5, 'i'); g.put(4, 1, 'v')       # west alcove: valve 1 (취수)
g.rect(10, 1, 10, 7, 'o'); g.rect(13, 2, 4, 3, '_'); g.put(14, 1, 'v')                    # the filter island: valve 2 (거름틀), board over
g.rect(21, 2, 8, 5, '_'); g.put(25, 7, '_'); g.put(27, 1, 'v'); g.rect(22, 4, 4, 2, '.')    # east alcove behind a stone: valve 3 (휴식대)
g.rect(20, 13, 9, 3, '_'); g.rect(1, 13, 9, 3, '_')                                       # the rest platforms
g.puts([(2, 8), (12, 12)], 'S')
add('d10b', 'cave', g.rows())

# ---------------------------------------------------------------- R15 굽이강 26x44 (river: calm water, current bands, a waterfall at the head)
g = Grid(26, 44, '.')
g.rect(0, 0, 26, 44, 'T')
g.rect(7, 0, 6, 44, 'w')                                                               # the river (x7..12)
g.rect(5, 1, 10, 3, 'c'); g.rect(7, 0, 6, 4, 'W')                                       # the head: a waterfall over a cliff
for y in (36, 37, 29, 30, 18, 19, 10, 11): g.hl(7, 12, y, 'R')                          # current bands (urfing needs 급류타기)
g.rect(13, 20, 12, 4, '.'); g.hl(13, 24, 22, '='); g.hl(13, 24, 23, '='); g.puts([(13, 22), (13, 23)], 'd')   # the landing to 강굽이 쉼터
g.put(25, 22, '='); g.put(25, 23, '=')
g.rect(3, 31, 4, 4, '.'); g.puts([(6, 32), (6, 33)], 'd'); g.put(4, 32, 'S')              # a small west-bank landing with a rescue post
g.rect(13, 6, 4, 4, '.'); g.puts([(13, 7), (13, 8)], 'd'); g.put(15, 7, 'S')              # the last landing below the falls
g.rect(13, 21, 1, 1, 'd')
g.puts([(14, 21), (24, 21)], '.'); g.put(16, 20, 'S')
add('r15', 'out', g.rows())

# ---------------------------------------------------------------- H02 강굽이 쉼터 28x18 (camp + the small freight sluice)
g = Grid(28, 18, '.')
g.rect(0, 0, 28, 1, 'T'); g.rect(0, 17, 28, 1, 'T'); g.vl(0, 0, 17, 'T'); g.put(0, 7, '='); g.put(0, 8, '=')
g.hl(1, 9, 7, '='); g.hl(1, 9, 8, '=')
g.rect(3, 2, 5, 3, '#'); g.put(5, 5, 'a'); g.rect(4, 5, 3, 1, 'a')                      # tent (no door) and its campfire ground
g.rect(20, 0, 3, 18, 'w'); g.puts([(20, 7), (21, 7), (22, 7), (20, 8), (21, 8), (22, 8)], 'w')   # the side channel (bridge comes later)
g.rect(23, 0, 5, 18, '.'); g.vl(27, 0, 17, 'T'); g.put(27, 7, '='); g.put(27, 8, '=')
g.hl(23, 26, 7, '='); g.hl(23, 26, 8, '=')
g.rect(10, 2, 9, 14, 'G')                                                              # the inspection walkway yard
g.rect(10, 5, 9, 1, 'q'); g.put(14, 5, 'J')                                            # a fallen block on the walkway (smash)
g.rect(10, 10, 9, 1, 'q'); g.put(13, 10, 'u'); g.put(16, 10, 'q')                       # the stone seat for the sluice counterweight
g.puts([(19, 3), (19, 13)], 'v')                                                       # the sluice wheel and its gauge
g.hl(10, 18, 7, '='); g.hl(10, 18, 8, '=')
g.rect(2, 11, 6, 5, 'F'); g.rect(3, 12, 4, 3, '.'); g.put(9, 9, 'S'); g.put(24, 5, 'S'); g.put(9, 1, 'K')
add('h02', 'out', g.rows())

# ---------------------------------------------------------------- R16 제방들길 44x18 (levee paths; small cracked stones and big haul stones)
g = Grid(44, 18, '.')
g.rect(0, 0, 44, 1, 'T'); g.vl(43, 0, 17, 'T'); g.rect(0, 13, 44, 5, 'w'); g.rect(0, 12, 44, 1, 'L')
g.vl(0, 0, 11, 'T'); g.put(0, 7, '='); g.put(0, 8, '=')
g.hl(1, 43, 7, '='); g.hl(1, 43, 8, '='); g.put(43, 7, '='); g.put(43, 8, '=')
g.puts([(14, 7), (14, 8)], 'J')                                                        # small cracked stones on the levee road
g.rect(4, 1, 8, 5, 'z'); g.rect(20, 9, 10, 3, 'z'); g.rect(32, 1, 8, 4, 'z')
g.rect(16, 2, 3, 3, 'C'); g.puts([(17, 3), (17, 4)], '.'); g.put(17, 5, 'Q'); g.rect(16, 1, 3, 1, '.')   # a haul stone in front of an old levee store (F09)
g.rect(36, 9, 4, 3, '.'); g.vl(35, 9, 11, 'b'); g.vl(40, 9, 11, 'b'); g.put(37, 9, 'Q'); g.puts([(36, 9), (38, 9), (39, 9)], 'b')   # a side path down to the bank behind another haul stone
g.puts([(9, 10), (26, 3), (41, 10)], 'T'); g.put(2, 6, 'S'); g.put(42, 6, 'S'); g.put(30, 6, 'K'); g.put(12, 10, 'y')
g.puts([(38, 12), (39, 12)], '.'); g.put(38, 13, 'd'); g.put(39, 13, 'h')
g.puts([(15, 5), (33, 10)], '^')                                                        # rail supports for the haul stones
add('r16', 'out', g.rows())

# ---------------------------------------------------------------- M09 돌바퀴시 44x32 (stone warehouses, the circular cart track, the loading yard)
g = Grid(44, 32, 'G')
g.vl(0, 0, 31, 'T'); g.hl(0, 43, 31, 'T'); g.vl(43, 0, 31, 'T'); g.hl(0, 43, 0, 'c')
g.put(0, 9, '='); g.put(0, 10, '='); g.put(0, 3, 't'); g.put(0, 4, 't')                  # west road (from the levee) and the west stairs (언덕)
g.rect(1, 1, 6, 5, 'c'); g.rect(1, 3, 6, 2, 't')                                         # stairs up to the hill
g.hl(1, 42, 9, '='); g.hl(1, 42, 10, '=')
g.rect(30, 3, 2, 6, '='); g.put(30, 0, '='); g.put(31, 0, '=')                           # the north road to 높은물길
g.rect(24, 1, 12, 2, 'c'); g.put(31, 1, 'B'); g.put(31, 2, 'Q'); g.puts([(30, 0), (30, 1)], 'c'); g.put(28, 3, '^'); g.rect(36, 1, 7, 1, 'c')   # a one-track passage north   # the narrow north track, its marked haul stone and the empty rail support
g.building(2, 12, 6, 4, [4, 5])        # center
g.building(9, 12, 5, 4, [11])          # shop
g.building(9, 2, 8, 5, [13])           # 운송조합
g.building(19, 2, 7, 5, [22])          # 기록원
g.building(34, 2, 8, 6, [37, 38])      # gym 6 (하중 체육관)
g.building(2, 19, 5, 3, [4])           # house
g.building(16, 13, 6, 4, [18])         # house
g.rect(24, 12, 12, 8, 'B'); g.rect(26, 14, 8, 4, 'C'); g.rect(27, 15, 6, 2, 'G')         # the circular cart track around an old stone store
g.rect(38, 12, 5, 9, 'G'); g.vl(40, 12, 20, 'B'); g.vl(41, 12, 20, 'B')                   # 화차역
g.rect(8, 22, 14, 8, 'a'); g.puts([(12, 25)], 'Q'); g.put(16, 25, '^')                   # 적재장 (loading yard): practice stone and its support
g.rect(24, 22, 10, 8, 'C'); g.rect(25, 23, 8, 6, 'G'); g.put(28, 22, 'D'); g.put(29, 22, 'D')   # 옛 배차소 gate (D11)
g.vl(4, 16, 18, '='); g.vl(5, 16, 18, '='); g.vl(11, 16, 21, '='); g.vl(18, 17, 21, '='); g.vl(13, 7, 8, '='); g.vl(22, 7, 8, '=')
g.vl(37, 8, 8, '='); g.vl(38, 8, 8, '='); g.hl(11, 30, 21, '='); g.vl(23, 11, 21, '=')
g.puts([(8, 8), (20, 11), (33, 21), (2, 24)], 'l'); g.puts([(7, 8), (23, 11), (36, 11), (32, 3)], 'S'); g.put(35, 24, 'K')
add('m09', 'out', g.rows())

# ---------------------------------------------------------------- D11 옛 배차소 마당 32x20 (outdoors): fallen blocks, the dispatch track supports, the office
g = Grid(32, 20, 'G')
g.rect(0, 0, 32, 1, 'C'); g.rect(0, 19, 32, 1, 'C'); g.vl(0, 0, 19, 'C'); g.vl(31, 0, 19, 'C')
g.put(15, 19, 'D'); g.put(16, 19, 'D')                                                  # gate back to 돌바퀴시
g.rect(1, 16, 30, 3, 'G'); g.rect(2, 16, 6, 2, 'z'); g.rect(24, 16, 6, 2, 'z')            # the outer courtyard
g.hl(1, 30, 15, 'C'); g.puts([(15, 15), (16, 15)], 'J')                                  # inner wall, its gap blocked by fallen blocks
g.rect(1, 1, 30, 3, 'z'); g.rect(4, 2, 5, 1, 'G')                                        # the old stone yard (overgrown)
g.hl(1, 30, 5, 'B'); g.hl(1, 30, 6, 'B'); g.puts([(8, 5), (8, 6)], 'u')                  # the dispatch track and its two empty rail supports
g.building(11, 8, 10, 5, [15])                                                           # the dispatch office (records inside)
g.rect(2, 9, 7, 5, 'z'); g.rect(23, 9, 7, 5, 'z')
g.puts([(27, 7), (10, 17)], 'S')
add('d11b', 'out', g.rows())

# ---------------------------------------------------------------- R17 돌바퀴 언덕 30x22 (optional upland)
g = Grid(30, 22, '.')
g.rect(0, 0, 30, 1, 'T'); g.rect(0, 21, 30, 1, 'T'); g.vl(0, 0, 21, 'T'); g.vl(29, 0, 21, 'T')
g.put(29, 14, 't'); g.put(29, 15, 't')
g.hl(16, 28, 14, '='); g.hl(16, 28, 15, '='); g.vl(16, 4, 15, '='); g.hl(4, 16, 4, '=')
g.rect(2, 6, 10, 6, 'z'); g.rect(18, 2, 8, 6, 'z'); g.rect(4, 14, 8, 5, 'z'); g.rect(19, 17, 7, 3, 'z')
g.puts([(3, 2), (24, 10), (13, 16)], 'y'); g.puts([(13, 7), (21, 11), (7, 13)], 'T')
g.put(27, 13, 'S'); g.put(14, 3, 'K'); g.hl(25, 28, 3, 'T'); g.vl(25, 1, 2, 'T'); g.rect(26, 1, 3, 2, '.'); g.put(27, 3, 'Q'); g.put(28, 5, '^')   # a haul stone guards the ridge pocket
add('r17', 'out', g.rows())

# ---------------------------------------------------------------- R18 높은물길 입구 26x20 (to the first viewpoint)
g = Grid(26, 20, '.')
g.rect(0, 0, 26, 20, 'T')
g.rect(10, 0, 6, 6, 'W'); g.rect(8, 3, 2, 3, 'c'); g.rect(16, 3, 2, 3, 'c')             # the high falls (not this chapter)
g.vl(12, 6, 19, '='); g.vl(13, 6, 19, '=')
g.rect(4, 8, 8, 5, '.'); g.rect(5, 9, 5, 3, 'G'); g.put(7, 9, 'S')                        # 첫 안전 전망대
g.puts([(10, 9), (10, 10), (11, 10)], 'f')
g.rect(14, 12, 6, 4, '.'); g.puts([(15, 12), (17, 13), (16, 14), (18, 12)], 'F'); g.puts([(15, 6), (11, 15)], 'S')
g.rect(12, 18, 2, 2, '='); g.put(12, 19, 'T')
add('r18', 'out', g.rows())

# ---------------------------------------------------------------- 옛 샛길 20x10 (behind the big rock of 서쪽 돌담길; SQ3-07)
g = Grid(20, 10, '.')
g.rect(0, 0, 20, 1, 'T'); g.rect(0, 9, 20, 1, 'T'); g.vl(0, 0, 9, 'T'); g.vl(19, 0, 9, 'T')
g.put(19, 5, '='); g.hl(4, 18, 5, '='); g.vl(4, 2, 5, '='); g.rect(2, 1, 5, 2, '.')
g.puts([(3, 1)], 'S'); g.rect(8, 6, 6, 2, 'F'); g.puts([(9, 2), (14, 3), (16, 7)], 'T'); g.put(7, 7, 'y')
add('oldtrail', 'out', g.rows())

json.dump(OUT, open('_maps6_rows.json', 'w'), ensure_ascii=False)
if __name__ == '__main__':
    import sys
    only = sys.argv[1:]
    for k, (kind, rows) in OUT.items():
        if only and k not in only: continue
        print('==', k, kind, len(rows[0]), 'x', len(rows))
        print('    ' + ''.join(str(i % 10) for i in range(len(rows[0]))))
        for i, r in enumerate(rows): print('%3d %s' % (i, r))
