"""maps6.js / maps7.js = their templates + the generated chapter-3 rows (_maps6_rows.json from _mapgen5.py)."""
import json, subprocess
subprocess.run(['python3', '_mapgen5.py', '--none'], check=True, stdout=subprocess.DEVNULL)
R = {k: list(v[1]) for k, v in json.load(open('_maps6_rows.json')).items()}
PARTS = {
    'maps6.js': ('_maps6_tpl.js', ['r13', 'm07', 'nw1', 'nw2', 'nw3', 'r14']),
    'maps7.js': ('_maps7_tpl.js', ['m08', 'd10a', 'd10b', 'r15', 'h02', 'r16', 'm09', 'd11b', 'r17', 'r18', 'oldtrail']),
}
for out, (tpl_name, keys) in PARTS.items():
    tpl = open(tpl_name).read()
    assert '/*ROWS*/null' in tpl
    body = '{\n' + ',\n'.join(f"    {k}: [\n" + ',\n'.join("      '" + r + "'" for r in R[k]) + "]" for k in keys) + '\n  }'
    open(out, 'w').write(tpl.replace('/*ROWS*/null', body))
    print(out, len(open(out).read()))
