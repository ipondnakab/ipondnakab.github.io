# Validation

- Final gates ran in order: `yarn typecheck`, `yarn lint`, `yarn test`, `yarn build`
  all passed. Tests: 19 files, 130 tests including three download checks.
- The home page exports one native download anchor outside navigation. Source
  order places its card after OutsourceProjects. The interactive resume export
  has no download anchor. The PDF target and filename are unchanged.
- Removed the navigation slot and app injection; restored original navbar.
- Visual browser verification remains unavailable in this session. Theme tokens,
  keyboard focus and responsive spacing follow existing home-page card patterns.
- No dependencies, commit, push or deployment.

First Load JS compared with the navbar placement:

| Route                                | Before  | After   |
| ------------------------------------ | ------- | ------- |
| `/`                                  | 389 kB  | 390 kB  |
| `/_not-found`                        | 87.9 kB | 87.9 kB |
| `/apple-icon.png`                    | 0 B     | 0 B     |
| `/badminton`                         | 191 kB  | 191 kB  |
| `/contact`                           | 391 kB  | 391 kB  |
| `/contact/success`                   | 191 kB  | 191 kB  |
| `/credit`                            | 143 kB  | 143 kB  |
| `/deepjump`                          | 191 kB  | 191 kB  |
| `/drunkard-game`                     | 123 kB  | 123 kB  |
| `/drunkard-game/privacy`             | 146 kB  | 146 kB  |
| `/icon.png`                          | 0 B     | 0 B     |
| `/mic-link`                          | 439 kB  | 439 kB  |
| `/mini-project`                      | 339 kB  | 339 kB  |
| `/mini-project/badminton/live`       | 290 kB  | 290 kB  |
| `/mini-project/badminton/scoreboard` | 174 kB  | 174 kB  |
| `/planning`                          | 466 kB  | 466 kB  |
| `/pokdeng`                           | 347 kB  | 347 kB  |
| `/prompt-pay`                        | 326 kB  | 326 kB  |
| `/resume`                            | 501 kB  | 501 kB  |
| `/robots.txt`                        | 0 B     | 0 B     |
| `/sitemap.xml`                       | 0 B     | 0 B     |
| `/threejs`                           | 331 kB  | 331 kB  |
