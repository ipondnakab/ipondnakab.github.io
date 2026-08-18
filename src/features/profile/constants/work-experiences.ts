import { WorkExperience } from "@/interfaces/work-experience";

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    urlImage: "./images/omise-logo.jpeg",
    title: {
      en: "ODDS ( Mar 2026 - Present )",
      th: "ODDS ( มี.ค. 2026 - ปัจจุบัน )",
      sv: "ODDS ( Mars 2026 - Nuvarande )",
      ja: "ODDS（2026年3月 - 現在）",
      zh: "ODDS（2026年3月 - 至今）",
    },
    position: "Full Stack Engineer",
    description: {
      en: "Responsible for projects",
      th: "รับผิดชอบดูแลโปรเจกต์",
      sv: "Ansvarig för projekt.",
      ja: "プロジェクトを担当。",
      zh: "负责项目开发与维护。",
    },
    projects: [
      {
        title: "Alive (AIA)",
        urlImage: "./images/aia-alive-logo.png",
        description: {
          en: "Alive: a application for AIA’s customers to manage their wellness and well-being. Built using Expo for Frontend and Spring Boot for Backend.",
          th: "Alive: แอปพลิเคชันสำหรับลูกค้า AIA เพื่อดูแลสุขภาพและความเป็นอยู่ที่ดี พัฒนาด้วย Expo สำหรับ Frontend และ Spring Boot สำหรับ Backend",
          sv: "Alive: En applikation för AIA:s kunder för att hantera hälsa och välmående. Byggd med Expo för Frontend och Spring Boot för Backend.",
          ja: "Alive: AIAのお客様が健康やウェルビーイングを管理するためのアプリケーション。FrontendはExpo、BackendはSpring Bootを使用。",
          zh: "Alive：AIA 客户用于管理健康和生活品质的应用程序。Frontend 使用 Expo，Backend 使用 Spring Boot 开发。",
        },
      },
    ],
  },
  {
    urlImage: "./images/odds-logo.jpeg",
    title: {
      en: "ODDS ( May 2021 - Feb 2026 )",
      th: "ODDS ( พ.ค. 2021 - ก.พ. 2026 )",
      sv: "ODDS ( Maj 2021 - Feb 2026 )",
      ja: "ODDS（2021年5月 - 2026年2月）",
      zh: "ODDS（2021年5月 - 2026年2月）",
    },
    position: "Software Engineer",
    description: {
      en: "Responsible for projects",
      th: "รับผิดชอบดูแลโปรเจกต์",
      sv: "Ansvarig för projekt.",
      ja: "プロジェクトを担当。",
      zh: "负责项目开发与维护。",
    },
    projects: [
      {
        title: "DIPO (SET)",
        urlImage: "./images/set-logo.png",
        description: {
          en: "Develop a website for SET (The Stock Exchange of Thailand) as an outsourcing worker in the DIPO Team using React.js and Spring Boot for Frontend and Node.js for Backend.",
          th: "พัฒนาเว็บไซต์ให้ตลาดหลักทรัพย์แห่งประเทศไทย (SET) ในฐานะทีมรับจ้างพัฒนา (DIPO Team) โดยใช้ React.js และ Spring Boot สำหรับ Frontend และ Node.js สำหรับ Backend",
          sv: "Utvecklade en webbplats för SET (The Stock Exchange of Thailand) som konsult i DIPO-teamet med React.js och Spring Boot för Frontend samt Node.js för Backend.",
          ja: "DIPOチームのアウトソーシングメンバーとして、タイ証券取引所（SET）のWebサイトを開発。FrontendはReact.jsとSpring Boot、BackendはNode.jsを使用。",
          zh: "作为 DIPO 团队外包成员，为泰国证券交易所（SET）开发网站。Frontend 使用 React.js 和 Spring Boot，Backend 使用 Node.js。",
        },
      },
      {
        title: "PAIR-CO",
        urlImage: "J",
        description: {
          en: "Develop a taxes management website for Japan’s local government using React.js for Frontend, Node.js for Backend, and Playwright for Automated Testing.",
          th: "พัฒนาเว็บไซต์ระบบจัดการภาษีให้หน่วยงานท้องถิ่นของประเทศญี่ปุ่น โดยใช้ React.js สำหรับ Frontend, Node.js สำหรับ Backend และ Playwright สำหรับการทดสอบอัตโนมัติ",
          sv: "Utvecklade ett skattehanteringssystem för Japans lokala myndigheter med React.js för Frontend, Node.js för Backend och Playwright för Automated Testing.",
          ja: "日本の地方自治体向け税務管理システムを開発。FrontendはReact.js、BackendはNode.js、Automated TestingにはPlaywrightを使用。",
          zh: "为日本地方政府开发税务管理系统。Frontend 使用 React.js，Backend 使用 Node.js，并使用 Playwright 进行 Automated Testing。",
        },
      },
    ],
  },
  {
    urlImage: "./images/odds-logo.jpeg",
    title: {
      en: "ODDS ( Summer 2021 )",
      th: "ODDS ( ช่วงซัมเมอร์ 2021 )",
      sv: "ODDS ( Sommaren 2021 )",
      ja: "ODDS（2021年夏）",
      zh: "ODDS（2021年夏季）",
    },
    description: {
      en: "Internship in Software Development using React.js, Flutter, Node.js, Golang, and Agile. Assigned to the following projects.",
      th: "ฝึกงานด้านการพัฒนาซอฟต์แวร์ โดยใช้ React.js, Flutter, Node.js, Golang และ Agile ได้รับมอบหมายให้ทำโปรเจกต์ต่อไปนี้",
      sv: "Praktik inom Software Development med React.js, Flutter, Node.js, Golang och Agile. Arbetade med följande projekt.",
      ja: "React.js、Flutter、Node.js、Golang、Agileを使用したSoftware Developmentのインターンシップ。以下のプロジェクトを担当。",
      zh: "参与 Software Development 实习，使用 React.js、Flutter、Node.js、Golang 和 Agile，并负责以下项目。",
    },
    position: "Software Engineer Intern",
    projects: [
      {
        title: "PEA",
        urlImage: "./images/pea-logo.jpeg",
        description: {
          en: "PEA Outage Map: A web application for checking power outage areas.",
          th: "PEA Outage Map: เว็บแอปพลิเคชันสำหรับตรวจสอบพื้นที่ที่ไฟฟ้าดับ",
          sv: "PEA Outage Map: En webbapplikation för att kontrollera områden med strömavbrott.",
          ja: "PEA Outage Map: 停電エリアを確認するためのWebアプリケーション。",
          zh: "PEA Outage Map：用于查询停电区域的 Web 应用程序。",
        },
      },
      {
        title: "SafeBSC",
        urlImage: "./images/safe-bsc-logo.png",
        description: {
          en: "SafeBSC: A web application for managing cryptocurrency investment portfolios.",
          th: "SafeBSC: เว็บแอปพลิเคชันสำหรับบริหารพอร์ตการเงินสกุลเงินดิจิทัล",
          sv: "SafeBSC: En webbapplikation för att hantera investeringsportföljer för kryptovalutor.",
          ja: "SafeBSC: 暗号資産ポートフォリオを管理するためのWebアプリケーション。",
          zh: "SafeBSC：用于管理加密货币投资组合的 Web 应用程序。",
        },
      },
    ],
  },
  {
    urlImage: "./images/zercle-logo.jpg",
    title: {
      en: "Zercle Technology Co., Ltd. ( Summer 2020 )",
      th: "Zercle Technology Co., Ltd. ( ช่วงซัมเมอร์ 2020 )",
      sv: "Zercle Technology Co., Ltd. ( Sommaren 2020 )",
      ja: "Zercle Technology Co., Ltd.（2020年夏）",
      zh: "Zercle Technology Co., Ltd.（2020年夏季）",
    },
    description: {
      en: "3-month internship in Website Development using Angular, SQL, Node.js, Deno.js, HTML, CSS, and SCSS.",
      th: "ฝึกงาน 3 เดือน ด้านการพัฒนาเว็บไซต์ด้วย Angular, SQL, Node.js, Deno.js, HTML, CSS และ SCSS",
      sv: "Tre månaders praktik inom Website Development med Angular, SQL, Node.js, Deno.js, HTML, CSS och SCSS.",
      ja: "Angular、SQL、Node.js、Deno.js、HTML、CSS、SCSSを使用したWebsite Developmentの3か月間のインターンシップ。",
      zh: "为期 3 个月的 Website Development 实习，使用 Angular、SQL、Node.js、Deno.js、HTML、CSS 和 SCSS。",
    },
    position: "Fullstack Developer Intern",
  },
];
