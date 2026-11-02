"use client";

import { Card } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

export interface SpecKubShowcaseProps {}

const copy = {
  en: {
    eyebrow: "OPEN SOURCE · PERSONAL PROJECT",
    title: "SpecKub",
    description:
      "I built SpecKub to make API specifications easier to create, explore, and keep organized alongside code. It brings together a TypeScript CLI, a web explorer, and a workflow designed to work with AI coding tools.",
    cli: "CLI to set up and validate API specs",
    explorer: "Web explorer for browsing specs in a repository",
    workflow: "Spec-driven workflow built for AI-assisted development",
    website: "Visit SpecKub",
    github: "View on GitHub",
  },
  th: {
    eyebrow: "OPEN SOURCE · โปรเจกต์ส่วนตัว",
    title: "SpecKub",
    description:
      "ผมทำ SpecKub ขึ้นมาเพราะอยากให้การเขียนและดู API Spec ในโปรเจกต์เป็นเรื่องง่ายขึ้น ตัวโปรเจกต์มีทั้ง CLI และหน้าเว็บสำหรับเปิดดู Spec จาก Repository และออกแบบมาให้ใช้ร่วมกับ AI Coding Tools ได้",
    cli: "CLI สำหรับเริ่มต้นและตรวจสอบ API Spec",
    explorer: "หน้าเว็บสำหรับเปิดดู Spec ใน Repository",
    workflow: "แนวทางพัฒนาแบบ Spec-Driven ที่ใช้ร่วมกับ AI Tools ได้",
    website: "เข้าเว็บ SpecKub",
    github: "ดูโค้ดบน GitHub",
  },
  ja: {
    eyebrow: "オープンソース · 個人プロジェクト",
    title: "SpecKub",
    description:
      "API仕様をコードと一緒に作成・確認・整理しやすくするためにSpecKubを開発しました。TypeScript製CLIとWebエクスプローラーを備え、AIコーディングツールとの連携を想定しています。",
    cli: "API仕様の初期設定と検証を行うCLI",
    explorer: "リポジトリ内の仕様を閲覧できるWeb画面",
    workflow: "AI支援開発に対応した仕様駆動ワークフロー",
    website: "SpecKubを見る",
    github: "GitHubでコードを見る",
  },
  sv: {
    eyebrow: "ÖPPEN KÄLLKOD · EGET PROJEKT",
    title: "SpecKub",
    description:
      "Jag byggde SpecKub för att göra API-specifikationer enklare att skapa, utforska och hålla ordning på tillsammans med koden. Projektet har ett CLI i TypeScript, en webbvy och ett arbetsflöde för AI-assisterad utveckling.",
    cli: "CLI för att initiera och validera API-specifikationer",
    explorer: "Webbvy för specifikationer i ett kodförråd",
    workflow: "Specifikationsdrivet arbetsflöde med AI-stöd",
    website: "Besök SpecKub",
    github: "Se koden på GitHub",
  },
  zh: {
    eyebrow: "开源 · 个人项目",
    title: "SpecKub",
    description:
      "我开发了 SpecKub，希望让 API 规格更容易创建、浏览和与代码一起维护。项目包含 TypeScript CLI、网页浏览器，以及适合 AI 辅助开发的规格驱动工作流程。",
    cli: "用于初始化和验证 API 规格的 CLI",
    explorer: "浏览代码仓库中 API 规格的网页工具",
    workflow: "适用于 AI 辅助开发的规格驱动流程",
    website: "访问 SpecKub",
    github: "在 GitHub 查看源码",
  },
};

const SpecKubShowcase: React.FC<SpecKubShowcaseProps> = () => {
  const { i18n } = useTranslation();
  const language = i18n.language.split("-")[0] as keyof typeof copy;
  const text = copy[language] ?? copy.en;

  return (
    <section aria-labelledby="speckub-heading">
      <Card isBlurred className="p-5 sm:p-8 border border-foreground/10">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs tracking-widest text-foreground/50">
              {text.eyebrow}
            </p>
            <h2 id="speckub-heading" className="mt-2 text-2xl font-bold">
              {text.title}
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-foreground/75">
              {text.description}
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {[text.cli, text.explorer, text.workflow].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-foreground/10 bg-foreground/5 p-4 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
              href="https://www.speckub.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              {text.website} ↗
            </a>
            <a
              className="rounded-lg border border-foreground/20 px-4 py-2 font-medium"
              href="https://github.com/speckub/speckub"
              target="_blank"
              rel="noopener noreferrer"
            >
              {text.github} ↗
            </a>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SpecKubShowcase;
