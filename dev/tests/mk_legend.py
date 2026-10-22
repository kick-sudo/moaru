"""python3 _tests/mk_legend.py [save] [test ...] -> _tests/t_legend[_save].json  (legend checks on a real chapter-3-end save)"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
src = lambda f: open(os.path.join(HERE, f), encoding='utf-8').read()
args = sys.argv[1:]
name = args[0] if args and args[0].startswith('ch') else 'ch3_bulguri'
only = [a for a in args if not a.startswith('ch')]
save = open(os.path.join(ROOT, '_saves', name + '.json'), encoding='utf-8').read()
tag = name.replace('ch3_', '') + ('_' + '_'.join(only) if only else '')
spec = {'viewport': [1100, 900], 'speed': 12, 'maxlogs': 300, 'init': 'window.__SAVE = %s; window.__ONLY = %s;' % (json.dumps(save), json.dumps(only or None)),
        'steps': [['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000], ['js', "G.titlePick = () => {}; 'title off'"],
                  ['js', src('bot.js')], ['js', src('story2.js')], ['js', src('legend.js')],
                  ['js', "(async()=>{ try { window.__R = await ULG(window.__SAVE, window.__ONLY); } catch(e) { window.__R = {error: String(e && e.message || e)}; } })(); 'started'"],
                  ['waitfor', 'window.__R', 1500000],
                  ['dump', 'JSON.stringify(window.__R, null, 1)', '_tests/r_legend_%s.json' % tag],
                  ['shot', 't_legend_%s' % tag]]}
out = 't_legend_%s.json' % tag
json.dump(spec, open(os.path.join(HERE, out), 'w', encoding='utf-8'), ensure_ascii=False)
print(out)
