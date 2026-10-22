"""Hand touch-ups for the legend sprites (see _legend_pix.py for the op language).
Coordinates are sprite pixels of the final canvas (front 124 x 71, back 128 x 73 for 금오;
front 118 x 82, back 128 x 87 for 월백)."""


def eyespot(x, y, mirror=False):
    """금오's sun eye at the end of a tail plume: gold ring, indigo pupil, cream crescent; x, y = top-left"""
    rows = ['.RaaR.', 'RaiicG', 'Rakica', '.RaaaR']
    if mirror: rows = [r[::-1] for r in rows]
    return '\n'.join(f'@{x},{y + j}: {r}' for j, r in enumerate(rows))


GEUMO_FRONT = '''
# head: indigo beak to the left, glowing eye, golden crown and face
@37,11: .bRRb
@36,12: .bRoaob
@33,13: kIIioaOaR
@34,14: kkibOcgOR
@36,15: .bROaOb
@37,16: .bROab
# crest plumes: thin golden strands streaming back from the head (no outline on wisps)
clear: 43,9 58,15
clear: 46,16 56,21
a: 42,11 45,10 49,9 53,9 56,10
G: 57,9
O: 42,13 46,12 50,12 54,13 56,13
o: 43,14 47,15 51,16 54,18
a: 44,16 47,18 50,20
# three legs: 2 px shanks with gold scales, a three-toed talon each
clear: 31,42 53,55
@38,41: rb
@37,42: rb
@37,43: ab
@36,44: rb
@36,45: rb
@34,46: .bbb.
@34,47: b.b.b
@34,48: k.k.k
@44,42: rb
@44,43: ab
@44,44: rb
@44,45: rb
@44,46: ab
@44,47: rb
@43,48: .bbb.
@43,49: b.b.b
@43,50: k.k.k
@50,42: rb
@50,43: ab
@50,44: rb
@50,45: rb
@50,46: ab
@50,47: rb
@50,48: rb
@49,49: .bbb.
@49,50: b.b.b
@49,51: k.k.k
''' + '\n'.join([eyespot(97, 28), eyespot(107, 42), eyespot(96, 52)])

GEUMO_BACK = '''
# head from behind: golden crown, the beak just showing on the right
@85,13: bRb
@84,14: bRaab
@83,15: bOaGaIIk
@83,16: bOaaOib
@83,17: bRoRb
# three legs hanging under the body (2 px shanks with gold scales), a three-toed talon each
clear: 68,44 86,54
@71,42: rb
@71,43: ab
@71,44: rb
@71,45: rb
@71,46: ab
@71,47: rb
@71,48: rb
@69,49: .bbb.
@69,50: b.b.b
@69,51: k.k.k
@75,42: rb
@75,43: ab
@75,44: rb
@75,45: rb
@74,46: .bbb.
@74,47: b.b.b
@74,48: k.k.k
@79,42: rb
@79,43: ab
@79,44: rb
@78,45: .bbb.
@78,46: b.b.b
@78,47: k.k.k
''' + '\n'.join([eyespot(21, 42, True), eyespot(22, 55, True), eyespot(39, 62, True)])
WOLBAEK_FRONT = '''
# face: blue eyes, black nose, the silver crescent on the forehead and the silver mark by the eye
@15,25: dD
@14,26: deEd
@9,28: ed
@14,21: s
@13,22: s
@14,23: s
@17,25: sL
@17,26: Ls
# a ninth tail tip peeking out between the first (left) tail and the tall one
@49,9: dd
@49,10: dWd
@50,11: dWwd
@50,12: dWWwd
@51,13: dWWwL
@51,14: dwWWw
@52,15: dwWW
@52,16: dLwW
@53,17: dLww
# the two right-hand tails share an end: notch them apart so both tips read
d: 110,57 113,57
@113,58: d__
@114,57: d
'''
WOLBAEK_BACK = ''
GEUMO_MINI = '''
# near wing raised up-right: flame leading edge, gold coverts, rust, indigo panel, flame fingers
@24,0: kO
@29,0: kO
@22,1: kkOOk
@28,1: kOOk
@21,2: kOaaOkkOaOk
@20,3: kOaaraaOaOk
@19,4: kOaarriraaOk
@18,5: kOaarriiraOk
@17,6: kOaarriirrOk
@16,7: kOaarriirrOk
@15,8: kOaarriirrbOk
@14,9: kOaarriirrbk
@13,10: kOaarriirbbk
@12,11: kOarriirbbk
# head: gold crown, glowing eye, indigo beak, crest streaming back
@6,5: kk
@5,6: kaGk
@4,7: kaGcRk
@2,8: kkIkaaOk
@1,9: kIIIkkaOk
@2,10: kk..koaOk
a: 9,5 11,4 13,3
O: 9,6 11,5
# neck, chest and body
@7,11: koaOk
@8,12: koaObbrarrbbk
@8,13: kooObbbiibbbk
@8,14: koaObbiiibbk
@9,15: kobbbbbbbbk
@10,16: kbbbbbbk
# three plumes: thin shafts widening into the vane, a sun eye and a pointed flame tip
@21,12: kORRR
@17,13: bbRRRRRRR
@21,14: kRRRR
@26,12: gggOk
@26,13: gicGGO
@26,14: gggOk
@22,16: kORRR
@17,17: bbRRRRRRRRR
@22,18: kRRRR
@27,16: gggO
@27,17: gicGO
@27,18: gggO
@15,17: bR
@16,18: bRR
@17,19: bROR
@18,20: bRRggg
@19,21: kRgicGO
@20,22: kgggO
@22,23: kk
# three legs, three toes each
b: 10,17 10,18
b: 12,17 12,18
b: 14,17 14,18
@9,19: kkk
@11,19: kkk
@13,19: kkk
'''

# 월백's overworld mini: the nine-tail fan comes from _legend_pix.fan(); body, legs and head are placed on top
WOLBAEK_MINI_BODY = '''
# body over the tail roots, leaping to the left
@10,11: dWWWd
@7,12: ddWWWWWWWWd
@6,13: dWWWWWWWWWWWWd
@6,14: dwWWWWWWWWWWWLd
@6,15: dwwWWWWWWWWwLLd
@7,16: dLLwwwwwwwLLd
@8,17: ddLLLddLLLd
# front legs stretched forward, hind legs pushing off (white legs, dark paws)
@5,16: dd
@4,17: dWWd
@3,18: dWWd
@2,19: dWWd
@1,20: dkkd
@7,17: dWd
@6,18: dWWd
@5,19: dWWd
@5,20: dkd
@14,17: dWd
@15,18: dWWd
@16,19: dWWd
@17,20: dkkd
@11,17: dWd
@11,18: dWd
@11,19: dWd
@11,20: dkd
# head: tall ears, blue eye, long muzzle with a black nose, the silver crescent on the brow
@5,2: d..d
@4,3: dmd.dmd
@4,4: dWWddWWd
@3,5: dWWsWWWWd
@2,6: dWWdeEWWWd
@1,7: dWWWWWWWWWd
@0,8: kLWWWWWWWWd
@1,9: ddLLWWWWWd
@3,10: ddWWWWd
'''

TOUCH = {'geumo:front': GEUMO_FRONT, 'geumo:back': GEUMO_BACK, 'wolbaek:front': WOLBAEK_FRONT, 'wolbaek:back': WOLBAEK_BACK}
