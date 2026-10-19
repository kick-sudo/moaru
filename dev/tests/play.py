"""Scripted headless play-test: python3 play.py script.json
script: {"viewport":[w,h], "speed":4, "steps":[ ["key","z"], ["keys","z",10,200], ["wait",500], ["js","..."], ["shot","name"], ["click","#dlgOk"], ["hold","ArrowUp",800] ]}
"""
import sys, os, json, asyncio
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))

def build_local():
    body = open(os.path.join(HERE, 'index.html'), encoding='utf-8').read()
    html = ('<!doctype html><html lang="ko"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
            'body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + body + '</body></html>')
    p = os.path.join(HERE, '_local.html')
    open(p, 'w', encoding='utf-8').write(html)
    return p

async def main():
    spec = json.load(open(sys.argv[1]))
    out_dir = os.path.join(HERE, '_shots')
    os.makedirs(out_dir, exist_ok=True)
    page_path = build_local()
    vw, vh = spec.get('viewport', [1100, 900])
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=1, has_touch=spec.get('touch', False))
        if spec.get('fresh', True):
            await ctx.add_init_script("try{localStorage.clear()}catch(e){}")
        if spec.get('init'):
            await ctx.add_init_script(spec['init'])
        pg = await ctx.new_page()
        logs = []
        pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e} :: {getattr(e, "stack", "")}'))
        await pg.goto('file://' + page_path)
        await pg.wait_for_function('window.G && G.scene', timeout=15000)
        if spec.get('speed'):
            await pg.evaluate(f"G.speed={spec['speed']}")
        cdp = None
        touches = {}   # finger id -> (page x, page y)
        async def bot_px(gx, gy):
            box = await pg.locator('#bot').bounding_box()
            return box['x'] + gx * box['width'] / 256, box['y'] + gy * box['height'] / 192
        async def send_touch(kind):
            pts = [{'x': x, 'y': y, 'id': i} for i, (x, y) in touches.items()]
            await cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})
        for st in spec['steps']:
            k = st[0]
            if k in ('tdown', 'tmove', 'tup') and cdp is None:
                cdp = await ctx.new_cdp_session(pg)
            if k == 'tdown':      # ["tdown", finger, gx, gy]  (bottom-screen game coords)
                touches[st[1]] = await bot_px(st[2], st[3]); await send_touch('touchStart'); await pg.wait_for_timeout(30)
            elif k == 'tmove':    # ["tmove", finger, gx, gy, steps]
                x1, y1 = await bot_px(st[2], st[3]); x0, y0 = touches[st[1]]; n = st[4] if len(st) > 4 else 6
                for j in range(1, n + 1):
                    touches[st[1]] = (x0 + (x1 - x0) * j / n, y0 + (y1 - y0) * j / n)
                    await send_touch('touchMove'); await pg.wait_for_timeout(16)
            elif k == 'tup':      # ["tup", finger]
                del touches[st[1]]
                if touches: await send_touch('touchMove')
                else: await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
                await pg.wait_for_timeout(30)
            elif k == 'comment':
                print('#', st[1])
            elif k == 'mdrag':    # ["mdrag", gx0, gy0, gx1, gy1, holdMs]  mouse drag on the bottom screen
                x0, y0 = await bot_px(st[1], st[2]); x1, y1 = await bot_px(st[3], st[4])
                await pg.mouse.move(x0, y0); await pg.mouse.down(); await pg.mouse.move(x1, y1, steps=8)
                await pg.wait_for_timeout(st[5] if len(st) > 5 else 400); await pg.mouse.up(); await pg.wait_for_timeout(60)
            elif k == 'key':
                await pg.keyboard.press(st[1]); await pg.wait_for_timeout(st[2] if len(st) > 2 else 120)
            elif k == 'keys':
                for _ in range(st[2]):
                    await pg.keyboard.press(st[1]); await pg.wait_for_timeout(st[3] if len(st) > 3 else 150)
            elif k == 'hold':
                await pg.keyboard.down(st[1]); await pg.wait_for_timeout(st[2]); await pg.keyboard.up(st[1]); await pg.wait_for_timeout(80)
            elif k == 'wait':
                await pg.wait_for_timeout(st[1])
            elif k == 'js':
                r = await pg.evaluate(st[1])
                if r is not None:
                    print('js->', json.dumps(r, ensure_ascii=False)[:600])
            elif k == 'waitfor':
                try:
                    await pg.wait_for_function(st[1], timeout=st[2] if len(st) > 2 else 20000)
                except Exception as e:
                    print('waitfor timeout:', st[1])
            elif k == 'click':
                await pg.click(st[1]); await pg.wait_for_timeout(150)
            elif k == 'tap':   # tap bottom canvas at game coords
                box = await pg.locator('#bot').bounding_box()
                x = box['x'] + st[1] * box['width'] / 256; y = box['y'] + st[2] * box['height'] / 192
                await pg.mouse.click(x, y); await pg.wait_for_timeout(st[3] if len(st) > 3 else 150)
            elif k == 'shot':
                name = st[1]
                if len(st) > 2 and st[2] == 'page':
                    await pg.screenshot(path=os.path.join(out_dir, name + '.png'))
                else:
                    # both screens side by side at 2x
                    data = await pg.evaluate("""() => { const c=document.createElement('canvas'); c.width=1024; c.height=384; const x=c.getContext('2d'); x.imageSmoothingEnabled=false;
                        x.drawImage(document.getElementById('top'),0,0,512,384); x.drawImage(document.getElementById('bot'),512,0,512,384); return c.toDataURL(); }""")
                    import base64
                    open(os.path.join(out_dir, name + '.png'), 'wb').write(base64.b64decode(data.split(',')[1]))
        for l in logs[:int(spec.get("maxlogs", 30))]:
            print(l)
        await b.close()

asyncio.run(main())
