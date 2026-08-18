import type { Metadata } from "next";

import ContactSuccess from "@/features/contact/components/ContactSuccess";

export const metadata: Metadata = {
  title: "Message Sent",
  description: "Your message to Kittipat Daengdee has been sent.",
  robots: { index: false, follow: true },
};

const ContactSuccessPage = () => {
  return <ContactSuccess />;
};

export default ContactSuccessPage;
