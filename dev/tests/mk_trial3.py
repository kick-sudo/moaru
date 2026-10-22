"""python3 _tests/mk_trial3.py -> _tests/t_trial3_g5.json, t_trial3_g6.json: repeated gym-5/6 leader fights for the three starters'
final forms (solo, and the fire starter with the water partner it recruits in the story run). Uses gymtrial.js (BOT.trial)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
src = lambda f: open(os.path.join(HERE, f), encoding='utf-8').read()
ITEMS = {'hyperpotion': 3, 'superpotion': 5, 'awake': 3, 'antidote': 3, 'parlyz': 2}
G5 = dict(map='gym5', at=[7, 2, 'up'], flag='badge5', coverage=['땅', '에스퍼', '바위', '전기'], items=ITEMS, n=5)
G6 = dict(map='gym6', at=[7, 2, 'up'], flag='badge6', coverage=['물', '풀', '땅', '격투'], items=ITEMS, n=5)
RUNS = {
    'g5hi': [dict(G5, starter='daram', mid='sumaek', levels=[47, 50]),
             dict(G5, starter='daram', mid='sumaek', levels=[42, 44], extra=[['jabukhwan', 0]])],
    'g6hi': [dict(G6, starter='bulguri', mid='hwasan', levels=[53, 56])],
    'g5': [dict(G5, starter='daram', mid='sumaek', levels=[42, 44]),
           dict(G5, starter='bulguri', mid='hwasan', levels=[42, 44]),
           dict(G5, starter='muldal', mid='neoul', levels=[42, 44])],
    'g6': [dict(G6, starter='daram', mid='sumaek', levels=[46, 48]),
           dict(G6, starter='bulguri', mid='hwasan', levels=[46, 48, 50]),
           dict(G6, starter='bulguri', mid='hwasan', levels=[46, 48], extra=[['haepum', 0]]),
           dict(G6, starter='muldal', mid='neoul', levels=[46, 48])],
}
for k, cfgs in RUNS.items():
    run = ("(async()=>{ const all = []; try { for (const c of %s) { const r = await BOT.trial(c); all.push({ cfg: c.mid + (c.extra ? '+' + c.extra.map(e => e[0]).join('+') : ''), r }); } window.__R = all; }"
           " catch(e) { window.__R = { error: String(e && e.message || e), all }; } })(); 'started'") % json.dumps(cfgs, ensure_ascii=False)
    spec = {'viewport': [1100, 900], 'speed': 12, 'maxlogs': 400,
            'steps': [['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000], ['js', "G.titlePick = () => {}; 'title off'"],
                      ['js', src('bot.js')], ['js', src('story2.js')], ['js', src('gymtrial.js')], ['js', run],
                      ['waitfor', 'window.__R', 3000000], ['dump', 'JSON.stringify(window.__R)', '_tests/r3_trial_%s.json' % k]]}
    json.dump(spec, open(os.path.join(HERE, 't_trial3_%s.json' % k), 'w', encoding='utf-8'), ensure_ascii=False)
    print('t_trial3_%s.json' % k)
