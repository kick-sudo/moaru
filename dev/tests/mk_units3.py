"""python3 _tests/mk_units3.py -> _tests/t_ch3_units.json (chapter-3 unit checks on the real chapter-2 save of the grass starter)"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
src = lambda f: open(os.path.join(HERE, f), encoding='utf-8').read()
save = open(os.path.join(ROOT, '_saves', 'ch2_daram.json'), encoding='utf-8').read()
import sys
only = sys.argv[1:]
spec = {'viewport': [1100, 900], 'speed': 12, 'maxlogs': 400, 'init': 'window.__SAVE = %s; window.__ONLY = %s;' % (json.dumps(save), json.dumps(only or None)),
        'steps': [['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000], ['js', "G.titlePick = () => {}; 'title off'"],
                  ['js', src('bot.js')], ['js', src('story2.js')], ['js', src('story3.js')], ['js', src('units3.js')],
                  ['js', "(async()=>{ try { window.__U = await U3(window.__SAVE, window.__ONLY); } catch(e) { window.__U = {error: String(e && e.message || e)}; } })(); 'started'"],
                  ['waitfor', 'window.__U', 1200000],
                  ['dump', 'JSON.stringify(window.__U, null, 1)', '_tests/r3_units.json'],
                  ['shot', 't_ch3_units']]}
name = 't_ch3_units%s.json' % ('_part' if only else '')
spec['steps'][-2][2] = '_tests/r3_units%s.json' % ('_part' if only else '')
json.dump(spec, open(os.path.join(HERE, name), 'w', encoding='utf-8'), ensure_ascii=False)
print(name)
