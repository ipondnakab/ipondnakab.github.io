# Plan

Add one entry at the start of MINI_PROJECTS in the feature constants. Use the
provided SVG paths in a pure typed shared/ui/icons/SpecKubIcon component and the
established LocalizedText
data format. Its 1024-square viewBox and 1em dimensions fit the existing icon
slot, inheriting the primary token (the supplied brand red). It supports the
existing icon props, optional title and decorative accessibility. Move the
catalogue shape into its feature model and accept ComponentType<IconBaseProps>,
so both existing react-icons and the required React.FC SVG type-check without
casts. The catalogue is readonly. The existing list component handles rendering, numbering, language
selection, navigation and analytics without changes.

Constitution check: static data only; feature layering preserved; all five
translations; existing theme/accessibility behavior; no backend, new dependency,
component barrel, secret, publication or Git action. First Load JS budget:
at most 1 kB increase on /mini-project for the additional localized data.

This is a reversible catalogue entry with no new logic, so no implementation-
mirroring test is added. Run typecheck, lint, tests and build in order. Verify the
exported catalogue contains the correct link and report the route bundle delta.

Validation found two pre-existing chat tests asserting a removed status-label UI
(the committed ChatWidget no longer renders it). Update only those assertions to
observe the mocked mascot's actual idle/thinking/replying state. Preserve the
request, reply, error and timing assertions; do not restore or change chat UI.
