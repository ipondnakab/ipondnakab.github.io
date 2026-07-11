"use client";

import { CardBody, Link } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineMail } from "react-icons/hi";

import { SOCIALS } from "@/constants/social";

import MotionCard from "./MotionCard";
import { slideIn } from "./motion";

export interface ContactPanelProps {}

const EMAIL = "ipondnakab@gmail.com";

// Chapter 6 — camera zooms to the face. A final, quiet card with clean links.
const ContactPanel: React.FC<ContactPanelProps> = () => {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-x-0 bottom-16 flex flex-col items-center px-6">
      <MotionCard
        isBlurred
        variants={slideIn(0, 26)}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="border border-foreground/10"
      >
        <CardBody className="px-8 py-7 text-center sm:px-12">
          <div className="mb-2 text-[11px] uppercase tracking-[0.5em] text-foreground/40">
            {t("resume.chapter.contact", "Contact")}
          </div>
          <h2 className="mb-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("resume.heading.contact", "Get in touch")}
          </h2>
          <p className="mb-6 text-sm text-foreground/55">{EMAIL}</p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href={`mailto:${EMAIL}`}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-foreground/15 text-lg text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground"
              aria-label={t("resume.contact.emailAria", "Email")}
            >
              <HiOutlineMail />
            </Link>
            {SOCIALS.map((social) => (
              <Link
                key={social.name}
                href={social.url}
                target="_blank"
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-foreground/15 text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground"
                aria-label={social.name}
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </CardBody>
      </MotionCard>
    </div>
  );
};

export default ContactPanel;
