"""Build the chapter-3 bot scripts: python3 _tests/mk_story3.py  -> _tests/t_story3_<starter>[_variant].json
Each one loads a real finished chapter-2 save (_saves/ch2_<starter>.json, made by t_story2_<starter>_dump.json)
and plays chapter 3 through the real scripts with BOT.run3."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
src = lambda f: open(os.path.join(HERE, f), encoding='utf-8').read()
VARIANTS = {
    '': '{}',
    '_old': '{ oldSave: true, noSide: true }',      # a save written before chapter 3 existed (no q24_start)
    '_zero': '{ zero: true, noSide: true, gym5Lv: 50 }',   # 소지금 0, no shopping, no side quests, no catches (solo 숲맥 needs ~Lv.47+ for gym 5)
}
ONLY = {'_zero': ['daram'], '_old': ['muldal']}
# the side-quest 교본 are already owned in the chapter-2 saves; one run drops them to check the "first copy" branch
EXTRA = {'muldal': '{ dropTMs: true }'}
# the team plan a player would make for the chapter's water/ground opponents (JS, merged into the options)
PLAN = {
    # 화산양 is fire/rock: water and ground moves hit it four times over, so it recruits a water partner on the first sea route
    'bulguri': "{ partner3: async () => { await BOT.catchMon('r13', 'sea', ['pomal']); await BOT.grindAll('r13', 'sea', 37); BOT.lead('pomal'); }, lead6: 'pomal' }",
    # 숲맥 is grass/ground: gym 5's two poison/flying monsters are immune to its ground moves and resist its grass moves,
    # so it takes the electric partner the design names (나침돌 → 자북환, steel shrugs off poison) from the purification works
    'daram': "{ partner5: async () => { await BOT.catchMon('d10a', 1, ['nachimdol']); await BOT.grindAll('d10a', 1, 42); }, lead5: 'nachimdol' }",
}
NOPLAN = {'_zero'}   # the zero run plays with the chapter-2 team only (no catches)
for st in ['daram', 'bulguri', 'muldal']:
    save = open(os.path.join(ROOT, '_saves', 'ch2_%s.json' % st), encoding='utf-8').read()
    for suf, opts in VARIANTS.items():
        if suf in ONLY and st not in ONLY[suf]: continue
        tag = st + suf
        if not suf and st in EXTRA: opts = EXTRA[st]
        run = ("(async()=>{ try { window.__R = await BOT.run3(window.__SAVE, Object.assign(%s, %s, window.__OPTS || {})); }"
               " catch(e) { window.__R = {error: String(e && e.message || e), snap: BOT.snapshot(), log: BOT.log.slice(-12), steps: BOT.R && BOT.R.steps, stats: BOT.stats, party: G.S.party.map(m => m.id + ':' + m.lv)};"
               " console.warn('FAIL ' + JSON.stringify(window.__R)); } })(); 'started'") % ('{}' if suf in NOPLAN else PLAN.get(st, '{}'), opts)
        spec = {
            'viewport': [1100, 900], 'speed': 12, 'maxlogs': 3000,
            'init': 'window.__SAVE = %s;' % json.dumps(save),
            'steps': [
                ['wait', 1500],
                ['waitfor', "typeof G.titlePick === 'function'", 15000],
                ['js', "G.titlePick = () => {}; 'title off'"],
                ['js', src('bot.js')],
                ['js', src('story2.js')],
                ['js', src('story3.js')],
                ['js', run],
                ['waitfor', 'window.__R', 3600000],
                ['dump', 'JSON.stringify(window.__R)', '_tests/r3_%s.json' % tag],
                ['dump', 'JSON.stringify(G.S)', '_saves/ch3_%s.json' % tag],
                ['shot', 't_story3_' + tag],
            ]}
        json.dump(spec, open(os.path.join(HERE, 't_story3_%s.json' % tag), 'w', encoding='utf-8'), ensure_ascii=False)
        print('t_story3_%s.json' % tag)
