# Plan

Render the existing feature ResumeDownload component by path in ProfileReadme,
in a final themed Card after OutsourceProjects. Reuse the existing localized
nav.resume heading and five-language resume.action.download label. Style the
native anchor as a primary button with visible keyboard focus. Keep the same
bundled PDF, download filename and click tracking.

Remove the navigationAction slot and app layout injection added for the prior
placement, restoring the original navbar layout and responsive breakpoints.

Constitution: static export; app → features → shared; cross-feature component
import by path; typed React.FC; no client barrel; no resources or dependencies;
all five locales; theme tokens and keyboard access. Budget: at most 1 kB First
Load JS increase per affected route. Measure all routes since removing the
navbar action affects the shared shell.

Existing behavioral tests cover the PDF target, native download and analytics.
This reversible placement change adds no logic and needs no duplicative test.
Run typecheck, lint, tests and build in order; inspect exported home markup for
final-section placement and absence from the global navigation. Browser visual
verification is limited by the unavailable browser connection in this session.
No Git commit, push or deployment.
