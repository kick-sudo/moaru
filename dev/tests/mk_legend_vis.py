"""python3 _tests/mk_legend_vis.py [save] -> _tests/t_legend_vis.json : screenshots of the legend scenes, sanctuaries, battles,
dex / summary / notebook pages and the overworld minis (real game screens, both DS screens side by side)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
name = sys.argv[1] if len(sys.argv) > 1 else 'ch3_bulguri'
save = open(os.path.join(ROOT, '_saves', name + '.json'), encoding='utf-8').read()
LOAD = ("G.titlePick=()=>{}; G.layers.length=0; G.lock=0; G.S=G.normalize(JSON.parse(window.__SAVE)); G.S.settings.text=2; G.S.settings.sound=false;"
        "G.startWorld(true); 'loaded'")
def go(m, x, y, d): return ['js', f"G.layers.length=0; G.lock=0; G.world.enter('{m}',{x},{y},'{d}'); 'at {m}'"]
def run(expr): return ['js', f"G.run(() => {expr}); 'run'"]
def clear(): return ['js', "G.layers.length=0; G.lock=0; G.scene=G.world.scene; 'clear'"]
GEUMO = "{id:'geumo',lv:50,exp:125000,iv:[10,10,10,10,10,10],status:null,moves:[{id:'sunfire',pp:5},{id:'blaze',pp:10},{id:'dive',pp:15},{id:'flamewheel',pp:25}],uid:9091,hp:150}"
WOLB = "{id:'wolbaek',lv:50,exp:125000,iv:[10,10,10,10,10,10],status:null,moves:[{id:'psybeam',pp:20},{id:'calm',pp:20},{id:'shadowball',pp:15},{id:'hypnosis',pp:20}],uid:9092,hp:150}"
steps = [['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000], ['js', LOAD], ['wait', 600],
  # LG_S01 on 햇살들판
  go('route1', 6, 14, 'up'), ['wait', 400], run('G.legend.s01()'), ['wait', 900], ['shot', 'v01_s01_shadow'], ['wait', 700], ['shot', 'v02_s01_shadow2'],
  ['keys', 'KeyZ', 3, 500], ['wait', 600], ['shot', 'v03_s01_points'], ['keys', 'KeyZ', 6, 400], ['wait', 800], clear(),
  # LG_S04 board, LG_S05 far sighting
  go('archive', 5, 4, 'up'), ['wait', 300], run('G.legend.archiveBoard()'), ['wait', 1600], ['shot', 'v04_s04_board'], ['keys', 'KeyZ', 8, 400], clear(),
  go('ridge', 5, 22, 'left'), ['wait', 300], run('G.legend.ridgeTablet()'), ['wait', 600], ['keys', 'KeyZ', 1, 300], ['wait', 1800], ['shot', 'v05_s05_far'], ['keys', 'KeyZ', 8, 400], clear(),
  # LG_S06 on the old dock
  go('nw3', 25, 8, 'right'), ['wait', 300], run('G.legend.dockCameo()'), ['wait', 500], ['keys', 'KeyZ', 1, 300], ['wait', 1200], ['shot', 'v06_s06_lights'],
  ['keys', 'KeyZ', 1, 300], ['wait', 1300], ['shot', 'v07_s06_fox'], ['keys', 'KeyZ', 8, 400], clear(),
  # the ridge stone and 햇귀절벽 (state set so the stone has moved)
  ['js', "G.S.hauls=G.S.hauls||{}; G.S.hauls.ridge={lg_sun:1}; G.S.tiles.ridge=Object.assign(G.S.tiles.ridge||{},{'4,24':'.','5,25':'%'}); G.world.rebuild('ridge'); 'moved'"],
  go('ridge', 6, 23, 'left'), ['wait', 500], ['shot', 'v08_ridge_open'],
  go('lg_suncliff', 13, 9, 'up'), ['wait', 600], ['keys', 'KeyZ', 4, 400], ['wait', 400], ['shot', 'v09_sun_start'],
  ['js', "const z=G.legend.st().sites.LGZ01; z.a=2; z.b=1; 'partial'"], ['wait', 300], ['shot', 'v10_sun_partial'],
  ['js', "const z=G.legend.st().sites.LGZ01; z.a=2; z.b=3; z.calm=1; 'calm'"], go('lg_suncliff', 11, 5, 'up'), ['wait', 400], ['shot', 'v11_sun_calm'],
  go('lg_suncliff', 11, 3, 'up'), ['wait', 300], run('G.legend.sunLedge()'), ['wait', 1500], ['shot', 'v12_sun_observe'], ['keys', 'KeyZ', 5, 450], ['wait', 600], ['shot', 'v13_sun_choice'],
  ['key', 'ArrowDown', 200], ['key', 'KeyZ', 300], ['keys', 'KeyZ', 4, 400], clear(),
  # the battle against 금오 (sun backdrop) and with 금오 on your side
  run("G.battle.wild({id:'geumo',lv:48,legend:'해를 등에 진 금오가 긴 날개를 활짝 폈다!',scene:'sun'})"), ['wait', 2600], ['shot', 'v14_battle_geumo'],
  ['wait', 2600], ['shot', 'v15_battle_geumo2'], ['js', "G.layers.length=0; G.lock=0; G.scene=G.world.scene; G.audio.music('route'); 'end'"],
  ['js', f"G.S.party.unshift({GEUMO}); G.S.party.unshift({WOLB}); G.data.caught('geumo'); G.data.caught('wolbaek'); 'joined'"],
  run("G.battle.wild({id:'wolbaek',lv:49,legend:'아홉 꼬리 끝에 달불이 켜지며 월백이 모습을 드러냈다!',scene:'moon'})"), ['wait', 5200], ['shot', 'v16_battle_wolbaek'],
  ['js', "G.layers.length=0; G.lock=0; G.scene=G.world.scene; 'end'"],
  ['js', "const m=G.S.party.shift(); G.S.party.splice(1,0,m); 'geumo lead'"],
  run("G.battle.wild({id:'gwibami',lv:30})"), ['wait', 5200], ['shot', 'v17_battle_back_geumo'], ['js', "G.layers.length=0; G.lock=0; G.scene=G.world.scene; 'end'"],
  # summary pages, dex pages, the first-catch reveal
  run('G.menus.party({title:"몬스터"})'), ['wait', 600], ['shot', 'v18_summary_geumo'], ['key', 'ArrowRight', 300], ['wait', 300], ['shot', 'v19_summary_wolbaek'], clear(),
  run('G.menus.dex()'), ['wait', 600], ['js', "const L=G.topLayer(); L.sel=L.items?0:0; 'x'"],
  ['js', "const L=G.topLayer(); L.sel=102; L.top=Math.max(0,102-3); 'sel'"], ['wait', 400], ['shot', 'v20_dex_geumo'],
  ['js', "const L=G.topLayer(); L.sel=103; L.top=Math.max(0,103-3); 'sel'"], ['wait', 400], ['shot', 'v21_dex_wolbaek'], clear(),
  ['js', "delete G.S.dex.caught.wolbaek; delete G.S.dex.seen.wolbaek; G.legend.st().wolbaek.named=1; G.legend.st().wolbaek.sighted=0; G.legend.st().wolbaek.trace=1; 'stage'"],
  run('G.menus.dex()'), ['wait', 500], ['js', "const L=G.topLayer(); L.sel=103; L.top=100; 'sel'"], ['wait', 400], ['shot', 'v22_dex_wolbaek_trace'], clear(),
  ['js', "G.legend.st().wolbaek.sighted=1; 'stage2'"],
  run('G.menus.dex()'), ['wait', 500], ['js', "const L=G.topLayer(); L.sel=103; L.top=100; 'sel'"], ['wait', 400], ['shot', 'v23_dex_wolbaek_sil'], clear(),
  run("G.menus.dexReveal('wolbaek')"), ['wait', 1800], ['shot', 'v24_reveal_wolbaek'], clear(),
  run("G.menus.dexReveal('geumo')"), ['wait', 1800], ['shot', 'v25_reveal_geumo'], clear(),
  # the notebook's legend journal, and the minis following the player
  run('G.field.notebook(3)'), ['wait', 500], ['shot', 'v26_notebook_journal'], clear(),
  go('ridge', 11, 30, 'up'), ['wait', 300], ['key', 'ArrowUp', 400], ['wait', 600], ['shot', 'v27_follow_wolbaek'],
  ['js', "const m=G.S.party.splice(1,1)[0]; G.S.party.unshift(m); G.world.placeFollower(); 'geumo lead'"], ['key', 'ArrowUp', 400], ['wait', 600], ['shot', 'v28_follow_geumo'],
  # 월은못: before and after the basin, and the shore scene
  go('lg_moonpool', 3, 6, 'right'), ['wait', 600], ['keys', 'KeyZ', 4, 400], ['wait', 400], ['shot', 'v29_moon_start'],
  ['js', "G.legend.st().sites.LGZ02.lit=1; G.legend.st().sites.LGZ02.back=1; 'lit'"], go('lg_moonpool', 4, 8, 'right'), ['wait', 600], ['shot', 'v30_moon_lit'],
  ['js', "G.legend.st().wolbaek.observed=0; G.legend.st().wolbaek.captured=0; 'reset'"], run('G.legend.moonShore()'), ['wait', 900], ['keys', 'KeyZ', 1, 400], ['wait', 1900], ['shot', 'v31_moon_tails'], ['keys', 'KeyZ', 3, 450], ['wait', 600], ['shot', 'v32_moon_card'],
  ['keys', 'KeyZ', 4, 400], ['key', 'ArrowDown', 200], ['key', 'KeyZ', 300], ['keys', 'KeyZ', 4, 400], clear(),
  # the world map pages with the sanctuaries walked
  run('G.field.worldMap()'), ['wait', 500], ['shot', 'v33_map'], clear(),
  # the legends' battle manners: the announced 태양불꽃 / 그림자구슬 (telegraph forced on the first enemy turn)
  ['js', "G.S.party = G.S.party.filter(m => m.id !== 'geumo' && m.id !== 'wolbaek'); G.data.healParty(); 'party'"],
] + [s for lg, key in (('geumo', '해처럼달아오른다'), ('wolbaek', '하나로모여')) for s in (
  run("G.battle.wild(Object.assign({id:'%s', lv:G.legend.LEG.%s.lv, moves:G.legend.LEG.%s.moves, scene:G.legend.LEG.%s.bg, legend:G.legend.LEG.%s.appear},"
      " {ai: {telegraph: {%s: Object.assign({}, G.legend.LEG.%s.ai.telegraph.%s, {chance: 1})}}}))" % ((lg,) * 8)),
  ['waitfor', "(()=>{const s=G.battle.state(); const L=G.topLayer(); if(L&&L.pages&&L.ready) G.pressed.a=1; return !!(s&&s.ui==='command');})()", 30000],
  ['key', 'KeyZ', 300], ['key', 'KeyZ', 300],
  ['waitfor', "(()=>{const L=G.topLayer(); return !!(L&&L.pages&&L.pages.flat().join('').replace(/\\s/g,'').includes('%s'));})()" % key, 30000],
  ['wait', 700], ['shot', 'v%d_%s_warn' % (34 if lg == 'geumo' else 35, lg)],
  ['js', "G.layers.length=0; G.lock=0; G.scene=G.world.scene; 'end'"])]
spec = {'viewport': [1100, 900], 'speed': 1, 'maxlogs': 60, 'init': 'window.__SAVE = %s;' % json.dumps(save), 'steps': steps}
json.dump(spec, open(os.path.join(HERE, 't_legend_vis.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('t_legend_vis.json', len(steps), 'steps')
