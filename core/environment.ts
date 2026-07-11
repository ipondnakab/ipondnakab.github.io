export const environment = {
  pokerAdminSecret:
    process.env.NEXT_PUBLIC_PLANNING_POKER_ADMIN_SECRET ||
    "ฉันจะเป็นAdminให้ได้เลย",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};
