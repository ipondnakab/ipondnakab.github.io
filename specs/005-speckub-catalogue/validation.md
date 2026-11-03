# Validation

Passed in order: `yarn typecheck`, `yarn lint`, `yarn test` (18 files, 127 tests),
and `yarn build` (production static export in an isolated copy).
`git diff --check` passes.

Parsed the exported /mini-project HTML: SpecKub is the first heading, its card
links once to https://www.speckub.dev, and the catalogue contains ten cards.
The entry supplies all five LocalizedText descriptions and uses the provided
SpecKub SVG, while preserving card rendering, Open action and analytics. No new
dependencies, raster assets, local routes, endpoints or deployment changes are
added.

/mini-project First Load JS is 339 kB, compared with 338 kB in the preceding
catalogue build: +1 kB at the build report's precision, within the 1 kB budget.

Parsed the exported SVG and confirmed both supplied paths, a 0 0 1024 1024
viewBox, 1em square sizing, inherited currentColor (the card's primary red), and
decorative aria-hidden behavior. The pure shared component uses React.FC and
optional icon props. The feature model accepts ComponentType<IconBaseProps> so
the custom SVG and existing react-icons type-check together without casts.

The first test run found two pre-existing ChatWidget failures: they expected an
old status-label UI that is absent in the committed component. Only the test
assertions were updated to observe the mocked mascot state. Request, reply,
error and timing checks remain; chat production code is unchanged.
