"""python3 _tests/mk_touch3.py -> _tests/t_ch3_touch.json: phone-sized touch check on chapter-3 ground
(stick walk, A to talk, boarding prompt by touch, riding a current band, 메뉴 button -> 지도, text wrapping)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
save = open(os.path.join(ROOT, '_saves', 'ch3_daram.json'), encoding='utf-8').read()
idle = "!G.lock && !G.layers.length && G.scene===G.world.scene && !G.world.player.mv"
steps = [
    ['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000],
    ['js', "G.titlePick=()=>{}; G.layers.length=0; G.lock=0; G.S=G.normalize(JSON.parse(window.__SAVE)); G.S.settings.text=2; G.S.settings.sound=false; G.S.settings.time='day'; G.startWorld(true); G.world.enter('m07',24,17,'up',{noEvents:true}); 'loaded'"],
    ['waitfor', idle, 20000],
    ['comment', 'stick: drag up from the stick zone, hold, release -> walk up'],
    ['tdown', 0, 70, 140], ['tmove', 0, 70, 104, 6], ['wait', 330], ['tup', 0], ['waitfor', idle, 10000],
    ['js', "[G.world.map.id, G.world.player.x, G.world.player.y, G.world.player.dir]"],
    ['comment', 'A button: talk to 가온 (one tile above)'],
    ['js', "G.world.enter('m07',24,15,'up',{noEvents:true}); null"], ['waitfor', idle, 10000],
    ['tdown', 0, 222, 104], ['wait', 80], ['tup', 0],
    ['waitfor', "G.topLayer() && G.topLayer().pages", 10000], ['wait', 500],
    ['shot', 'm3_talk_gaon'],
    ['js', "[G.topLayer() && G.topLayer().pages.flat().join(' / ')]"],
    ['js', "window.__tapper=setInterval(()=>{const L=G.topLayer(); if(L && L.pages && !(L.keep&&L.ready&&L.page===L.pages.length-1)) G.pressed.a=1; else if (L && L.sel!==undefined && L.drawBot && !L.drawTop) { L.sel = L.sel; G.pressed.b=1; } },80); null"],
    ['waitfor', idle, 20000], ['js', "clearInterval(window.__tapper); 'talked'"],
    ['comment', 'board at the pool dock by touch: A, then the yes button on the bottom screen'],
    ['js', "G.world.enter('m07',26,7,'up',{noEvents:true}); null"], ['waitfor', idle, 10000],
    ['tdown', 0, 222, 104], ['wait', 80], ['tup', 0],
    ['waitfor', "(()=>{const L=G.topLayer(); if(L&&L.pages&&L.ready&&!(L.keep&&L.page===L.pages.length-1)) G.pressed.a=1; return !!(L && L.sel!==undefined && !L.pages);})()", 15000], ['wait', 400],
    ['shot', 'm3_board_ask'],
    ['comment', 'tap the first answer button (예) on the bottom screen'],
    ['tdown', 0, 128, 89], ['wait', 80], ['tup', 0],
    ['waitfor', "(()=>{const L=G.topLayer(); if(L&&L.pages&&L.ready) G.pressed.a=1; return !G.lock && !G.layers.length && !G.world.player.mv;})()", 15000],
    ['js', "[G.world.player.x, G.world.player.y, G.world.surfing]"],
    ['comment', 'stick up twice: into and across the first current band'],
    ['tdown', 0, 70, 140], ['tmove', 0, 70, 104, 6], ['wait', 300], ['tup', 0], ['waitfor', idle, 10000],
    ['tdown', 0, 70, 140], ['tmove', 0, 70, 104, 6], ['wait', 300], ['tup', 0], ['waitfor', idle, 10000],
    ['js', "[G.world.player.x, G.world.player.y, G.world.surfing && G.world.surfing.current]"],
    ['shot', 'm3_riding_band'],
    ['comment', '메뉴 button -> 지도 button, then back out with the keyboard'],
    ['tdown', 0, 130, 178], ['wait', 80], ['tup', 0],
    ['waitfor', "G.topLayer() && G.topLayer().modal", 10000], ['wait', 300], ['shot', 'm3_menu'],
    ['tdown', 0, 127, 104], ['wait', 80], ['tup', 0], ['wait', 900], ['shot', 'm3_map'],
    ['key', 'x', 400], ['key', 'x', 400], ['key', 'x', 400], ['waitfor', idle, 10000],
    ['js', "[G.world.player.x, G.world.player.y, G.world.surfing && G.world.surfing.current, G.layers.length]"],
    ['comment', 'phone layout of a long chapter-3 line and the notebook page'],
    ['js', "G.world.enter('m08',28,11,'up',{noEvents:true}); null"], ['waitfor', idle, 10000],
    ['js', "G.run(()=>G.field.notebook()); null"], ['wait', 700], ['shot', 'm3_notebook'],
    ['key', 'x', 300], ['key', 'x', 300], ['waitfor', idle, 10000],
    ['js', "G.run(()=>G.say('정화소 아래 침전수로: 취수 기록 대조 → 우회수로 밸브 → 교체 거름틀을 받침 홈에 → 휴식대 물길 밸브. 독 동료나 해독제는 필요 없다.', {name:'정화사 은서'})); null"],
    ['wait', 900], ['shot', 'm3_longline'], ['key', 'z', 300], ['key', 'z', 300], ['key', 'z', 300],
]
spec = {'viewport': [390, 844], 'speed': 4, 'touch': True, 'maxlogs': 60, 'init': 'window.__SAVE = %s;' % json.dumps(save), 'steps': steps}
json.dump(spec, open(os.path.join(HERE, 't_ch3_touch.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('t_ch3_touch.json')
