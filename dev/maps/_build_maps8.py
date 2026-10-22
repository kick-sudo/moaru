"""maps8.js = _maps8_tpl.js + the generated legend-sanctuary rows (_maps8_rows.json from _mapgen8.py)."""
import json, subprocess
subprocess.run(['python3', '_mapgen8.py', '--none'], check=True, stdout=subprocess.DEVNULL)
R = {k: list(v[1]) for k, v in json.load(open('_maps8_rows.json')).items()}
tpl = open('_maps8_tpl.js').read()
assert '/*ROWS*/null' in tpl
body = '{\n' + ',\n'.join(f"    {k}: [\n" + ',\n'.join("      '" + r + "'" for r in R[k]) + "]" for k in ['lg_suncliff', 'lg_moonpool']) + '\n  }'
open('maps8.js', 'w').write(tpl.replace('/*ROWS*/null', body))
print('maps8.js', len(open('maps8.js').read()))
