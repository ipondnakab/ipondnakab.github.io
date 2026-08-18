import type { Metadata } from "next";

import Contact from "@/features/contact/components/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Kittipat Daengdee — send a message directly, or reach out on any of the linked social profiles.",
  alternates: { canonical: "/contact" },
};

const ContactPage = () => {
  return <Contact />;
};

export default ContactPage;
