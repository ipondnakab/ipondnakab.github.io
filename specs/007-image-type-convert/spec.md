# Image Type Convert

Add a browser-only image converter to Mini Projects at `/mini-project/image-type-convert`.
Users choose or drop one PNG, JPEG, or WebP (up to 20 MiB / 25 megapixels), preview
it, choose PNG/JPEG/WebP output and lossy quality, then download the result.
Preserve pixel dimensions. JPEG flattens transparency onto white; PNG/WebP retain
alpha. Output is a static image; animation and original metadata are not retained.
No image uploads, no backend, no new dependency. Reject unreadable files, oversized
images and unsupported encoders rather than downloading mislabeled PNG output.
All UI copy supports en/th/ja/sv/zh and both themes. Replacing/resetting an image
or leaving the route releases object URLs; obsolete async results are discarded.

Acceptance: converter is discoverable from catalogue and sitemap; conversion
produces a correctly typed file with a matching extension; failures are localized
and recoverable; keyboard users can select, convert, download and reset.
