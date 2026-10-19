"""Overworld character pixel grids (authored here, previewed with PIL, exported to chars.json for art.js).

Letters: . transparent, K outline, S skin, s skin shade, H hair, h hair shade, C clothes, c clothes shade,
P pants, p pants shade, B shoes, W white, E eye, A accent, a accent shade, R blush, G glasses.
Kid frames are 16x20 (head 12 rows + body 8 rows); adult frames are 16x24 (head 12 + body 12).
"""
import json, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- heads (16 x 12)
HEADS = {
 'short': {
  'down': [
   "................",
   ".....KKKKKK.....",
   "...KKHHHHHHKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHHHhHHHHhHHHK.",
   ".KHhSSSSSSSShHK.",
   ".KhSSSSSSSSSShK.",
   ".KSSSESSSSESSSK.",
   ".KSSSESSSSESSSK.",
   "..KSRSSSSSSRSK..",
   "...KKSSSSSSKK...",
  ],
  'up': [
   "................",
   ".....KKKKKK.....",
   "...KKHHHHHHKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KHhHHHHHHHHhHK.",
   ".KhHHHHHHHHHHhK.",
   ".KShhHHHHHHhhSK.",
   "..KSShhhhhhSSK..",
   "...KKSSSSSSKK...",
  ],
  'left': [
   "................",
   "......KKKKK.....",
   "....KKHHHHHKK...",
   "...KHHHHHHHHHK..",
   "..KHHHHHHHHHHHK.",
   "..KHHHHHHHHHHHK.",
   ".KHSSSHHHHHHHHK.",
   ".KSSSSShHHHHHhK.",
   ".KSESSSShHHHHhK.",
   ".KSESSSSShHHhK..",
   "..KRSSSSSShhK...",
   "...KKSSSSSKK....",
  ],
 },
 'cap': {
  'down': [
   ".....KKKKKK.....",
   "...KKAAAAAAKK...",
   "..KAAAAWWAAAAK..",
   ".KAAAAAWWAAAAAK.",
   ".KaaaaaaaaaaaaK.",
   "KKKKKKKKKKKKKKKK",
   ".KHhSSSSSSSShHK.",
   ".KhSSSSSSSSSShK.",
   ".KSSSESSSSESSSK.",
   ".KSSSESSSSESSSK.",
   "..KSRSSSSSSRSK..",
   "...KKSSSSSSKK...",
  ],
  'up': [
   ".....KKKKKK.....",
   "...KKAAAAAAKK...",
   "..KAAAAAAAAAAK..",
   ".KAAAAAAAAAAAAK.",
   ".KAAAAaaaaAAAAK.",
   ".KaaaKKKKKKaaaK.",
   ".KHHHHHHHHHHHHK.",
   ".KHhHHHHHHHHhHK.",
   ".KhHHHHHHHHHHhK.",
   ".KShhHHHHHHhhSK.",
   "..KSShhhhhhSSK..",
   "...KKSSSSSSKK...",
  ],
  'left': [
   "......KKKKK.....",
   "....KKAAAAAKK...",
   "...KAAWWAAAAAK..",
   "..KAAAWWAAAAAAK.",
   "..KaaaaaaaaaaaK.",
   "KKKKKKKaaaaaaaK.",
   ".KHSSSHHHHHHHHK.",
   ".KSSSSShHHHHHhK.",
   ".KSESSSShHHHHhK.",
   ".KSESSSSShHHhK..",
   "..KRSSSSSShhK...",
   "...KKSSSSSKK....",
  ],
 },
 'bob': {
  'down': [
   "................",
   ".....KKKKKK.....",
   "...KKHHHHHHKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   "KHHSSSSSSSSSSHHK",
   "KHHSSESSSSESSHHK",
   "KHhSSESSSSESShHK",
   "KHhKRSSSSSSRKhHK",
   ".KK.KKSSSSKK.KK.",
  ],
  'up': [
   "................",
   ".....KKKKKK.....",
   "...KKHHHHHHKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   "KHHHHHHHHHHHHHHK",
   "KHHhHHHHHHHHhHHK",
   "KHhhHHHHHHHHhhHK",
   "KHhhhhhhhhhhhhHK",
   ".KKKKKKKKKKKKKK.",
  ],
  'left': [
   "................",
   "......KKKKK.....",
   "....KKHHHHHKK...",
   "...KHHHHHHHHHK..",
   "..KHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KHSSSHHHHHHHHK.",
   ".KSSSSSHHHHHHHHK",
   ".KSESSSSHHHHHhHK",
   ".KSESSSShHHHhhHK",
   "..KRSSSSShhhhhHK",
   "...KKSSSSKKKKKK.",
  ],
 },
 'spiky': {
  'down': [
   "..K..K..K..K....",
   "..KHKHKKHKKHK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   "KHHHHHHHHHHHHHHK",
   ".KHHHhHHHHhHHHK.",
   ".KHhSSSSSSSShHK.",
   ".KhSSSSSSSSSShK.",
   ".KSSSESSSSESSSK.",
   ".KSSSESSSSESSSK.",
   "..KSSSSSSSSSSK..",
   "...KKSSSSSSKK...",
  ],
  'up': [
   "..K..K..K..K....",
   "..KHKHKKHKKHK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   "KHHHHHHHHHHHHHHK",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KHhHHHHHHHHhHK.",
   ".KhHHHHHHHHHHhK.",
   ".KShhHHHHHHhhSK.",
   "..KSShhhhhhSSK..",
   "...KKSSSSSSKK...",
  ],
  'left': [
   "....K..K..K.....",
   "....KHKKHKKHK...",
   "...KHHHHHHHHHK..",
   "..KHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHHK",
   "..KHHHHHHHHHHHK.",
   ".KHSSSHHHHHHHHK.",
   ".KSSSSShHHHHHhK.",
   ".KSESSSShHHHHhK.",
   ".KSESSSSShHHhK..",
   "..KSSSSSSShhK...",
   "...KKSSSSSKK....",
  ],
 },
 'long': {   # adult woman: long hair
  'down': [
   "................",
   ".....KKKKKK.....",
   "...KKHHHHHHKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHHHhHHHHhHHHK.",
   ".KHhSSSSSSSShHK.",
   "KHhSSSSSSSSSShHK",
   "KHSSSESSSSESSSHK",
   "KHSSSESSSSESSSHK",
   "KHHKSSSSSSSSKHHK",
   "KHHhKKSSSSKKhHHK",
  ],
  'up': [
   "................",
   ".....KKKKKK.....",
   "...KKHHHHHHKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   "KHHhHHHHHHHHhHHK",
   "KHhHHHHHHHHHHhHK",
   "KHhHHHHHHHHHHhHK",
   "KHhhHHHHHHHHhhHK",
   "KHHhhhhhhhhhhHHK",
  ],
  'left': [
   "................",
   "......KKKKK.....",
   "....KKHHHHHKK...",
   "...KHHHHHHHHHK..",
   "..KHHHHHHHHHHHK.",
   "..KHHHHHHHHHHHK.",
   ".KHSSSHHHHHHHHHK",
   ".KSSSSShHHHHHHHK",
   ".KSESSSShHHHHhHK",
   ".KSESSSShHHHhhHK",
   "..KSSSSSShhhhHHK",
   "...KKSSSSKHHHHK.",
  ],
 },
 'elder': {  # grey hair bun / beard-less elder
  'down': [
   "......KKKK......",
   ".....KHHHHK.....",
   "...KKKHHHHKKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHhSSSSSSSShHK.",
   ".KhSSSSSSSSSShK.",
   ".KSSKKSSSSKKSSK.",
   ".KSSSESSSSESSSK.",
   ".KSSSSSSSSSSSSK.",
   "..KSSSKKKKSSSK..",
   "...KKSSSSSSKK...",
  ],
  'up': [
   "......KKKK......",
   ".....KHHHHK.....",
   "...KKKHHHHKKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KHhHHHHHHHHhHK.",
   ".KhHHHHHHHHHHhK.",
   ".KShHHHHHHHHhSK.",
   ".KSShhhhhhhhSSK.",
   "..KSSSSSSSSSSK..",
   "...KKSSSSSSKK...",
  ],
  'left': [
   ".........KKKK...",
   "........KHHHHK..",
   "....KKKKKHHHK...",
   "...KHHHHHHHHHK..",
   "..KHHHHHHHHHHHK.",
   ".KSSSSHHHHHHHHK.",
   ".KSSSSShHHHHHhK.",
   ".KSKKSSShHHHHhK.",
   ".KSESSSSShHHhK..",
   ".KSSSSSSSShhK...",
   "..KKKSSSSSSK....",
   "...KKSSSSSKK....",
  ],
 },
 'glasses': {  # professor: short messy hair + glasses
  'down': [
   "................",
   "....KK.KKKK.....",
   "...KHHKHHHHKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHHHhHHHHhHHHK.",
   ".KHhSSSSSSSShHK.",
   ".KhGGGGSSGGGGhK.",
   ".KSGWEGGGGEWGSK.",
   ".KSGGGGSSGGGGSK.",
   "..KSSSSSSSSSSK..",
   "...KKSSSSSSKK...",
  ],
  'up': [
   "................",
   "....KK.KKKK.....",
   "...KHHKHHHHKK...",
   "..KHHHHHHHHHHK..",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KHHHHHHHHHHHHK.",
   ".KGHhHHHHHHhHGK.",
   ".KhHHHHHHHHHHhK.",
   ".KShhHHHHHHhhSK.",
   "..KSShhhhhhSSK..",
   "...KKSSSSSSKK...",
  ],
  'left': [
   "................",
   ".....KK.KKK.....",
   "....KHHKHHHKK...",
   "...KHHHHHHHHHK..",
   "..KHHHHHHHHHHHK.",
   "..KHHHHHHHHHHHK.",
   ".KHSSSHHHHHHHHK.",
   ".GGGGSShHHHHHhK.",
   ".GWEGGGGGHHHHhK.",
   ".GGGGSSSShHHhK..",
   "..KSSSSSSShhK...",
   "...KKSSSSSKK....",
  ],
 },
}

# ---------------------------------------------------------------- kid bodies (16 x 8)
KID_BODY = {
 'down_stand': [
  "...KCCSSSSCCK...",
  "..KCCCCCCCCCCK..",
  ".KCKCCCCCCCCKCK.",
  ".KSKCCCCCCCCKSK.",
  "..KKPPPPPPPPKK..",
  "...KPPPKKPPPK...",
  "...KBBK..KBBK...",
  "....KK....KK....",
 ],
 'down_step': [
  "...KCCSSSSCCK...",
  "..KCCCCCCCCCCK..",
  ".KCKCCCCCCCCKCK.",
  ".KSKCCCCCCCCKSK.",
  "..KKPPPPPPPPKK..",
  "...KBBKKKPPPK...",
  "....KK..KBBK....",
  ".........KK.....",
 ],
 'up_stand': [
  "...KCCCCCCCCK...",
  "..KCCCCCCCCCCK..",
  ".KCKCCCCCCCCKCK.",
  ".KSKcCCCCCCcKSK.",
  "..KKPPPPPPPPKK..",
  "...KPPPKKPPPK...",
  "...KBBK..KBBK...",
  "....KK....KK....",
 ],
 'up_step': [
  "...KCCCCCCCCK...",
  "..KCCCCCCCCCCK..",
  ".KCKCCCCCCCCKCK.",
  ".KSKcCCCCCCcKSK.",
  "..KKPPPPPPPPKK..",
  "...KBBKKKPPPK...",
  "....KK..KBBK....",
  ".........KK.....",
 ],
 'left_stand': [
  "....KCCSSCK.....",
  "...KCCCCCCCK....",
  "...KCCCKCCCK....",
  "...KCCKSKCCK....",
  "...KKPPKPPKK....",
  "....KPPPPPK.....",
  "....KBBBBBK.....",
  ".....KKKKK......",
 ],
 'left_step': [
  "....KCCSSCK.....",
  "...KCCCCCCCK....",
  "..KSKCCCCCCK....",
  "..KKKCCCCKSK....",
  "...KPPPPPPKK....",
  "..KPPPK.KPPK....",
  ".KBBBK..KBBBK...",
  "..KKK....KKK....",
 ],
 'left_step2': [
  "....KCCSSCK.....",
  "...KCCCCCCCK....",
  "...KCCCCCCKSK...",
  "...KSKCCCCKKK...",
  "...KKPPPPPPK....",
  "...KPPK.KPPPK...",
  "..KBBBK.KBBBK...",
  "...KKK...KKK....",
 ],
}

# ---------------------------------------------------------------- adult bodies (16 x 12)
ADULT_BODY = {
 'down_stand': [
  "....KCSSSSCK....",
  "..KKCCCSSCCCKK..",
  ".KCCCCCCCCCCCCK.",
  ".KCKCCCCCCCCKCK.",
  ".KCKCCCCCCCCKCK.",
  ".KSKCCCCCCCCKSK.",
  "..KKPPPPPPPPKK..",
  "...KPPPPPPPPK...",
  "...KPPPKKPPPK...",
  "...KPPK..KPPK...",
  "...KBBK..KBBK...",
  "....KK....KK....",
 ],
 'down_step': [
  "....KCSSSSCK....",
  "..KKCCCSSCCCKK..",
  ".KCCCCCCCCCCCCK.",
  ".KCKCCCCCCCCKCK.",
  ".KCKCCCCCCCCKCK.",
  ".KSKCCCCCCCCKSK.",
  "..KKPPPPPPPPKK..",
  "...KPPPPPPPPK...",
  "...KPPPKKPPPK...",
  "...KBBK..KPPK...",
  "....KK...KBBK...",
  "..........KK....",
 ],
 'up_stand': [
  "....KCCCCCCK....",
  "..KKCCCCCCCCKK..",
  ".KCCCCCCCCCCCCK.",
  ".KCKCCCCCCCCKCK.",
  ".KCKCCCcCCCCKCK.",
  ".KSKCCCcCCCCKSK.",
  "..KKPPPPPPPPKK..",
  "...KPPPPPPPPK...",
  "...KPPPKKPPPK...",
  "...KPPK..KPPK...",
  "...KBBK..KBBK...",
  "....KK....KK....",
 ],
 'up_step': [
  "....KCCCCCCK....",
  "..KKCCCCCCCCKK..",
  ".KCCCCCCCCCCCCK.",
  ".KCKCCCCCCCCKCK.",
  ".KCKCCCcCCCCKCK.",
  ".KSKCCCcCCCCKSK.",
  "..KKPPPPPPPPKK..",
  "...KPPPPPPPPK...",
  "...KPPPKKPPPK...",
  "...KBBK..KPPK...",
  "....KK...KBBK...",
  "..........KK....",
 ],
 'left_stand': [
  "....KCSSCCK.....",
  "...KCCCCCCCK....",
  "...KCCCCCCCK....",
  "...KCCCKCCCK....",
  "...KCCKCKCCK....",
  "...KCCKSKCCK....",
  "...KKPPKPPKK....",
  "....KPPPPPK.....",
  "....KPPPPPK.....",
  "....KPPPPPK.....",
  "....KBBBBBK.....",
  ".....KKKKK......",
 ],
 'left_step': [
  "....KCSSCCK.....",
  "...KCCCCCCCK....",
  "...KCCCCCCCK....",
  "..KCKCCCCCCK....",
  "..KSKCCCCKCK....",
  "..KKKCCCCKSK....",
  "...KPPPPPPKK....",
  "...KPPPPPPK.....",
  "..KPPPK.KPPK....",
  "..KPPK...KPPK...",
  ".KBBBK...KBBBK..",
  "..KKK.....KKK...",
 ],
 'left_step2': [
  "....KCSSCCK.....",
  "...KCCCCCCCK....",
  "...KCCCCCCCK....",
  "...KCCCCCCKCK...",
  "...KCKCCCCKSK...",
  "...KSKCCCCKKK...",
  "...KKPPPPPPK....",
  "....KPPPPPPK....",
  "...KPPK.KPPPK...",
  "...KPPK..KPPK...",
  "..KBBBK..KBBBK..",
  "...KKK....KKK...",
 ],
}

PAL = {
 'player_boy':  dict(S='#f8d0a8', s='#e0a880', H='#5a3a28', h='#3e281c', C='#3878d8', c='#2858a8', P='#3a3a52', p='#28283a', B='#e04838', A='#e04838', a='#a82820', R='#f0a090'),
 'player_girl': dict(S='#f8d4b0', s='#e0ac84', H='#2a2430', h='#16121c', C='#f2e3c9', c='#d8c4a0', P='#283152', p='#1c2340', B='#f08aa0', A='#f2909e', a='#c86070', R='#f4a0a0'),
 'rival':       dict(S='#f8d0a8', s='#e0a880', H='#c83838', h='#882020', C='#383848', c='#262634', P='#585870', p='#404052', B='#303030', R='#f0a090'),
 'kid_a':       dict(S='#f8d0a8', s='#e0a880', H='#7a5030', h='#5a3820', C='#58b058', c='#3a8a3a', P='#d8b070', p='#b08a50', B='#704830', R='#f0a090'),
 'kid_b':       dict(S='#f8d0a8', s='#e0a880', H='#382818', h='#201408', C='#f0c040', c='#c89820', P='#4868a8', p='#344c80', B='#d04040', R='#f0a090'),
 'mom':         dict(S='#f8d0a8', s='#e0a880', H='#6a3a2a', h='#4a2618', C='#e87878', c='#c05050', P='#f0e8d8', p='#d0c4a8', B='#704830', R='#f0a090'),
 'prof':        dict(S='#f8d0a8', s='#e0a880', H='#8a8a90', h='#5a5a62', C='#f4f4f8', c='#c8c8d4', P='#5a6a7a', p='#3e4c5a', B='#503828', G='#283040', W='#f8f8ff', R='#f0a090'),
 'man':         dict(S='#f0c098', s='#d09870', H='#3a2a20', h='#22180f', C='#5878a8', c='#3c5680', P='#4a4a4a', p='#323232', B='#3a2a20', R='#e89878'),
 'woman':       dict(S='#f8d4b0', s='#e0ac84', H='#a05a30', h='#783e1c', C='#a878c8', c='#8058a0', P='#504870', p='#383250', B='#704830', R='#f4a0a0'),
 'elder':       dict(S='#f0c8a0', s='#d0a078', H='#d8d8dc', h='#a8a8b0', C='#8a7058', c='#6a5240', P='#5a4a3a', p='#40342a', B='#3a2a20', R='#e89878'),
 'nurse':       dict(S='#f8d4b0', s='#e0ac84', H='#f07890', h='#c05068', C='#f8f0f4', c='#e0c8d4', P='#f0a8c0', p='#d088a0', B='#f8f8f8', R='#f4a0a0'),
 'clerk':       dict(S='#f0c098', s='#d09870', H='#2a2a30', h='#18181c', C='#4898c8', c='#3070a0', P='#f0f0f0', p='#c8c8d0', B='#303030', R='#e89878'),
 'leader':      dict(S='#f8d0a8', s='#e0a880', H='#4ab0c8', h='#2a7890', C='#e8f4f8', c='#a8c8d8', P='#2a6a88', p='#1c4a60', B='#f8f8f8', R='#f0a090'),
 'hiker':       dict(S='#e8b088', s='#c88860', H='#5a3a28', h='#3e281c', C='#c87830', c='#985820', P='#6a5a3a', p='#4a3e28', B='#4a3020', R='#e89878'),
 'shrine':      dict(S='#f0c8a0', s='#d0a078', H='#d8d8dc', h='#a8a8b0', C='#f4f0e8', c='#d0c8b8', P='#c83838', p='#902828', B='#f8f8f8', R='#e89878'),
}

CHARS = {  # name: (head, body set, palette)
 'boy': ('cap', 'kid', 'player_boy'),
 'girl': ('bob', 'kid', 'player_girl'),
 'rival': ('spiky', 'kid', 'rival'),
 'kidA': ('short', 'kid', 'kid_a'),
 'kidB': ('bob', 'kid', 'kid_b'),
 'bugkid': ('cap', 'kid', 'kid_a'),
 'mom': ('long', 'adult', 'mom'),
 'prof': ('glasses', 'adult', 'prof'),
 'man': ('short', 'adult', 'man'),
 'woman': ('long', 'adult', 'woman'),
 'elder': ('elder', 'adult', 'elder'),
 'nurse': ('long', 'adult', 'nurse'),
 'clerk': ('short', 'adult', 'clerk'),
 'leader': ('spiky', 'adult', 'leader'),
 'hiker': ('cap', 'adult', 'hiker'),
 'shrine': ('elder', 'adult', 'shrine'),
}

def check():
    for hn, h in HEADS.items():
        for d, g in h.items():
            assert len(g) == 12, (hn, d, len(g))
            for r in g:
                assert len(r) == 16, (hn, d, r, len(r))
    for bn, b in (('kid', KID_BODY), ('adult', ADULT_BODY)):
        for k, g in b.items():
            for r in g:
                assert len(r) == 16, (bn, k, r, len(r))
            assert len(g) == (8 if bn == 'kid' else 12), (bn, k, len(g))

def frame(name, key):
    head, bodyset, pal = CHARS[name]
    d = key.split('_')[0]
    hg = HEADS[head][d]
    bg = (KID_BODY if bodyset == 'kid' else ADULT_BODY)[key]
    return hg + bg, PAL[pal]

def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

DEF = {'K': '#282830', 'W': '#f8f8f8', 'E': '#282830', 'G': '#283040', 'A': '#e04838', 'a': '#a82820', 'R': '#f0a090'}

def render(grid, pal):
    w, h = 16, len(grid)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            if ch == '.':
                continue
            col = pal.get(ch) or DEF.get(ch) or '#ff00ff'
            im.putpixel((x, y), hexrgb(col) + (255,))
    return im

def preview():
    keys = ['down_stand', 'down_step', 'up_stand', 'up_step', 'left_stand', 'left_step', 'left_step2']
    names = list(CHARS)
    cell = 26
    sheet = Image.new('RGBA', (len(keys) * cell * 4 + 8, len(names) * 28 * 4), (120, 190, 110, 255))
    for i, n in enumerate(names):
        for j, k in enumerate(keys):
            g, pal = frame(n, k)
            im = render(g, pal).resize((64, len(g) * 4), Image.NEAREST)
            sheet.alpha_composite(im, (j * cell * 4 + 8, i * 28 * 4 + (24 - len(g)) * 4))
    sheet.save(os.path.join(HERE, '_chars.png'))

def export():
    out = {'heads': HEADS, 'kid': KID_BODY, 'adult': ADULT_BODY, 'pal': PAL, 'chars': CHARS}
    with open(os.path.join(HERE, 'chars.json'), 'w') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))


# ---- 모아루 1장 cast
PAL.update({
 'harang': dict(S='#f8d4b0', s='#e0ac84', H='#4a3020', h='#2e1c12', C='#4f9a4a', c='#367a36', P='#c8b078', p='#a08a58', B='#5a3a20', R='#f4a0a0'),
 'todam':  dict(S='#e8b888', s='#c89068', H='#2a2420', h='#18120e', C='#a8784a', c='#7a5430', P='#5a5048', p='#403830', B='#3a2a20', R='#e89878'),
 'seokho': dict(S='#e8b088', s='#c88860', H='#3a2a20', h='#22180f', C='#6a7888', c='#4a5868', P='#4a4a52', p='#32323a', B='#3a2a20', A='#f2c230', a='#c89820', W='#ffffff', R='#e89878'),
 'narae':  dict(S='#f8d4b0', s='#e0ac84', H='#5a3a28', h='#3e281c', C='#4aa0d0', c='#2e78a8', P='#e8d8a8', p='#c8b480', B='#3a5a8a', R='#f4a0a0'),
 'sori':   dict(S='#f8d4b0', s='#e0ac84', H='#2a3a5a', h='#1a2440', C='#f4f8f8', c='#c8d8dc', P='#2a8a98', p='#1a5c68', B='#3a3a48', R='#f4a0a0'),
 'worker': dict(S='#f0c098', s='#d09870', H='#3a2a20', h='#22180f', C='#7a8090', c='#5a6070', P='#4a5060', p='#343a48', B='#2a2a30', A='#e8a030', a='#b87818', W='#ffffff', R='#e89878'),
 'boss':   dict(S='#f0c098', s='#d09870', H='#4a4a50', h='#2e2e34', C='#3a3a4a', c='#262632', P='#2a2a34', p='#1c1c24', B='#1c1c24', R='#e89878'),
 'ferry':  dict(S='#e8b088', s='#c88860', H='#d8d8dc', h='#a8a8b0', C='#5a7aa8', c='#3e5a80', P='#3a4a5a', p='#2a3440', B='#3a2a20', R='#e89878'),
})
CHARS.update({
 'harang': ('long', 'adult', 'harang'),
 'todam': ('short', 'adult', 'todam'),
 'seokho': ('cap', 'adult', 'seokho'),
 'narae': ('bob', 'kid', 'narae'),
 'sori': ('long', 'adult', 'sori'),
 'rian': ('spiky', 'adult', 'leader'),
 'worker': ('cap', 'adult', 'worker'),
 'boss': ('short', 'adult', 'boss'),
 'ferry': ('elder', 'adult', 'ferry'),
})

# ---- 모아루 2장 cast
PAL.update({
 'sena':    dict(S='#f8d0a8', s='#e0a880', H='#3a2418', h='#22140c', C='#e8822c', c='#b85e18', P='#3e4a5e', p='#2a3444', B='#2a2a30', A='#f2d23a', a='#c8a420', W='#ffffff', R='#f4a0a0'),
 'danu':    dict(S='#f0c098', s='#d09870', H='#f2d23a', h='#c8a420', C='#2e3448', c='#1e2232', P='#3a4058', p='#262a3c', B='#f2d23a', A='#f2d23a', a='#c8a420', R='#e89878'),
 'haesol':  dict(S='#f0c8a0', s='#d0a078', H='#6a6080', h='#4a4260', C='#8a7aa8', c='#6a5a88', P='#4a4258', p='#34304a', B='#3a3040', A='#f2e0a8', a='#d0b878', R='#e89878'),
 'miru':    dict(S='#f8d4b0', s='#e0ac84', H='#7a4a2a', h='#5a321a', C='#5aa864', c='#3f8a4a', P='#e8dcc0', p='#c8b894', B='#6a4a2a', A='#f4f0d8', a='#d8d0b0', R='#f4a0a0'),
 'yunseul': dict(S='#f8d4b0', s='#e0ac84', H='#2a5a3a', h='#1a3e28', C='#f4ecd8', c='#d8ccb0', P='#5aa864', p='#3f8a4a', B='#f08aa0', A='#f08aa0', a='#c86070', R='#f4a0a0'),
 'doha':    dict(S='#e8b088', s='#c88860', H='#2a2a34', h='#18181e', C='#f4f8fc', c='#c8d4e0', P='#2a3a6a', p='#1c284c', B='#2a3a6a', A='#2a3a6a', a='#1c284c', W='#ffffff', R='#e89878'),
 'yura':    dict(S='#f8d4b0', s='#e0ac84', H='#3a5a6a', h='#243e4a', C='#4ab0b8', c='#2a8a98', P='#f0ece0', p='#d0c8b4', B='#3a3a48', G='#283040', W='#f8f8ff', R='#f4a0a0'),
 'smith':   dict(S='#e8b088', s='#c88860', H='#4a2a1a', h='#2e180c', C='#8a5a34', c='#6a4020', P='#4a4038', p='#342c26', B='#2a201a', R='#e89878'),
 'sailor':  dict(S='#f0c098', s='#d09870', H='#3a2a20', h='#22180f', C='#f4f8fc', c='#4a6ab0', P='#2a3a6a', p='#1c284c', B='#2a2a30', A='#f4f8fc', a='#c8d4e0', W='#2a3a6a', R='#e89878'),
 'fisher':  dict(S='#e8b088', s='#c88860', H='#3a2a20', h='#22180f', C='#6a9a4a', c='#4a7a2e', P='#c8b078', p='#a08a58', B='#4a3a2a', A='#d8c890', a='#b0a068', W='#6a9a4a', R='#e89878'),
 'gardener': dict(S='#f0c098', s='#d09870', H='#c87830', h='#985820', C='#d8b860', c='#b09040', P='#5a7a3a', p='#40582a', B='#5a3a20', R='#e89878'),
})
CHARS.update({
 'sena': ('bob', 'adult', 'sena'),
 'danu': ('spiky', 'adult', 'danu'),
 'haesol': ('elder', 'adult', 'haesol'),
 'miru': ('bob', 'adult', 'miru'),
 'yunseul': ('long', 'adult', 'yunseul'),
 'doha': ('cap', 'adult', 'doha'),
 'yura': ('glasses', 'adult', 'yura'),
 'smith': ('short', 'adult', 'smith'),
 'sailor': ('cap', 'adult', 'sailor'),
 'fisher': ('cap', 'adult', 'fisher'),
 'gardener': ('short', 'adult', 'gardener'),
 'swimmer': ('bob', 'kid', 'kid_b'),
})

if __name__ == '__main__':
    check()
    preview()
    export()
    print('ok')
