"""maps4.js / maps5.js = their templates + the generated chapter-2 rows (_maps4_rows.json from _mapgen4.py)."""
import json, subprocess
subprocess.run(['python3', '_mapgen4.py', '--none'], check=True, stdout=subprocess.DEVNULL)
R = {k: list(v[1]) for k, v in json.load(open('_maps4_rows.json')).items()}
PARTS = {
    'maps4.js': ('_maps4_tpl.js', ['reedford', 'harbor', 'backfield', 'tidedeck', 'oldmine', 'lh1', 'lh2', 'lh3', 'ridge']),
    'maps5.js': ('_maps5_tpl.js', ['tn1', 'tn2', 'tn3', 'memory', 'echohall', 'gardenroad', 'leafhyang', 'greenhouse', 'searoute']),
}
for out, (tpl_name, keys) in PARTS.items():
    tpl = open(tpl_name).read()
    assert '/*ROWS*/null' in tpl
    body = '{\n' + ',\n'.join(f"    {k}: [\n" + ',\n'.join("      '" + r + "'" for r in R[k]) + "]" for k in keys) + '\n  }'
    open(out, 'w').write(tpl.replace('/*ROWS*/null', body))
    print(out, len(open(out).read()))
