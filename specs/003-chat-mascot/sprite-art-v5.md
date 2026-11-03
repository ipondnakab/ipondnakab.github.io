# KhunKao grooming paw correction

Built-in ImageGen edited v4 to remove duplicate planted forelegs from the
three raised-paw grooming poses. Each now has one raised foreleg and one
planted foreleg. Other poses retain their existing action roles and coat.
The returned bitmap is saved unchanged as
`public/images/khunkao/tabby-atlas-v5.png` (953 × 1651 RGBA).
Crop bounds and ground contacts are remeasured for all 32 frames.

## Exact edit prompt

Use case: precise-object-edit
Asset type: production transparent pixel-art animation atlas.
Input image: EDIT TARGET, existing KhunKao 4-column by 8-row sprite sheet, 953 x 1651.
Primary request: correct the EXTRA FRONT LEG/PAW in the grooming animation (row 4, columns 1, 2 and 3). These currently show a raised front paw PLUS two front paws planted on the floor, making THREE FRONT LEGS. Remove the duplicate planted front leg corresponding to the raised limb. The raised grooming limb must visibly connect to its shoulder, and exactly ONE other front leg remains planted. A cat has exactly TWO front legs total and TWO hind legs total. In seated side/three-quarter view the folded hindquarters remain a haunch, not an extra vertical foreleg. Row 4 column 4 is seated rest with TWO front paws down. Audit all other poses for duplicate front legs and fix only if needed. Keep the tail visibly a tail.
Constraints: surgical anatomy correction only. Preserve the same 953 x 1651 transparent canvas, exact four columns/eight rows, exact pose positions, scale, floor baselines, all 32 frames and animation order. Keep seated idle, eight walk frames, four grooming frames, four stretch frames, eight roll frames, four expressions. Preserve every correctly drawn body silhouette and leg outside the extra grooming foreleg. Preserve muted brown-grey coat with broad black classic tabby swirls, cream muzzle and tan underside, green eyes, ringed tail, crisp pixel detail, and all facial expressions. No extra limb, floating paw, duplicate hand, merged legs, shadows, text, grid, background or new objects. Actual transparent alpha.
