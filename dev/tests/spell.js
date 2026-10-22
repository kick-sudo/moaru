// The skills spell (a secret phrase typed into the save-code box): all nine exploration skills usable at once (a companion
// or a support helper for each, plus the gear), while the story's own lessons and quest steps still play as written.
// The phrases are not kept in the repository (the game only holds their hash): mk_spell.py passes them in as
// window.__SPELLS = { skills, candy } from environment variables.
// Needs bot.js + story2.js. window.USP(ch3SaveJSON) -> { pass: [...], fail: [...], log: {...} }
window.USP = async (save3) => {
  const B = BOT, D = G.data, W = G.world, F = G.field, M = G.menus;
  const R = { pass: [], fail: [], log: {} };
  const ok = (c, name, info) => { (c ? R.pass : R.fail).push(name + (info !== undefined ? ' :: ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); return c; };
  const settle = async () => { await B.waitIdle(); await B.sleep(60); await B.waitIdle(); };
  const T = async (name, fn) => {
    console.warn('USP ' + name);
    try { await fn(); } catch (e) { R.fail.push(name + ' :: EXC ' + String(e && e.message || e).slice(0, 300)); }
    try { await B.waitIdle(30000); } catch (e) { R.fail.push(name + ' :: stuck after the test'); }
    B.answers = []; G.layers.length = 0; G.lock = 0;
  };
  const said = n => B.log.slice(-(n || 3)).join(' | ');
  const SK = F.ORDER, GEAR = ['board', 'seaboard', 'bridle', 'harness'];
  const lessonFlags = () => SK.filter(sk => G.S.flags['f_' + sk]);
  // typed into the save-code box: the same call the settings menu makes
  const cast = async (phrase, answers) => {
    B.answers = (answers || []).slice();
    let r; await G.run(async () => { r = await M.trySpell(phrase); }); await settle();
    return r;
  };
  const SP = window.__SPELLS || {};
  if (!SP.skills || !SP.candy) return { pass: [], fail: ['no spell phrases given (window.__SPELLS)'], log: {} };
  const spaced = SP.skills.split('').join(' ') + '!';     // spaces and punctuation are ignored when matching
  B.policy2(); B.shop = () => {};

  await T('new_game', async () => {
    G.titlePick = () => {}; G.layers.length = 0; G.lock = 0;
    G.S = G.newState('한결', 'boy'); G.S.flags.started = 1; G.S.settings.text = 2; G.S.settings.sound = false;
    G.S.party = [D.makeMon('bulguri', 6)]; G.S.flags.starter = 'bulguri'; G.S.flags.q00 = 1;
    G.startWorld(false); await settle();
    ok(M.skillSpellTodo().length === 9 && !SK.some(F.unlocked), 'a new game: nothing learned yet');
    ok(await cast(SP.skills.slice(0, -2)) === false, 'a wrong phrase is just an unreadable save code');
    ok(await cast(SP.skills + '!', [1]) === true && !SK.some(F.unlocked) && !G.S.flags.spell_skills, '"그만둔다" changes nothing');
    const r = await cast(spaced, [0]);
    ok(r === true && SK.every(F.unlocked) && SK.every(sk => F.actor(sk)), 'all nine usable, each with someone to do it', SK.map(sk => sk + ':' + (F.actor(sk) || {}).name));
    ok(GEAR.every(k => G.S.bag[k] === 1), 'gear in the bag (물판·해상 안정판·고정끈·하네스)', GEAR.map(k => k + ':' + G.S.bag[k]));
    ok(!lessonFlags().length && G.S.flags.spell_skills === 1, 'no lesson flag (f_*) written, only spell_skills', lessonFlags());
    const lead = G.S.party[0];
    ok(['vine', 'push', 'smash', 'haul'].every(sk => F.knows(lead, sk)) && !F.knows(lead, 'ripple'), 'the fire starter learns what it can (덩굴·밀기·깨기·운반)', lead.field);
    const L = G.S.loans || {};
    ok(L.echo === 'gwibami' && L.ripple === 'muljjori' && L.magnet === 'nachimdol' && L.surf === 'yeoulgwon' && L.current === 'haepum', 'the rest by free support helpers', L);
    ok(!G.S.party.concat(G.S.box).some(m => Object.values(L).includes(m.id)) && !Object.values(L).some(id => G.S.dex.caught[id] || G.S.dex.seen[id]), 'helpers never join the team or the dex');
    ok(said(8).includes('탐험 기술 9가지를 모두') && said(8).includes('익혔다!') && said(8).includes('지원 동료') && said(8).includes('받았다!'), 'the summary names learners, helpers and gear', said(5));
    ok(await cast(SP.skills) === true && said(1).includes('이미 모두'), 'a second cast: "already usable"', said(1));
    R.log.newGame = { field: lead.field, loans: L, bag: GEAR.map(k => G.S.bag[k]) };

    // the lessons still play with their quest steps: 하람 (Q02 덩굴) ...
    G.S.flags.q02_start = 1;
    await B.talk('leafshade', 8, 11, 'up');
    ok(G.S.flags.f_vine === 1 && B.log.slice(-6).join(' ').includes('[덩굴 정리]'), '하람\'s vine lesson still plays and writes f_vine', said(2));
    await B.go('leafshade', 10, 10, 'up'); B.answers = [0]; await B.act();
    ok(W.map.at(10, 9) !== 'V' && G.S.flags.q02_v1 === 1, 'a training vine cleared (the quest step counts)', W.map.at(10, 9));
    // ... and 리안 (Q10 잔물타기): the pool crossing only counts after the lesson
    G.S.flags.q09 = 1; G.S.flags.badge2 = 1;
    await B.go('mulullim', 23, 8, 'right'); B.answers = [0]; await B.act();
    ok(W.surfing && W.surfing.id === 'muljjori', 'the spell board works with the support 물쫄이 before the lesson', W.surfing);
    for (let i = 0; i < 7 && W.surfing; i++) await B.walk('right', 1);
    ok(!G.S.flags.q10, 'crossing before the lesson does not complete Q10', G.S.flags.q10);
    await B.talk('mulullim', 23, 8, 'left');
    ok(G.S.flags.f_ripple === 1 && G.S.flags.q10_ready === 1, '리안\'s ripple lesson still plays (q10_ready)', said(2));
    ok(G.S.bag.board === 1 && !(G.S.spellGear || []).includes('board') && (G.S.spellGear || []).length === 3, 'the lesson\'s board is the one already in the bag (no second copy)', [G.S.bag.board, G.S.spellGear]);
    await B.go('mulullim', 23, 8, 'right'); B.answers = [0]; await B.act();
    for (let i = 0; i < 7 && !G.S.flags.q10; i++) await B.walk('right', 1);
    ok(G.S.flags.q10 === 1, 'then the crossing completes Q10 as usual');
    // story gates stay: the chapter-3 yard stones wait for 도담's lesson, the sanctuary stones for 3장
    await B.go('m09', 13, 25, 'left'); B.answers = [0]; await B.act();
    ok(!F.hauled('m09', 'yard') && said(1).includes('도담의 수업'), 'the m09 yard stone still waits for the Q33 lesson', said(1));
    await B.go('ridge', 5, 24, 'left'); B.answers = [0]; await B.act();
    ok(!F.hauled('ridge', 'lg_sun') && said(1).includes('높은물길 조사'), 'the 햇귀절벽 stone still waits for chapter 3', said(1));
    // the save code keeps it
    const back = G.normalize(M.decode(M.encode()));
    ok(back.flags.spell_skills === 1 && GEAR.every(k => back.bag[k] === 1) && back.loans.echo === 'gwibami', 'the save code keeps the spell, gear and helpers');
  });

  await T('chapter3_save', async () => {
    G.titlePick = () => {}; G.layers.length = 0; G.lock = 0;
    G.S = G.normalize(JSON.parse(save3)); G.S.settings.text = 2; G.S.settings.sound = false;
    G.startWorld(true); await settle();
    const todo = M.skillSpellTodo(), before = JSON.stringify(G.S.flags);
    ok(todo.length > 0 && todo.length < 9, 'a chapter-3 save only misses a few', todo);
    await cast(SP.skills, [0]);
    ok(SK.every(sk => F.unlocked(sk) && F.actor(sk)) && !M.skillSpellTodo().length, 'all nine usable afterwards', SK.map(sk => sk + ':' + (F.actor(sk) || {}).name));
    const flagsAfter = JSON.parse(JSON.stringify(G.S.flags)); delete flagsAfter.spell_skills;
    ok(JSON.stringify(flagsAfter) === before, 'no other flag changed');
    R.log.ch3 = { todo, actors: SK.map(sk => sk + ':' + (F.actor(sk) || {}).name) };
  });

  await T('candy_still_works', async () => {
    const n0 = G.S.bag.candy || 0;
    ok(await cast(SP.candy) === true && G.S.bag.candy === Math.min(99, n0 + 99), 'the candy spell still fills the pouch', [n0, G.S.bag.candy]);
  });
  return R;
};
'spell tests ready'
