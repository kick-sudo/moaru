"""MOARU_SPELL_SKILLS=... python3 _tests/mk_spell_vis.py -> _tests/t_spell_vis.json : screenshots of the skills spell (ask, the goblin club with the
nine skill books, the lower-screen list, the summary) and the notebook's 탐험 기술 page afterwards, on a new game."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
PHRASE = os.environ.get('MOARU_SPELL_SKILLS') or sys.exit('set MOARU_SPELL_SKILLS (the phrase is not stored in the repository)')
LOAD = ("G.titlePick=()=>{}; G.layers.length=0; G.lock=0; G.S=G.newState('한결','boy'); G.S.flags.started=1; G.S.settings.text=2; G.S.settings.sound=false;"
        "G.S.party=[G.data.makeMon('bulguri',6)]; G.S.flags.starter='bulguri'; G.S.flags.q00=1; G.startWorld(false); G.world.enter('route1',6,14,'up',{noEvents:true}); 'loaded'")
steps = [['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000], ['js', LOAD], ['wait', 600],
         ['js', "G.run(() => G.menus.trySpell(%s)); 'cast'" % json.dumps(PHRASE, ensure_ascii=False)], ['wait', 1400], ['shot', 'sp1_ask'],
         ['key', 'KeyZ', 300], ['wait', 2300], ['shot', 'sp2_swing'], ['wait', 1500], ['shot', 'sp3_got'],
         ['keys', 'KeyZ', 1, 600], ['wait', 400], ['shot', 'sp4_line1'], ['keys', 'KeyZ', 2, 600], ['wait', 400], ['shot', 'sp5_line2'],
         ['keys', 'KeyZ', 8, 500], ['wait', 1200],
         ['js', "G.run(() => G.field.notebook(1)); 'note'"], ['wait', 700], ['shot', 'sp6_notebook'], ['keys', 'KeyX', 3, 300], ['wait', 300],
         ['js', "G.world.enter('town1', 7, 9, 'down', {noEvents:true}); 'town'"], ['wait', 600], ['shot', 'sp7_field']]
spec = {'viewport': [1100, 900], 'speed': 1, 'maxlogs': 40, 'steps': steps}
json.dump(spec, open(os.path.join(HERE, 't_spell_vis.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('t_spell_vis.json')
