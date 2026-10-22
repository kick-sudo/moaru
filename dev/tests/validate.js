(() => {
  const out = [], D = G.data, M = G.MAPS, W = G.world;
  const ok = (c, msg) => { if (!c) out.push(msg); };
  for (const id in M) {
    const def = M[id];
    const w = def.rows[0].length, h = def.rows.length;
    def.rows.forEach((r, y) => ok(r.length === w, `${id}: row ${y} length ${r.length} != ${w}`));
    const m = W.getMap(id);
    const walk = (x, y) => { const t = m.tile(x, y); return t && !t.solid && !t.ledge; };
    const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
    (def.warps || []).forEach(wp => {
      ok(inb(wp.x, wp.y), `${id}: warp out of bounds ${wp.x},${wp.y}`);
      const tm = M[wp.to]; ok(tm, `${id}: warp to missing ${wp.to}`);
      if (tm) { const t2 = W.getMap(wp.to).tile(wp.tx, wp.ty); ok((t2 && !t2.solid) || wp.gated, `${id}: warp ${wp.x},${wp.y} -> ${wp.to} ${wp.tx},${wp.ty} lands on ${t2 ? 'solid' : 'nothing'}`); }
      const t = m.tile(wp.x, wp.y); ok(t && !t.solid, `${id}: warp tile ${wp.x},${wp.y} is solid`);
      if (tm) (tm.npcs || []).forEach(n => ok(n.cond || n.move || !(n.x === wp.tx && n.y === wp.ty), `${id}: warp -> ${wp.to} ${wp.tx},${wp.ty} lands on npc ${n.id}`));
      if (tm) ok(!(tm.blocks || []).some(b => b.x === wp.tx && b.y === wp.ty && !b.cond), `${id}: warp -> ${wp.to} ${wp.tx},${wp.ty} lands on a block`);
    });
    for (const side in (def.links || {})) for (const ln of [].concat(def.links[side])) {
      const tm = M[ln.to];
      ok(tm, `${id}: link ${side} to missing ${ln.to}`); if (!tm) continue;
      const t2m = W.getMap(ln.to); let pairs = 0;
      const tw = tm.rows[0].length, th = tm.rows.length;
      if (side === 'n' || side === 's') {
        const y = side === 'n' ? 0 : h - 1, ty = side === 'n' ? th - 1 : 0;
        for (let x = Math.max(0, ln.from ?? 0); x <= Math.min(w - 1, ln.until ?? w - 1); x++) { const a = m.tile(x, y), b = t2m.tile(x + (ln.dx || 0), ty); if (a && b && !a.solid && !b.solid) pairs++; }
      } else {
        const x = side === 'w' ? 0 : w - 1, tx = side === 'w' ? tw - 1 : 0;
        for (let y = Math.max(0, ln.from ?? 0); y <= Math.min(h - 1, ln.until ?? h - 1); y++) { const a = m.tile(x, y), b = t2m.tile(tx, y + (ln.dy || 0)); if (a && b && !a.solid && !b.solid) pairs++; }
      }
      ok(pairs > 0 || id === 'cave4' || ln.gated, `${id}: link ${side} -> ${ln.to} has no walkable pair`);
    }
    const occ = {};
    (def.npcs || []).forEach(n => {
      ok(inb(n.x, n.y), `${id}: npc ${n.id} out of bounds`);
      const t = m.tile(n.x, n.y); ok(t && (!t.solid || (n.swim && t.water)), `${id}: npc ${n.id} on solid ${m.at(n.x, n.y)} at ${n.x},${n.y}`);
      if (n.trainer) { n.trainer.team.forEach(([sp, lv, mv]) => { ok(D.MONS[sp], `${id}: ${n.id} team species ${sp}`); (mv || []).forEach(x => ok(D.MOVES[x], `${id}: ${n.id} move ${x}`)); }); }
      if (n.mon) ok(D.MONS[n.mon], `${id}: mon npc ${n.mon}`);
    });
    (def.items || []).forEach(it => { ok(D.ITEMS[it.id], `${id}: item id ${it.id}`); const t = m.tile(it.x, it.y); ok(t && !t.solid, `${id}: item ${it.id} on solid ${m.at(it.x, it.y)} at ${it.x},${it.y}`); });
    (def.boulders || []).forEach(b => { const t = m.tile(b.x, b.y); ok(t && !t.solid, `${id}: boulder ${b.id} on solid`); });
    // chapter 3: haul stones sit on 'Q' and their rail support is '^'
    (def.hauls || []).forEach(hl => { ok(def.rows[hl.y][hl.x] === 'Q', `${id}: haul ${hl.id} origin is '${def.rows[hl.y][hl.x]}' not Q`); ok(def.rows[hl.to[1]][hl.to[0]] === '^', `${id}: haul ${hl.id} support is '${def.rows[hl.to[1]][hl.to[0]]}' not ^`); });
    (def.triggers || []).forEach(tr => ok(inb(tr.x, tr.y), `${id}: trigger out of bounds`));
    Object.keys(def.objects || {}).forEach(k => { const [x, y] = k.split(',').map(Number); ok(inb(x, y), `${id}: object ${k} out of bounds`); });
    Object.keys(def.signs || {}).forEach(k => { const [x, y] = k.split(',').map(Number); ok(inb(x, y), `${id}: sign ${k} out of bounds`); });
    // every tile letter must be in the legend; every exit mat must lead somewhere
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = def.rows[y][x];
      ok(m.legend[c], `${id}: unknown tile '${c}' at ${x},${y}`);
      if (c === 'x' && m.kind !== 'out') ok((def.warps || []).some(wp => wp.x === x && wp.y === y), `${id}: exit mat at ${x},${y} without a warp`);
      if (c === 'D' && m.kind === 'out') ok((def.warps || []).some(wp => wp.x === x && wp.y === y) || (def.blocks || []).some(b => b.x === x && b.y === y), `${id}: door at ${x},${y} without a warp`);
    }
    // grass zones need encounter tables
    const zones = new Set();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const t = m.tile(x, y); if (t && t.grass) zones.add(t.grass); }
    zones.forEach(z => ok(D.ENC[id] && D.ENC[id][z], `${id}: grass zone ${z} has no encounter table`));
  }
  const CHS = [G.CH1, G.CH2, G.CH3].filter(Boolean);
  // every map item (MAP01-MAP12) is covered by some chapter's scopes
  Object.values(D.ITEMS).filter(it => it.map).forEach(it => ok(CHS.some(c => c.scopes && c.scopes[it.map]), `map item ${it.n} (${it.map}) has no scope`));
  // posts exist on marker tiles
  CHS.flatMap(c => c.posts || []).forEach(p => { const m = W.getMap(p.map); ok(m.at(p.x, p.y) === 'K', `post ${p.id} not on a K tile (${m.at(p.x, p.y)})`); });
  // chapter nodes cover all maps
  const covered = new Set(CHS.flatMap(c => c.nodes.flatMap(n => n.maps)));
  Object.keys(M).forEach(id => ok(covered.has(id), `map ${id} not in any chapter node`));
  CHS.forEach(c => c.nodes.forEach(n => n.maps.forEach(id => ok(M[id], `node ${n.id} lists missing map ${id}`))));
  CHS.forEach(c => Object.values(c.scopes || {}).flat().forEach(nid => ok(c.nodes.some(n => n.id === nid), `scope lists missing node ${nid}`)));
  CHS.forEach(c => c.edges.forEach(([a1, b1]) => ok(c.nodes.some(n => n.id === a1) && c.nodes.some(n => n.id === b1), `edge ${a1}-${b1} has a missing node`)));
  return out;
})()
