# Resume download

Visitors can save the existing resume PDF from the last section of the home
page (`/`), after the outsource projects section. A dedicated card contains a
localized resume heading and a keyboard accessible PDF download button styled
to match the site's theme. It is available on mobile and desktop. The navbar
and the interactive resume scene contain no download control.
Its label identifies the PDF format in all five supported languages. The link
serves the existing `public/Kittipat Resume Q4 2026.pdf`; translating the UI does
not change the document. The browser receives a native download hint and a
readable filename. The current page and chapter are preserved.

Acceptance: the link targets the bundled PDF, requests a download rather than
opening a new tab, remains readable in both themes, and records a download click.
No new route, document generation, backend, dependency or publication is needed.
