# Badminton team organizer

Players enter name and gender and can remove roster entries. Random mode draws
singles or doubles matches; leftover players are explicitly sitting out.
Competition mode creates a round-robin table in singles or doubles: each entrant
meets every other entrant once, with fixed doubles partners throughout.

## Confirmed user decisions

- Round-robin competition, not knockout.
- Selectable doubles pairing: any, mixed (one male and one female), or same gender.

## Rules

Trimmed required names, maximum 40 characters; duplicate names allowed with unique
IDs. Maximum 64 players. Random doubles requires four players and sits out up to
three leftover players. Random singles requires two and sits out at most one.
Singles competition needs two players. Doubles competition requires everyone to form a pair;
reject odd total counts with guidance. Gender rules are preferences: first form
as many preferred pairs as possible, then pair the remaining players without
gender restrictions. Unequal gender counts never block generation. Same gender uses
the selected gender group, including other/unspecified. Singles ignores pairing.
Odd entrant counts get one rest per round. Select winners to derive played,
wins and losses, ordered by wins with ties retained. Select again to clear.
Roster/settings changes clear results. Regeneration replaces results. Data is saved
in local storage and restored after refresh. No scores, accounts or backend.

## Acceptance

- Every random player appears once in a match or sit-out list.
- Competition covers each opponent pair exactly once, no simultaneous overlaps.
- Selected pairing rule is preferred with unrestricted fallback for leftovers;
  partners remain fixed in competition.
- Standings follow recorded winners and corrections.
- Empty/invalid rosters show localized guidance; all five locales, both themes,
  keyboard access and narrow screens are supported.

## Random history and partner variety

Keep generated random draws in saved history, newest first, including teams,
sit-outs and pairing preference. Keep history across roster/settings changes;
player IDs identify past partners even when names are duplicated. A clear-history
button clears saved random history. Refresh restores history and the roster.
Prefer least-used partners within the selected gender preference, then use the
existing unrestricted fallback. Repeats are allowed when needed; this is a
best-effort draw, not a guarantee of a globally optimal schedule. Only actual
playing partners count, not players sitting out. Competition is unaffected.

## Mobile design refinement

Use the existing crimson primary palette, theme-aware soft card surfaces,
rounded corners and restrained glow. Mobile views separate Players, Play and
History to keep the current task within reach. Desktop keeps roster and play
side by side. Preserve roster, draws and competition results when changing views.
Provide 44px minimum button targets, readable form text, wrapping names, and
stacked standings cards on phones. Show each player on a separate line in match
cards. All new navigation and empty-state copy is translated in five locales.

## Random singles

Both modes offer Singles and Doubles. Random singles needs at least two players,
creates one-on-one matches, and shows one sit-out for an odd roster. Gender
pairing controls apply only to doubles. Singles favors less-used opponents;
doubles favors less-used partners. Keep these histories separate for draw costs,
while showing both formats in the shared history list. Switching format clears
the current result, preserves history, and leaves the existing mobile layout intact.

## Local persistence

Save the roster, mode, format, pairing preference, mobile view, current random
draw, competition schedule/results and random history on this browser. Restore
on mount after static hydration; never overwrite saved data with empty defaults
before restoration. Use a versioned storage key and validate parsed data before
using it. Invalid or unsupported data falls back to a fresh session. If storage
is blocked or full, keep the app usable in memory and display a translated save
failure notice. Existing clear-history and roster actions persist immediately.
No cross-device sync or accounts; unsent player form input is not saved.
