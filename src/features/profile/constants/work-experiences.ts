import { WorkExperience } from "@/features/profile/model/work-experience";

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    urlImage: "./images/omise-logo.jpeg",
    title: {
      en: "Omise ( Mar 2026 - Present )",
      th: "Omise ( มี.ค. 2026 - ปัจจุบัน )",
      sv: "Omise ( Mars 2026 - Nuvarande )",
      ja: "Omise（2026年3月 - 現在）",
      zh: "Omise（2026年3月 - 至今）",
    },
    position: "Full Stack Engineer",
    description: {
      en: "Full-Stack Engineer in Omise's Professional team, assigned to AIA. Design technical solutions, develop React Native and Spring Boot features, and collaborate with 8 developers and 4 QA engineers on reviews, testing, and releases.",
      th: "ทำงานเป็น Full-Stack Engineer ที่ Omise ในโปรเจกต์ของ AIA ดูแลทั้งงาน React Native และ Spring Boot ตั้งแต่คุยความต้องการ ออกแบบวิธีทำ ไปจนถึงพัฒนาฟีเจอร์จริง ทำงานร่วมกับ Developer อีก 8 คนและ QA 4 คน มีทั้งช่วยรีวิวโค้ด ทดสอบ และเตรียมขึ้น Production",
      sv: "Fullstackutvecklare i Omises Professional-team, placerad hos AIA. Utformar tekniska lösningar och utvecklar funktioner med React Native och Spring Boot i samarbete med 8 utvecklare och 4 QA kring kodgranskning, testning och leveranser.",
      ja: "OmiseのProfessionalチームに所属し、AIAに参画するフルスタックエンジニア。React NativeとSpring Bootによる機能開発と技術設計を担当し、開発者8名・QA4名とコードレビュー、テスト、リリースで協働。",
      zh: "Omise Professional 团队的全栈工程师，派驻 AIA。负责技术方案设计及 React Native、Spring Boot 功能开发，并与 8 名开发人员和 4 名 QA 合作进行代码审查、测试和发布。",
    },
    projects: [
      {
        title: "Alive (AIA)",
        urlImage: "./images/aia-alive-logo.png",
        description: {
          en: "Developed Alive by AIA using React Native (Expo), TypeScript, Java, and Spring Boot. Designed and implemented Alive Activity for iOS and Android, integrating step-count and distance data into activity competitions and reward points, including Android Health Connect integration. Designed the activity leaderboard and participant ranking using Redis Sorted Sets (ZSET) and ZRANK. Contributed to REST APIs, data models, backend integrations, automated testing, and production releases; used SpecKit for AI-assisted, specification-driven development.",
          th: "พัฒนาแอป Alive by AIA ด้วย React Native (Expo) และ Spring Boot หนึ่งในฟีเจอร์ที่ได้ทำคือ Alive Activity ซึ่งรองรับทั้ง iOS และ Android โดยนำข้อมูลก้าวเดินและระยะทางมาใช้กับกิจกรรมแข่งขันและการสะสมคะแนน ฝั่ง Android มีการเชื่อมต่อกับ Health Connect ส่วนระบบจัดอันดับผู้เข้าร่วมกิจกรรม ผมเป็นคนออกแบบ Leaderboard โดยใช้ Redis Sorted Sets (ZSET) และ ZRANK นอกจากงานในแอป ยังได้ทำ REST API และเชื่อมต่อกับระบบ Backend รวมถึงใช้ SpecKit และ AI ช่วยจัดการสเปกและพัฒนางาน",
          sv: "Utvecklade Alive by AIA med React Native (Expo), TypeScript, Java och Spring Boot. Utformade och implementerade Alive Activity för iOS och Android, där steg- och distansdata används i aktivitetstävlingar och för belöningspoäng, inklusive integration med Android Health Connect. Utformade topplistan och deltagarrankningen med Redis Sorted Sets (ZSET) och ZRANK. Bidrog till REST-API:er, datamodeller, integrationer, automatiserade tester och produktionsleveranser samt använde SpecKit för AI-stödd, specifikationsdriven utveckling.",
          ja: "React Native（Expo）、TypeScript、Java、Spring BootでAlive by AIAを開発。iOSとAndroid向けのAlive Activityを設計・実装し、歩数・距離データをアクティビティ競争と報酬ポイントに活用。Android Health Connectとの連携も担当。Redis Sorted Sets（ZSET）とZRANKを使用したリーダーボードと参加者ランキングを設計。REST API、データモデル、システム連携、自動テスト、リリースにも参加し、SpecKitによるAI支援の仕様駆動開発を活用。",
          zh: "使用 React Native（Expo）、TypeScript、Java 和 Spring Boot 开发 Alive by AIA。设计并实现面向 iOS 和 Android 的 Alive Activity，将步数和距离数据用于活动竞赛及奖励积分，并集成 Android Health Connect。使用 Redis Sorted Sets（ZSET）和 ZRANK 设计活动排行榜及参与者排名。参与 REST API、数据模型、系统集成、自动化测试和生产发布，并使用 SpecKit 进行 AI 辅助的规格驱动开发。",
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
      en: "Developed enterprise React and Spring Boot applications, improving existing component architecture and building REST APIs. Collaborated with 4 developers and 2 QA engineers on technical discussions, code reviews, and delivery.",
      th: "ทำงานพัฒนาเว็บแอปด้วย React และ Spring Boot ทั้งฝั่ง Frontend และ Backend โดยเฉพาะงานฟอร์มที่มีเงื่อนไขค่อนข้างเยอะ ได้ปรับ Component เดิมให้ใช้ซ้ำและแก้ไขต่อได้ง่ายขึ้น ทำงานร่วมกับ Developer 4 คนและ QA 2 คน รวมถึงช่วยรีวิวโค้ดและคุยแนวทางการพัฒนากับทีม",
      sv: "Utvecklade företagsapplikationer med React och Spring Boot, förbättrade befintlig komponentarkitektur och byggde REST-API:er. Samarbetade med 4 utvecklare och 2 QA kring tekniska diskussioner, kodgranskning och leverans.",
      ja: "ReactとSpring Bootによる業務システムを開発し、既存のコンポーネント構成を改善、REST APIを実装。開発者4名・QA2名と技術検討、コードレビュー、開発に従事。",
      zh: "使用 React 和 Spring Boot 开发企业应用，改进现有组件架构并构建 REST API。与 4 名开发人员和 2 名 QA 协作进行技术讨论、代码审查及交付。",
    },
    projects: [
      {
        title: "DIPO (SET)",
        urlImage: "./images/set-logo.png",
        description: {
          en: "Developed SET DIPO features using React and Spring Boot, including complex data-driven forms with dynamic fields, multi-step flows, nested groups, conditional validation, and multiple API integrations. Improved an existing component architecture with reusable inputs, configurable sections, custom hooks, and shared validation patterns to reduce repetitive work when creating new forms. Implemented Spring Boot REST endpoints for form submission, validation, database operations, and internal integrations.",
          th: "ในโปรเจกต์ SET DIPO ผมทำทั้ง React และ Spring Boot งานหลักอย่างหนึ่งคือฟอร์มที่ค่อนข้างซับซ้อน เช่น ฟิลด์ที่เปลี่ยนตามข้อมูลที่ผู้ใช้กรอก ฟอร์มหลายขั้นตอน และการตรวจสอบเงื่อนไขต่าง ๆ ผมปรับ Component ที่ทีมมีอยู่แล้วให้ใช้ซ้ำได้สะดวกขึ้น ทั้งส่วน Input, Form Section และ Validation ทำให้เวลาเพิ่มฟอร์มใหม่ไม่ต้องเริ่มเขียนทุกอย่างซ้ำ ส่วนฝั่ง Backend ได้พัฒนา REST API สำหรับรับและตรวจสอบข้อมูล ติดต่อฐานข้อมูล และเชื่อมต่อระบบภายใน",
          sv: "Utvecklade SET DIPO med React och Spring Boot, inklusive komplexa formulär med dynamiska fält, flerstegsflöden, nästlade grupper, villkorsstyrd validering och flera API-integrationer. Förbättrade befintlig komponentarkitektur med återanvändbara fält, konfigurerbara sektioner, egna hooks och gemensam validering för att minska repetitivt arbete. Byggde REST-API:er för formulär, validering, databasoperationer och interna integrationer.",
          ja: "ReactとSpring BootでSET DIPOを開発。動的フィールド、複数ステップ、ネストした項目、条件付きバリデーション、複数API連携を含む複雑なフォームを実装。再利用可能な入力部品、設定可能なセクション、カスタムフック、共通バリデーションにより既存構成を改善し、新規フォーム作成時の重複作業を削減。フォーム送信、検証、DB操作、内部連携のREST APIも実装。",
          zh: "使用 React 和 Spring Boot 开发 SET DIPO，包括动态字段、多步骤流程、嵌套字段组、条件校验和多 API 集成的复杂表单。通过可复用输入组件、可配置表单区块、自定义 Hooks 和共享校验规则改进现有组件架构，减少新表单开发中的重复工作。开发用于表单提交、数据验证、数据库操作及内部集成的 REST API。",
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
