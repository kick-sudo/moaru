// Focused boss trials: BOT.trial({starter:'muldal', mid:'padodal', levels:[27,30], n:5, map:'gym3', at:[7,2,'up'], flag:'badge3',
//   coverage:['땅','바위','격투'], items:{superpotion:5}, extra:[['teoneolgup',27]], flags:[...]})  -- extra teammates lead
BOT.trial = async (o) => {
  const B = BOT, D = G.data;
  const out = [];
  BOT.policy2();
  for (const lv of o.levels) {
    let wins = 0;
    for (let t = 0; t < o.n; t++) {
      G.titlePick = () => {};
      G.layers.length = 0; G.lock = 0;
      G.S = G.newState('한결', 'boy'); G.S.flags.started = 1; G.S.settings.text = 2; G.S.settings.sound = false;
      (o.flags || []).forEach(k => { G.S.flags[k] = 1; });
      G.S.flags.starter = o.starter;
      const mon = D.makeMon(o.mid, lv, { ivMin: 10 });
      G.S.party = [mon];
      B.coverage(o.coverage || []);
      for (const [id, l] of (o.extra || [])) G.S.party.unshift(D.makeMon(id, l === 0 ? lv : l, { ivMin: 5 }));
      for (const k in (o.items || {})) D.addItem(k, o.items[k]);
      G.S.visited = { iseul: 1 };
      G.startWorld(false);
      await B.waitIdle();
      const before = Object.assign({}, G.S.bag);
      await B.go(o.map, o.at[0], o.at[1], o.at[2]);
      await B.act();
      await B.waitIdle();
      const won = !!G.S.flags[o.flag];
      if (won) wins++;
      const used = Object.keys(before).filter(k => (G.S.bag[k] || 0) < before[k]).map(k => k + ':' + (before[k] - (G.S.bag[k] || 0))).join(',');
      out.push({ lv, won, team: G.S.party.map(m => m.id + ':' + m.lv + ':' + m.hp).join(' '), moves: mon.moves.map(x => x.id).join('/'), used });
      console.warn('TRIAL ' + JSON.stringify(out[out.length - 1]));
      if (o.dump) console.warn('LOG ' + B.log.slice(-o.dump).join(' / '));
    }
    console.warn('LEVEL ' + lv + ' wins ' + wins + '/' + o.n);
  }
  return out;
};
'trial ready'
