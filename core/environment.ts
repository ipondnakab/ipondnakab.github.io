// Origin of the portfolio API — a separate Vercel project (see portfolio-api/)
// because this site is a static export and cannot host API routes. No path, e.g.
// https://ipondnakab-portfolio-api.vercel.app
//
// One variable covers every endpoint, so adding an endpoint never means another
// value to keep in sync across .env, GitHub Actions and Vercel. A trailing slash
// is tolerated so a copy-paste from the browser bar doesn't produce "//api/chat".
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/+$/,
  "",
);

const endpoint = (path: string) => (apiBaseUrl ? `${apiBaseUrl}${path}` : "");

export const environment = {
  pokerAdminSecret: process.env.NEXT_PUBLIC_PLANNING_POKER_ADMIN_SECRET || "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  // Empty when unset: the chat widget hides itself, and the contact form
  // reports an error rather than pretending a message was delivered.
  chatApiUrl: endpoint("/api/chat"),
  contactApiUrl: endpoint("/api/contact"),
};
