"""MOARU_SPELL_SKILLS=... MOARU_SPELL_CANDY=... python3 _tests/mk_spell.py [ch3 save] -> _tests/t_spell_skills.json
The skills spell on a new game and on a real chapter-3-end save: all nine exploration skills usable, the story's lessons and
quest steps untouched, the candy spell unchanged. The spell phrases are secret (the game keeps only their hash), so they are
read from the environment and never written into the repository."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
src = lambda f: open(os.path.join(HERE, f), encoding='utf-8').read()
spells = {'skills': os.environ.get('MOARU_SPELL_SKILLS'), 'candy': os.environ.get('MOARU_SPELL_CANDY')}
if not all(spells.values()):
    sys.exit('set MOARU_SPELL_SKILLS and MOARU_SPELL_CANDY to the spell phrases (they are not stored in the repository)')
name = sys.argv[1] if len(sys.argv) > 1 else 'ch3_daram'
save = open(os.path.join(ROOT, '_saves', name + '.json'), encoding='utf-8').read()
spec = {'viewport': [1100, 900], 'speed': 12, 'maxlogs': 200,
        'init': 'window.__SAVE = %s; window.__SPELLS = %s;' % (json.dumps(save), json.dumps(spells, ensure_ascii=False)),
        'steps': [['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000], ['js', "G.titlePick = () => {}; 'title off'"],
                  ['js', src('bot.js')], ['js', src('story2.js')], ['js', src('spell.js')],
                  ['js', "(async()=>{ try { window.__R = await USP(window.__SAVE); } catch(e) { window.__R = {error: String(e && e.message || e)}; } })(); 'started'"],
                  ['waitfor', 'window.__R', 900000],
                  ['dump', 'JSON.stringify(window.__R, null, 1)', '_tests/r_spell_skills.json']]}
json.dump(spec, open(os.path.join(HERE, 't_spell_skills.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('t_spell_skills.json')
