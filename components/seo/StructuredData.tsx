import React from "react";

import { SOCIALS } from "@/constants/social";

const SITE_URL = "https://ipondnakab.github.io";

// schema.org JSON-LD so search engines resolve "Kittipat Daengdee" to a single
// Person entity (name, role, socials, education, employer) and can surface a
// knowledge panel / rich result. Rendered once in the root layout.
const StructuredData: React.FC = () => {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Kittipat Daengdee",
        alternateName: ["Kittipat", "ipondnakab", "Pond"],
        jobTitle: "Full-Stack Software Engineer",
        description:
          "Kittipat Daengdee is a full-stack software engineer specializing in React, Next.js, TypeScript, Node.js and Spring Boot.",
        url: SITE_URL,
        image: `${SITE_URL}/images/profile2.jpg`,
        sameAs: SOCIALS.map((social) => social.url),
        worksFor: { "@type": "Organization", name: "ODDS" },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "Khon Kaen University",
        },
        nationality: "Thai",
        knowsLanguage: ["Thai", "English"],
        knowsAbout: [
          "Software Engineering",
          "Full-Stack Web Development",
          "React",
          "React Native",
          "Next.js",
          "TypeScript",
          "JavaScript",
          "Node.js",
          "Spring Boot",
          "Firebase",
          "AWS",
          "Docker",
          "Automated Testing",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Kittipat Daengdee — Full-Stack Software Engineer",
        inLanguage: "en",
        author: { "@id": `${SITE_URL}/#person` },
        publisher: { "@id": `${SITE_URL}/#person` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default StructuredData;
