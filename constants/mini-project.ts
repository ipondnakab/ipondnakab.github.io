import { LocalizedText } from "@/interfaces/localized-text";

export const MINI_PROJECTS: {
  name: string;
  title: string;
  href: string;
  description: LocalizedText;
}[] = [
  {
    name: "threejs",
    title: "THREE.JS",
    href: "/threejs",
    description: {
      en: "A collection of mini-projects built with Three.js, showcasing various 3D graphics techniques and interactive experiences.",
      th: "รวมมินิโปรเจกต์ที่สร้างด้วย Three.js เพื่อสาธิตเทคนิคกราฟิก 3 มิติและประสบการณ์เชิงโต้ตอบในรูปแบบต่างๆ",
      sv: "En samling Mini Projects byggda med Three.js som visar olika 3D-grafiktekniker och interaktiva upplevelser.",
      ja: "Three.jsで開発したMini Projects集。さまざまな3Dグラフィックス技術やインタラクティブな表現を紹介しています。",
      zh: "使用 Three.js 开发的一系列 Mini Projects，展示了多种 3D 图形技术和交互式体验。",
    },
  },
  {
    name: "planning-poker",
    title: "PLANNING POKER",
    href: "/planning-poker",
    description: {
      en: "A web-based Planning Poker app for Agile teams to estimate task complexity collaboratively.",
      th: "แอปพลิเคชัน Planning Poker บนเว็บ สำหรับทีม Agile ใช้ประเมินความซับซ้อนของงานร่วมกัน",
      sv: "En webbaserad Planning Poker-app för Agile-team som tillsammans uppskattar uppgifters komplexitet.",
      ja: "Agileチームがタスクの複雑さを共同で見積もるためのWebベースのPlanning Pokerアプリ。",
      zh: "一款基于 Web 的 Planning Poker 应用，帮助 Agile 团队协作估算任务复杂度。",
    },
  },
  {
    name: "prompt-pay",
    title: "PROMPTPAY",
    href: "/prompt-pay",
    description: {
      en: "A simple PromptPay QR code generator that allows users to create QR codes for easy payments.",
      th: "เครื่องมือสร้าง QR Code พร้อมเพย์อย่างง่าย ให้ผู้ใช้สร้าง QR Code เพื่อรับชำระเงินได้สะดวก",
      sv: "Ett enkelt verktyg för att skapa PromptPay QR-koder så att användare enkelt kan ta emot betalningar.",
      ja: "簡単にPromptPayのQRコードを生成し、スムーズに支払いを受け取れるツールです。",
      zh: "一个简单的 PromptPay 二维码生成工具，帮助用户快速创建收款二维码。",
    },
  },
] as const;
