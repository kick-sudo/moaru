// Legend battle numbers on real chapter-3-end saves: the party, levels and bag exactly as the save has them.
// Each try starts from the save (full health, as after the free rest at the sanctuary's shelter / camp) and talks to the
// legend at its sanctuary (observation already done, so the short approach → "더 다가간다").
// mode 'catch': heal when low, weaken, then throw the save's own cubes (gold first); mode 'fight': knock it out, no cubes.
// window.LGT(saveJSON, legend, n, mode) -> [{ result, turns, throws, cubes, gold, heals, faint, party, partyHp }]
window.LGT = async (save, id, n, mode) => {
  const B = BOT, D = G.data, W = G.world;
  const out = [];
  B.policy2();
  B.shop = () => {};
  const pol = G.autoBattle;
  const HEAL = Object.keys(D.ITEMS).filter(k => D.ITEMS[k].cat === 'heal' && D.ITEMS[k].heal);
  const at = id === 'geumo' ? ['lg_suncliff', 11, 2, 'up'] : ['lg_moonpool', 5, 7, 'up'];
  for (let t = 0; t < n; t++) {
    G.titlePick = () => {}; G.layers.length = 0; G.lock = 0;
    G.S = G.normalize(JSON.parse(save)); G.S.settings.text = 2; G.S.settings.sound = false;
    if (mode === 'fight') ['cube', 'goldcube', 'mastercube'].forEach(k => { delete G.S.bag[k]; });
    const s = G.legend.st(), r = s[id];
    r.heard = r.sighted = r.named = r.observed = r.trialReady = 1; if (id === 'wolbaek') r.present = 1;
    s.quests[id === 'geumo' ? 'LQ01' : 'LQ02'] = { started: 1, observe: 1, reward: 1 };
    s.sites.LGZ01 = { a: 2, b: 3, calm: 1, entered: 1, found: 1 }; s.sites.LGZ02 = { lit: 1, back: 1, entered: 1, found: 1 };
    D.healParty();
    G.startWorld(true); await B.waitIdle();
    await B.go(...at);
    const bag0 = Object.assign({}, G.S.bag);
    let turns = 0, heals = 0, throws = 0, faint = 0;
    G.autoBattle = (p, e, BT) => {
      if (e.id !== id) return pol(p, e, BT);
      turns++;
      const st = D.stats(p);
      // a player heals a lead that is about to fall before anything else
      if (p.hp < st.hp * 0.3) {
        const it = (st.hp - p.hp > 70 ? ['hyperpotion', 'superpotion', 'berry', 'potion'] : ['superpotion', 'hyperpotion', 'berry', 'potion']).find(k => G.S.bag[k] > 0);
        if (it) { D.useItem(it); p.hp = Math.min(st.hp, p.hp + D.ITEMS[it].heal); heals++; return { k: 'used' }; }
      }
      const a = pol(p, e, BT);
      if (a && a.k === 'ball') throws++;
      return a;
    };
    const swap0 = B.pickSwap;
    let swapL = null;
    B.pickSwap = () => { const Ly = G.topLayer(); if (Ly !== swapL) { swapL = Ly; faint++; } return swap0(); };
    B.catchIds = mode === 'catch' ? [id] : null;
    B.grinding = true;                       // stay in the fight (no running away); one switch to a better match is allowed
    B.answers = [0, 0];
    await B.act();
    await B.waitIdle();
    G.autoBattle = pol; B.pickSwap = swap0; B.catchIds = null; B.grinding = false;
    const used = k => (bag0[k] || 0) - (G.S.bag[k] || 0);
    const res = r.captured ? 'caught' : r.ko > 0 ? 'ko' : r.lost > 0 ? 'lost' : r.fled > 0 ? 'fled' : 'none';
    out.push({ result: res, turns, throws, cubes: used('cube'), gold: used('goldcube'), heals,
      healItems: HEAL.filter(k => used(k) > 0).map(k => k + ':' + used(k)).join(','), faint,
      party: G.S.party.map(m => m.id + ':' + m.lv).join(' '),
      partyHp: G.S.party.map(m => m.id + ':' + m.hp + '/' + D.stats(m).hp).join(' '), map: W.map.id });
    console.warn('LGT ' + id + ' ' + mode + ' ' + JSON.stringify(out[out.length - 1]));
  }
  return out;
};
'legend trial ready'
