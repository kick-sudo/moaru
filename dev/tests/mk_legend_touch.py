"""python3 _tests/mk_legend_touch.py -> _tests/t_legend_touch.json (sound off), t_legend_touch_snd.json (sound on):
phone-sized touch check of the legend content on a real chapter-3-end save (no legend record yet):
LG_S01 started with the stick and skipped by a tap on the lower screen, the 금오 ledge with the A button and the choice
buttons, the legend battle screen and its 도망 button, the legend dex page, and the 월은못 entrance outline on the map."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
save = open(os.path.join(ROOT, '_saves', 'ch3_bulguri.json'), encoding='utf-8').read()
idle = "!G.lock && !G.layers.length && G.scene===G.world.scene && !G.world.player.mv"
TAP = "window.__tap=setInterval(()=>{const L=G.topLayer(); if(L&&L.pages&&!(L.keep&&L.ready&&L.page===L.pages.length-1)) G.pressed.a=1;},90); null"
UNTAP = "clearInterval(window.__tap); null"
# press text pages until a choice (or the battle command panel) is showing
UNTIL_CHOICE = "(()=>{const L=G.topLayer(); if(L&&L.pages&&L.ready&&!(L.keep&&L.page===L.pages.length-1)) G.pressed.a=1; return !!(L && L.sel!==undefined && !L.pages && L.modal);})()"
UNTIL_CMD = "(()=>{const L=G.topLayer(); if(L&&L.pages&&L.ready) G.pressed.a=1; const s=G.battle.state(); return !!(s && s.ui==='command');})()"
SUN = ("const s=G.legend.st(); Object.assign(s.geumo,{heard:1,sighted:1,named:1,observed:1,trialReady:1}); s.log.push('LG_S05','LQ01');"
       "s.sites.LGZ01={a:2,b:3,calm:1,entered:1,found:1}; s.quests.LQ01={started:1,listen:1,survey:1,approach:1,observe:1,reward:1}; 'sun ready'")


def spec(sound):
    load = ("G.titlePick=()=>{}; G.layers.length=0; G.lock=0; const o=JSON.parse(window.__SAVE); delete o.legends; G.S=G.normalize(o);"
            "G.S.settings.text=2; G.S.settings.sound=%s; G.audio.setOn(G.S.settings.sound); G.S.settings.time='day'; G.startWorld(true); 'loaded'") % ('true' if sound else 'false')
    tag = '_snd' if sound else ''
    steps = [
        ['wait', 1500], ['waitfor', "typeof G.titlePick === 'function'", 15000], ['js', load], ['waitfor', idle, 20000],
        ['js', "[G.S.settings.sound, G.audio.on]"],
        ['comment', 'LG_S01: the stick walks onto the road; a tap on the lower screen skips the animation'],
        ['js', "G.world.enter('route1',6,14,'up',{noEvents:true}); null"], ['waitfor', idle, 10000],
        ['tdown', 0, 70, 140], ['tmove', 0, 70, 104, 6], ['wait', 250], ['tup', 0],
        ['waitfor', "(()=>{const L=G.topLayer(); return !!(L && L.update && L.drawBot && !L.pages && !L.modal);})()", 10000],
        ['wait', 120], ['shot', 'mlg%s_01_s01_hint' % tag],
        ['tdown', 0, 128, 110], ['wait', 60], ['tup', 0],
        ['js', TAP], ['waitfor', idle, 20000], ['js', UNTAP],
        ['js', "[G.S.legends.scenes.LG_S01, G.S.legends.geumo.trace, G.legend.journal().length]"],
        ['comment', '금오 on its ledge: the A button, then the 조용히 물러난다 button'],
        ['js', SUN], ['js', "G.world.enter('lg_suncliff',11,2,'up',{noEvents:true}); null"], ['waitfor', idle, 10000],
        ['shot', 'mlg%s_02_ledge' % tag],
        ['tdown', 0, 222, 104], ['wait', 80], ['tup', 0],
        ['waitfor', UNTIL_CHOICE, 15000], ['wait', 300], ['shot', 'mlg%s_03_choice' % tag],
        ['tdown', 0, 128, 125], ['wait', 80], ['tup', 0],
        ['js', TAP], ['waitfor', idle, 15000], ['js', UNTAP],
        ['js', "[G.S.legends.geumo.tries, G.legend.present('geumo'), G.world.npcs.some(n=>n.id==='lg_geumo')]"],
        ['comment', 'battle: 더 다가간다 by touch, the legend screen on the phone, then the 도망 button'],
        ['tdown', 0, 222, 104], ['wait', 80], ['tup', 0],
        ['waitfor', UNTIL_CHOICE, 15000], ['tdown', 0, 128, 89], ['wait', 80], ['tup', 0],
        ['waitfor', UNTIL_CMD, 30000], ['wait', 400], ['shot', 'mlg%s_04_battle' % tag], ['shot', 'mlg%s_04_battle_page' % tag, 'page'],
        ['tdown', 0, 128, 139], ['wait', 80], ['tup', 0], ['wait', 1500],
        ['js', "G.autoBattle=()=>({k:'run'}); window.__tap2=setInterval(()=>{const L=G.topLayer(); if(L&&L.pages&&L.ready) G.pressed.a=1; else if(!L && G.scene!==G.world.scene) G.pressed.a=1;},80); null"],
        ['waitfor', idle, 60000], ['js', "clearInterval(window.__tap2); G.autoBattle=null; null"],
        ['js', "[G.S.legends.geumo.tries, G.S.legends.geumo.fled, G.S.legends.geumo.captured, G.world.map.id, G.legend.present('geumo')]"],
        ['comment', 'the legend dex page on the phone'],
        ['js', "G.run(()=>G.menus.dex()); null"], ['wait', 600],
        ['js', "const L=G.topLayer(); L.sel=102; L.top=99; 'sel'"], ['wait', 400], ['shot', 'mlg%s_05_dex' % tag], ['shot', 'mlg%s_05_dex_page' % tag, 'page'],
        ['key', 'x', 300], ['key', 'x', 300], ['waitfor', idle, 10000],
        ['comment', 'the map: 월은못 known only from its examined entrance stone'],
        ['js', "G.legend.st().sites.LGZ02.found=1; G.world.enter('moonroom',11,4,'right',{noEvents:true}); null"], ['waitfor', idle, 10000],
        ['js', "G.run(()=>G.field.worldMap()); null"], ['wait', 500],
        ['js', "(()=>{const L=G.topLayer(); const n=G.CH1.nodes.find(k=>k.id==='cave'); const f=(n.show||n.maps.slice(0,1)).filter(id=>G.MAPS[id]&&(!G.MAPS[id].secret||(G.S.explored&&G.S.explored[id])||(G.MAPS[id].outline&&G.MAPS[id].outline()))); L.view='area'; L.floor=f.indexOf('lg_moonpool'); return [L.node, L.floor, f.length];})()"],
        ['wait', 400], ['shot', 'mlg%s_06_map_outline' % tag],
        ['key', 'x', 300], ['key', 'x', 300], ['key', 'x', 300], ['waitfor', idle, 10000],
    ]
    return {'viewport': [390, 844], 'speed': 2, 'touch': True, 'maxlogs': 80, 'init': 'window.__SAVE = %s;' % json.dumps(save), 'steps': steps}


for snd in (False, True):
    name = 't_legend_touch%s.json' % ('_snd' if snd else '')
    json.dump(spec(snd), open(os.path.join(HERE, name), 'w', encoding='utf-8'), ensure_ascii=False)
    print(name)
