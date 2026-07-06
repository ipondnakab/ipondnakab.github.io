"use client";

import { Card } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

const CreditPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col p-2 gap-4 sm:gap-8 sm:p-8">
      <Card isBlurred className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t("credit.title")}
          </h1>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center">
            {t("credit.intro")}
          </p>

          <div className="space-y-8">
            <Card isBlurred className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t("credit.coreFramework")}
              </h2>
              <ul className="space-y-3">
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Next.js</strong> - {t("credit.nextDesc")}
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>React</strong> - {t("credit.reactDesc")}
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>TypeScript</strong> - {t("credit.typescriptDesc")}
                </li>
              </ul>
            </Card>

            <Card isBlurred className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t("credit.stylingUi")}
              </h2>
              <ul className="space-y-3">
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Tailwind CSS</strong> - {t("credit.tailwindDesc")}
                </li>
              </ul>
            </Card>

            <Card isBlurred className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t("credit.deployment")}
              </h2>
              <ul className="space-y-3">
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>GitHub Pages</strong> - {t("credit.githubPagesDesc")}
                </li>
              </ul>
            </Card>
          </div>
          <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
            <p>{t("credit.madeWith")}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreditPage;
