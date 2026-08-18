import { LocalizedText } from "@/interfaces/localized-text";
import { IconType } from "react-icons";
import { GiPokerHand } from "react-icons/gi";
import { IoMicOutline, IoQrCodeOutline } from "react-icons/io5";
import { MdOutlineStyle } from "react-icons/md";
import { SiThreedotjs } from "react-icons/si";

export const MINI_PROJECTS: {
  name: string;
  title: string;
  href: string;
  description: LocalizedText;
  icon: IconType;
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
    icon: SiThreedotjs,
  },
  {
    name: "planning-poker",
    title: "PLANNING POINT ESTIMATION",
    href: "/planning",
    description: {
      en: "A web-based Planning Point estimation app for Agile teams to estimate task complexity collaboratively.",
      th: "แอปพลิเคชัน Planning Point estimation บนเว็บ สำหรับทีม Agile ใช้ประเมินความซับซ้อนของงานร่วมกัน",
      sv: "En webbaserad Planning Point estimation-app för Agile-team som tillsammans uppskattar uppgifters komplexitet.",
      ja: "Agileチームがタスクの複雑さを共同で見積もるためのWebベースのPlanning Point estimationアプリ。",
      zh: "一款基于 Web 的 Planning Point estimation 应用，帮助 Agile 团队协作估算任务复杂度。",
    },
    icon: MdOutlineStyle,
  },
  {
    name: "pokdeng",
    title: "POKDENG CREDIT",
    href: "/pokdeng",
    description: {
      en: "A Pok Deng credit tracker: the host settles each turn against every player, with deng multipliers and zero-sum balances.",
      th: "ตัวช่วยนับเครดิตป๊อกเด้ง เจ้ามือจบตากับผู้เล่นทีละคน รองรับเด้งคูณและยอดรวมที่หักลบกันเป็นศูนย์",
      sv: "En Pok Deng-krediträknare där värden avslutar varje tur mot spelarna, med deng-multiplikatorer och nollsummesaldon.",
      ja: "ポークデンのクレジット管理ツール。親が各ターンをプレイヤーごとに精算し、デン倍率とゼロサムの収支に対応します。",
      zh: "Pok Deng 积分记录工具：庄家逐轮与玩家结算，支持倍数与零和积分。",
    },
    icon: GiPokerHand,
  },
  {
    name: "mic-link",
    title: "MIC LINK",
    href: "/mic-link",
    description: {
      en: "Turn your phone into a wireless microphone for any device on the same network — scan a QR code and the audio streams peer-to-peer in the browser.",
      th: "เปลี่ยนมือถือให้เป็นไมโครโฟนไร้สายสำหรับอุปกรณ์ในเครือข่ายเดียวกัน เพียงสแกน QR Code เสียงก็ส่งตรงถึงกันในเบราว์เซอร์",
      sv: "Förvandla telefonen till en trådlös mikrofon för valfri enhet i samma nätverk — skanna en QR-kod så strömmas ljudet direkt mellan enheterna i webbläsaren.",
      ja: "スマートフォンを同じネットワーク上の端末向けワイヤレスマイクに変えるツール。QRコードを読み取るだけで、ブラウザ間で音声を直接ストリーミングします。",
      zh: "把手机变成同一网络下任意设备的无线麦克风——扫描二维码，音频即可在浏览器之间点对点传输。",
    },
    icon: IoMicOutline,
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
    icon: IoQrCodeOutline,
  },
] as const;
