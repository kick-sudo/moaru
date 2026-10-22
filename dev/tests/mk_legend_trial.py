"""python3 _tests/mk_legend_trial.py [save ...] -> _tests/t_legend_trial_<save>.json : the legend battles on real chapter-3-end
saves (party, levels and bag as saved): 'catch' tries with the save's cubes and heal items, 'fight' tries without cubes."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
src = lambda f: open(os.path.join(HERE, f), encoding='utf-8').read()
names = sys.argv[1:] or ['ch3_bulguri', 'ch3_daram', 'ch3_muldal']
for name in names:
    save = open(os.path.join(ROOT, '_saves', name + '.json'), encoding='utf-8').read()
    plan = [['geumo', 6, 'catch'], ['wolbaek', 6, 'catch'], ['geumo', 3, 'fight'], ['wolbaek', 3, 'fight']]
    run = ("(async()=>{ const all = {}; try { for (const [id, n, mode] of %s) all[id + '_' + mode] = await LGT(window.__SAVE, id, n, mode); window.__R = all; }"
           " catch(e) { window.__R = { error: String(e && e.message || e), all }; } })(); 'started'") % json.dumps(plan)
    tag = name.replace('ch3_', '')
    spec = {'viewport': [1100, 900], 'speed': 12, 'maxlogs': 400, 'init': 'window.__SAVE = %s;' % json.dumps(save),
            'steps': [['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000], ['js', "G.titlePick = () => {}; 'title off'"],
                      ['js', src('bot.js')], ['js', src('story2.js')], ['js', src('legend_trial.js')], ['js', run],
                      ['waitfor', 'window.__R', 3000000], ['dump', 'JSON.stringify(window.__R, null, 1)', '_tests/r_legend_trial_%s.json' % tag]]}
    out = 't_legend_trial_%s.json' % tag
    json.dump(spec, open(os.path.join(HERE, out), 'w', encoding='utf-8'), ensure_ascii=False)
    print(out)
