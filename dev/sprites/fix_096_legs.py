"""#096 제방집게: the concept sheet shows six walking legs (two high arching ones and one hidden behind the small claw) and a
ground shadow that joins both claws. The monster doc fixes it at four low walking legs + two claws, so before pixelizing:
  - paint out the two arching legs and the hidden back-leg segment (outlines redrawn where they were cut),
  - clear the ground shadow with an outline-bounded flood fill.
python3 dev/sprites/fix_096_legs.py [src.png] [out.png]
(default src: docs/planning/chapter-03/assets/monsters-091-096.png; default out: dex091x.png)"""
import sys, os
from PIL import Image, ImageDraw
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shadow_mask import mask

SRC = sys.argv[1] if len(sys.argv) > 1 else 'docs/planning/chapter-03/assets/monsters-091-096.png'
DST = sys.argv[2] if len(sys.argv) > 2 else 'dex091x.png'
BG = (254, 254, 250); INK = (24, 18, 16)
im = Image.open(SRC).convert('RGB')
d = ImageDraw.Draw(im)
def ink(pts, w=4): d.line(pts, fill=INK, width=w, joint='curve')
# left arching leg (over the carapace corner, joins the big claw's wrist joint)
d.polygon([(536, 1066), (536, 1000), (690, 1000), (690, 1043), (674, 1046), (650, 1051), (632, 1056),
           (626, 1060), (612, 1081), (600, 1088), (590, 1088), (579, 1071), (568, 1063), (555, 1061),
           (545, 1064)], fill=BG)
ink([(538, 1068), (553, 1063), (568, 1064), (578, 1071), (583, 1084)])
d.polygon([(536, 1066), (553, 1061), (569, 1062), (581, 1069), (586, 1080), (600, 1080), (600, 1050), (536, 1050)], fill=BG)
d.polygon([(585, 1080), (604, 1080), (604, 1088), (588, 1088)], fill=BG)
# right arching leg (from the body's right shoulder, hidden behind the long right leg)
d.polygon([(884, 1066), (884, 1040), (1015, 1040), (1015, 1148), (970, 1149), (957, 1145), (930, 1142),
           (912, 1144), (907, 1137), (904, 1128), (898, 1119), (887, 1106), (884, 1088), (882, 1076)], fill=BG)
ink([(874, 1068), (881, 1079), (884, 1100), (897, 1117), (905, 1129), (905, 1139)])
ink([(912, 1156), (930, 1147), (956, 1148), (968, 1154), (978, 1166)])
d.polygon([(908, 1120), (908, 1153), (930, 1145), (956, 1146), (970, 1152), (981, 1164), (1015, 1164), (1015, 1120)], fill=BG)
d.polygon([(870, 1058), (884, 1058), (884, 1066), (878, 1066)], fill=BG)
# the dark back-leg segment peeking between the small claw and the long right leg
d.polygon([(930, 1198), (938, 1188), (950, 1205), (955, 1212), (946, 1234), (938, 1233), (933, 1222)], fill=BG)
ink([(927, 1197), (930, 1210), (933, 1222), (937, 1232)], 3)
im.save(DST)
# the ground shadow under the crab
m = mask(DST, (432, 1180, 1012, 1430), [(700, 1330), (600, 1360), (480, 1380), (900, 1400), (1000, 1380), (760, 1300), (620, 1330)])
a = np.asarray(Image.open(DST).convert('RGB')).copy()
a[m] = BG
Image.fromarray(a).save(DST)
print(DST, 'shadow pixels cleared:', int(m.sum()))
