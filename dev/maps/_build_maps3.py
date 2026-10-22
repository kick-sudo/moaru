"""maps3.js = _maps3_tpl.js + the generated rows (_maps3_rows.json) with a few hand patches."""
import json
R = {k: list(v[1]) for k, v in json.load(open('_maps3_rows.json')).items()}
def put(m, x, y, ch):
    r = R[m][y]; R[m][y] = r[:x] + ch + r[x + 1:]
# cave4: the east door is one tile tall (row 7); the tiles above and below are rock
for y in (6, 8):
    put('cave4', 20, y, '#'); put('cave4', 21, y, '#')
# 물울림시: no footbridge over the canal; the public ferry links the south quay, the north walk dock and the gym dock
for y in (11, 12, 13):
    put('mulullim', 9, y, 'w'); put('mulullim', 10, y, 'w')
put('mulullim', 8, 11, 'd')
# the main road ends where it meets the sluice office path (it used to run on into the tree line, which read like an exit),
# and a signpost there points at the reservoir stairs inside the office
for x in (28, 29, 30):
    put('mulullim', x, 21, '.')
put('mulullim', 28, 20, 'S')
# survey markers (현장점검 표식)
put('sandwind', 24, 6, 'K')
put('mistwalk', 18, 24, 'K')
# 달빛방 east wall: a ring-marked haul stone fills a new passage to 월은못 (legend LGZ02); its rail support stands inside
put('moonroom', 12, 4, 'Q'); put('moonroom', 13, 4, '_'); put('moonroom', 11, 2, '^')
tpl = open('_maps3_tpl.js').read()
assert '/*ROWS*/null' in tpl
body = '{\n' + ',\n'.join(f"    {k}: [\n" + ',\n'.join("      '" + r + "'" for r in rows) + "]" for k, rows in R.items()) + '\n  }'
open('maps3.js', 'w').write(tpl.replace('/*ROWS*/null', body))
print('maps3.js', len(open('maps3.js').read()))
