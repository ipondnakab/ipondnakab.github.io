import React from "react";

import { SITE_URL } from "@/constants/site";

// Server-rendered, crawlable content + structured data for the Planning Poker
// page. The interactive tool above it is a client component that renders almost
// nothing into the static HTML, so this section is what search engines actually
// index. Kept as a pure server component (no "use client", no i18n) so all the
// copy ships in the prerendered HTML in the site's default (English) language.

const PAGE_URL = `${SITE_URL}/planning`;

const FEATURES = [
  {
    title: "Real-time voting",
    body: "Everyone's cards flip at once with live sync — no refreshing, no waiting for results.",
  },
  {
    title: "No sign-up, no install",
    body: "Share a room link and start estimating in seconds. Teammates join with just a name.",
  },
  {
    title: "Custom decks",
    body: "Estimate with the Fibonacci sequence, T-shirt sizes, or your own custom card values.",
  },
  {
    title: "Team groups",
    body: "Colour-code voters by squad and sort the table by group so everyone sees the same layout.",
  },
  {
    title: "Round history",
    body: "Every revealed round is saved to a shared history with its average and per-player votes.",
  },
  {
    title: "Works everywhere",
    body: "Runs on desktop, tablet and mobile, with the interface available in five languages.",
  },
];

const STEPS = [
  {
    title: "Create a room",
    body: "Click Start New Game to open a private estimation room.",
  },
  {
    title: "Invite your team",
    body: "Share the room link — teammates join instantly by entering a name.",
  },
  {
    title: "Estimate together",
    body: "Pick a card, reveal every vote at once, discuss, then reset for the next story.",
  },
];

const BENEFITS = [
  "Reduces anchoring bias — simultaneous reveal keeps every estimate independent.",
  "Surfaces hidden complexity — disagreement triggers valuable discussion before work starts.",
  "Engages the whole team — everyone votes, so knowledge isn't siloed in one person.",
  "Reaches consensus faster — structured rounds converge quickly instead of endless debate.",
  "Improves sprint planning — relative sizing makes velocity and forecasting more reliable.",
  "Perfect for remote teams — a shared link replaces physical cards and a meeting room.",
];

const DECKS_INFO = [
  {
    title: "Fibonacci",
    body: "0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89. The widening gaps reflect rising uncertainty in larger items and discourage false precision. Includes ‘?’ for uncertainty and ‘☕’ for a break.",
  },
  {
    title: "T-shirt sizes",
    body: "XS, S, M, L, XL, XXL. A fast, low-pressure scale that's ideal for high-level or non-technical estimation and early backlog refinement.",
  },
  {
    title: "Custom deck",
    body: "Define your own comma-separated values — for example 0.5, 1, 2, 4, 8 — to match exactly how your team already sizes work.",
  },
];

const TIPS = [
  "Estimate effort and complexity, not hours — story points are relative, not a time promise.",
  "Keep a reference story everyone agrees on (say, a 3) and size new items against it.",
  "Discuss the outliers first — let the highest and lowest voters explain before re-voting.",
  "Re-vote instead of averaging — averaging hides disagreement; a quick second round is better.",
  "Timebox each item to a minute or two so the session keeps moving.",
];

const FAQS = [
  {
    q: "Is this Planning Poker tool free?",
    a: "Yes. It's completely free with no sign-up, account, or installation — just open a room and share the link with your team.",
  },
  {
    q: "What is Planning Poker?",
    a: "Planning Poker, also called Scrum Poker, is an agile estimation technique where team members privately vote on the effort of a task with cards, then reveal at the same time to reach a shared story-point estimate.",
  },
  {
    q: "Which estimation decks are supported?",
    a: "You can estimate with the Fibonacci sequence (0, 1, 2, 3, 5, 8, 13…), T-shirt sizes (XS to XXL), or a fully custom deck you define yourself.",
  },
  {
    q: "Do teammates need to create an account?",
    a: "No. Anyone with the room link can join by entering a name — there's no registration or login required.",
  },
  {
    q: "Can we review past estimates?",
    a: "Yes. Each revealed round is saved to a shared round history, so your team can revisit previous story points, averages and individual votes.",
  },
  {
    q: "Is Planning Poker good for remote teams?",
    a: "Absolutely. It runs entirely in the browser and syncs in real time, so distributed teams share a single room link and estimate together exactly as they would in person — no physical cards or shared meeting room required.",
  },
  {
    q: "What's the difference between Fibonacci and T-shirt sizing?",
    a: "Fibonacci uses numbers with widening gaps to express growing uncertainty and feeds directly into velocity; T-shirt sizes (XS to XXL) are a faster, more approachable scale for early or high-level estimation. You can switch decks at any time.",
  },
  {
    q: "How many people can join a room?",
    a: "There's no fixed cap for a normal team. Planning Poker works best at typical Scrum team sizes — roughly 3 to 10 people — so every voter can take part in the discussion.",
  },
  {
    q: "Is my team's data private?",
    a: "Rooms are anonymous — there's no account or login, and a room is reachable only through its link. Names, votes and round history are kept in a realtime database purely to keep everyone in the room in sync.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${PAGE_URL}/#app`,
      name: "Planning Poker",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web browser",
      url: PAGE_URL,
      description:
        "Free online Planning Poker (Scrum Poker) for agile teams to estimate story points together in real time, with custom decks, team groups and shared round history.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: FEATURES.map((feature) => feature.title),
      inLanguage: ["en", "th", "ja", "zh", "sv"],
      isAccessibleForFree: true,
      author: {
        "@type": "Person",
        name: "Kittipat Daengdee",
        url: SITE_URL,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}/#faq`,
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

const PlanningPokerSeo: React.FC = () => {
  return (
    <section
      aria-label="About Planning Poker"
      className="mx-auto max-w-6xl px-4 py-16 text-foreground md:px-8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold md:text-4xl">
          Free Online Planning Poker
        </h1>
        <p className="mt-4 text-foreground/70">
          Real-time Scrum Poker for agile teams. Estimate story points together,
          reveal every vote at once, and reach consensus faster — with no
          sign-up and nothing to install. Create a room, share the link, and
          start your sprint planning in seconds.
        </p>
      </header>

      <h2 className="mt-14 text-2xl font-semibold">What is Planning Poker?</h2>
      <div className="mt-4 max-w-3xl space-y-4 text-foreground/70">
        <p>
          Planning Poker — also called Scrum Poker or pointing poker — is a
          consensus-based estimation technique used by agile and Scrum teams to
          size the relative effort of product backlog items. Instead of one
          person guessing, every team member privately picks a card representing
          their estimate, and all cards are revealed at the same time. Because
          votes stay hidden until the reveal, no one is anchored by the loudest
          voice in the room and each estimate stays independent.
        </p>
        <p>
          When estimates differ, the gap sparks a short discussion: the highest
          and lowest voters explain their reasoning, the team surfaces hidden
          assumptions and edge cases, and then re-votes. A round or two usually
          converges on a shared story-point estimate the whole team stands
          behind — turning estimation into a fast, collaborative conversation
          rather than a guessing game.
        </p>
      </div>

      <h2 className="mt-14 text-2xl font-semibold">Why use Planning Poker?</h2>
      <ul className="mt-4 max-w-3xl space-y-2 text-foreground/70">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex gap-2.5">
            <span aria-hidden className="mt-0.5 text-primary">
              ▹
            </span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-2xl font-semibold">Features</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5"
          >
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-1.5 text-sm text-foreground/60">{feature.body}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-2xl font-semibold">Estimation decks</h2>
      <p className="mt-4 max-w-3xl text-foreground/70">
        Pick the scale that fits your team — and switch decks at any time
        without leaving the room.
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {DECKS_INFO.map((deck) => (
          <li
            key={deck.title}
            className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5"
          >
            <h3 className="font-semibold">{deck.title}</h3>
            <p className="mt-1.5 text-sm text-foreground/60">{deck.body}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-2xl font-semibold">How it works</h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5"
          >
            <span className="text-sm font-bold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-1 font-semibold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-foreground/60">{step.body}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-2xl font-semibold">
        Tips for accurate estimates
      </h2>
      <ul className="mt-4 max-w-3xl space-y-2 text-foreground/70">
        {TIPS.map((tip) => (
          <li key={tip} className="flex gap-2.5">
            <span aria-hidden className="mt-0.5 text-primary">
              ▹
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-2xl font-semibold">
        Frequently asked questions
      </h2>
      <dl className="mt-4 max-w-3xl divide-y divide-foreground/10">
        {FAQS.map((item) => (
          <div key={item.q} className="py-4">
            <dt className="font-medium text-foreground">{item.q}</dt>
            <dd className="mt-1.5 text-sm text-foreground/60">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default PlanningPokerSeo;
