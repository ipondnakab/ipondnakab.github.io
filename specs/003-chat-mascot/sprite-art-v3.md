# KhunKao seated idle and playful actions

Built-in ImageGen edited atlas v2 into the expanded action sheet.
Intermediate pose atlas (replaced by the coat-matched v4 asset): `public/images/khunkao/tabby-atlas-v3.png`.
The transparent 887 × 1774 bitmap is preserved. Crop/anchor metadata is measured
from visible alpha bounds. Sitting and walking use calibrated uniform scales;
rolling/stretching retain their naturally lower silhouette.

## Exact generation prompt

Extend and regenerate this detailed KhunKao brown tabby pixel-art character atlas for an animated website mascot. Preserve the identical adult cat identity: warm brown mackerel stripes, green eyes, cream muzzle, pink inner ears, natural feline anatomy, sharp detailed pixel clusters and clean transparent alpha.

OUTPUT: ONE portrait sprite atlas, exact FOUR COLUMNS and EIGHT ROWS, 32 full-body sprites, equal square cells. Suggested resolution 1024 wide x 2048 high. No labels, text, grid, scenery, shadows, borders, portraits or floating heads. One complete cat per cell with generous transparent gutters; all tails and whiskers inside the cell. All poses RIGHT-facing, consistent side/three-quarter camera, identical body/HEAD SCALE and lighting. Never zoom the seated cat larger than the walking cat. Skull including ears about 27% of cell height across both sitting and walking; cat is an adult, not a big-headed kitten. Paired sit/walk poses should have similar total height because the walking tail is raised. Never resize a crouching/rolling/stretching pose to fill a cell: keep the same physical cat dimensions while its silhouette becomes naturally lower or wider. Use a stable paw ground line 90% down each cell.

ROW 1: 4 SEATED IDLE frames. Cat sits on its haunches with straight front paws and tail curled around its feet, looking right/three-quarter right. Soft breathing and a blink. Seated head must be the SAME head size as walking below, no oversized close-up.
ROW 2: WALK cycle frames 1-4, naturally walking on FOUR legs to the RIGHT, curved raised tail, alternating fore/hind legs.
ROW 3: WALK frames 5-8, same scale, continuation looping smoothly to row 2 first frame.
ROW 4: 4 SEATED GROOM frames: sitting, lift front paw, lick paw, rub cheek, lower paw. Same seated body/head size as row 1.
ROW 5: 4 STRETCH frames: from seated prepare/crouch, stretch forelegs forward with hindquarters raised, relax, return towards seated. Maintain actual anatomy/scale.
ROW 6: ROLL frames 1-4: from seated lean and crouch, lie on side, roll onto back with paws up, continue rolling. Playful gentle cat roll, natural anatomy, one cat only.
ROW 7: ROLL frames 5-8: continue the roll through the opposite side, tuck paws, get up, finish SEATED like row 1. Same physical scale, no duplicate limbs.
ROW 8: 4 EXPRESSION frames, each a COMPLETE SEATED CAT, not isolated faces: attentive ears and open eyes, happy soft squint, playful wink, curious head tilt. Keep body and head consistent with row 1.

Production asset priority: readable consistent anatomy, stable head and body scale across actions, transparent separation between cells, no clipping, no colour fringes. Retain the beautiful reference fur shading and stripes. Exactly 4 x 8 frames, 32 cats total.
