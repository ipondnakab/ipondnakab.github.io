"use client";

import { Card } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

import {
  CREDITED_PROJECT_COUNT,
  CREDIT_CATEGORIES,
} from "@/features/credit/constants";
import { CreditedProject } from "@/features/credit/model/credit";

export interface CreditsProps {}

// A licence that is not an OSI open-source licence should read differently from
// the MIT chips around it, rather than blending in.
const isOpenSource = (license: string) =>
  license === "MIT" || license === "Apache-2.0";

// Plain <a> and <span> rather than NextUI's Link and Chip, and no trackEvent:
// this page is static text and outbound links. NextUI's react-aria machinery
// and the Firebase SDK that analytics pulls in (firebase/analytics imports the
// shared app, which also constructs Firestore) together cost ~155 kB of First
// Load JS here, for behaviour a credits page does not need.
const ProjectRow: React.FC<{ project: CreditedProject }> = ({ project }) => {
  const { t } = useTranslation();

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("credit.visit", { name: project.name })}
      className="flex flex-col gap-1 rounded-medium p-3 transition-colors hover:bg-default-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{project.name}</span>
        <span
          className={
            "ml-auto shrink-0 rounded-full px-2 py-0.5 text-tiny font-medium " +
            (isOpenSource(project.license)
              ? "bg-primary/15 text-primary"
              : "bg-default-200 text-default-600")
          }
        >
          {project.license}
        </span>
      </span>
      <span className="text-small text-default-500">{project.description}</span>
    </a>
  );
};

const Credits: React.FC<CreditsProps> = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 p-2 sm:gap-8 sm:p-8">
      <Card isBlurred className="p-6 sm:p-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("credit.title")}
          </h1>
          <p className="mx-auto max-w-2xl text-default-600">
            {t("credit.intro", { count: CREDITED_PROJECT_COUNT })}
          </p>
        </div>
      </Card>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        {CREDIT_CATEGORIES.map((category) => (
          <Card
            key={category.id}
            isBlurred
            className="flex flex-col gap-2 p-5 sm:p-6"
          >
            <h2 className="px-3 text-tiny font-semibold uppercase tracking-[0.2em] text-default-400">
              {t(`credit.category.${category.id}`)}
            </h2>
            <ul className="flex flex-col">
              {category.projects.map((project) => (
                <li key={project.name}>
                  <ProjectRow project={project} />
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card isBlurred className="mx-auto w-full max-w-5xl p-6 sm:p-8">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-default-600">{t("credit.thanks")}</p>
          <p className="text-small text-default-500">{t("credit.madeWith")}</p>
        </div>
      </Card>
    </div>
  );
};

export default Credits;
