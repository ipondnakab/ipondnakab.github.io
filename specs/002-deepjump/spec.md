# Deepjump

A mobile-friendly deeplink launcher at /deepjump, discoverable in Mini Projects.
Paste an absolute custom-scheme, HTTP(S), or Android intent link and tap Jump.
Never launch automatically. Preserve the trimmed link exactly, including query
parameters, encoding and intent extras. Reject empty, relative, malformed links,
control characters and executable/local browser schemes.

Save jump attempts (not confirmed app opens) in localStorage before navigation.
Restore after refresh; newest first, deduplicated by exact URL, maximum 50 entries.
History supports jumping again, deleting one entry and clearing all entries.
Invalid/corrupt saved data is ignored. Storage failures show localized feedback
but do not block jumping. No account, backend or new dependency.

Acceptance: tap and Enter launch valid links directly within the user gesture;
invalid input does not navigate or enter history; reload restores history;
repeat jumps move links to the front; removal persists. All five locales,
keyboard access, mobile width, light and dark themes. Explain installed-app and
browser support requirements without claiming an app was successfully opened.

## Theme and mobile refinement

Match the site's primary accent, translucent content surfaces, rounded panels
and icon treatment. Support 320px screens without horizontal overflow, wrap long
URLs and translated controls, provide at least 48px touch targets, a full-width
56px Jump button, 16px input text and URL keyboard hints. History actions share
the available width on mobile and align beside the URL on larger screens.

## History confirmation

Delete and Clear history open a themed, mobile-friendly confirmation modal.
Deleting shows the selected URL; clearing explains that all saved links will be
removed. Only explicit confirmation changes history/localStorage. Cancel, Escape
or dismissing the modal preserves history. Cancel receives initial focus.
