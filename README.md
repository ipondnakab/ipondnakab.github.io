<p align="center">
    <a href="https://kittipat.dev" target="_blank"> 
        <img src="https://readme-typing-svg.herokuapp.com/?font=Fira+Code&duration=3000&pause=1000000&color=9B9B9B&background=FF000000&center=true&vCenter=true&width=435&lines=Hello+I%27m+KITTIPAT+DAENGDEE"/>
    </a>
</p>
<h3 align="center">🚀 Full-Stack Software Engineer  |  Problem Solver  |  Lifelong Learner</h3>

---

## 🧑‍💻 About Me

I am a **Full Stack Software Engineer with 5+ years of experience** in web and mobile application development and automated testing.

Since **March 2026**, I have worked as a **Full Stack Engineer at Omise**, developing **Alive**, a wellness application for AIA customers, using **Expo** for the frontend and **Spring Boot** for the backend.

My experience includes platforms for the **Stock Exchange of Thailand (SET)**, a **Japanese local-government tax management system**, and frontend development for **Speechful**, an AI-powered tutoring platform with audio processing and recording workflows.

I enjoy solving complex problems, collaborating with teams, and continuously improving my engineering skills.

---

## ⚙️ Tech Stack

### Frontend & Mobile

- React.js / Next.js / Vue.js / Angular
- React Native / Expo / Flutter
- Tailwind CSS / Bootstrap
- HTML / CSS / SCSS

### Backend & Data

- Spring Boot / Node.js / Deno
- SQL / Firebase
- LINE Messaging API

### Languages

- TypeScript / JavaScript / Java
- Python / Go / C++

### Testing & Tools

- Automated testing with Playwright
- AI-assisted development / SpecKit / spec-driven development
- Git / Docker / Jenkins
- Audio processing and recording workflows

### Communication

- Collaborative development and problem-solving
- English (Intermediate)

---

## 🎓 Education

🎓 **Bachelor of Computer Engineering**
Khon Kaen University (2018 – 2022)

---

## 💼 Work Experience

### Omise (Mar 2026 - Present)

**Full Stack Engineer**

- Developed **Alive** — a wellness application for AIA customers
- Used **AI-assisted development with SpecKit** in a **spec-driven development** workflow
- Built with:
  - 📱 Expo (Frontend)
  - ☕ Spring Boot (Backend)

---

### 💻 ODDS (May 2021 – Feb 2026)

**Software Engineer**

- 🏦 Developed platform for **Stock Exchange of Thailand (SET)**
  - React.js + Spring Boot + Node.js

- 🇯🇵 Built **Tax Management System** for Japanese local government
  - React.js + Node.js
  - 🧪 Automated testing with Playwright

---

### 🌱 ODDS (Summer 2021)

**Software Engineer Intern**

Projects:

- ⚡ **PEA Outage Map** — electricity outage tracking system
- 💰 **SafeBSC** — crypto portfolio management

Tech: React.js, Flutter, Node.js, Golang

---

### 🏢 Zercle Technology Co., Ltd. (Summer 2020)

**Fullstack Developer Intern**

- Developed web applications using:
  - Angular / Node.js / Deno
  - SQL / SCSS

---

## 🌟 Featured Projects

### 🧠 Speechful (speechful.ai)

AI-powered tutoring platform

- Frontend Developer (React + Tailwind)
- 🎧 Specialized in audio processing & recording workflows

---

### 👵 Pa Yai Ha Mor (NSC 2021)

Healthcare app for elderly assistance
🏆 Honorable Mention – National Software Contest 2021

- React Native + Node.js + Firebase

---

### 🎓 GSKKU Life Journey

Student life management platform

- React.js

---

### 🛒 SMT

Market management web application

- React.js + Node.js + Firebase

---

### 🐾 Pettinee

Veterinary consultation platform

- React.js + Node.js + Firebase
- LINE Messaging API

---

### 🏢 Real Control Technology

Corporate website + OKR platform

- React.js + Node.js + Firebase
- LINE Messaging API

---

## 📊 GitHub Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=ipondnakab&layout=compact&theme=tokyonight" />
</p>

---

## 📫 Contact Me

- 💼 LinkedIn: [Kittipat Daengdee](https://www.linkedin.com/in/kittipat-dd/)
- Portfolio: [Kittipat Daengdee](https://kittipat.dev/)

---

## ⚡ Fun Fact

I build things, break things, and rebuild them better 🚀

---

## 🛠️ Development

This repo is the source of [ipondnakab.github.io](https://ipondnakab.github.io) —
a Next.js 14 App Router site deployed to GitHub Pages as a **static export**.

```bash
yarn install
yarn dev          # http://localhost:3000

yarn typecheck    # tsc --noEmit
yarn lint         # eslint
yarn test         # vitest
yarn build        # static export -> ./dist
```

Code is organised by feature:

```
src/
├── app/          # routes — thin pages
├── features/     # one folder per feature: components/ lib/ model/ constants
└── shared/       # ui, layouts, providers, lib, config, i18n, types
```

Dependencies point one way — `app/` → `features/` → `shared/` — and ESLint
enforces it. See:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — the layering and why
- [docs/CODING_GUIDE.md](docs/CODING_GUIDE.md) — templates and detailed rules
- [docs/SPEC_DRIVEN_DEVELOPMENT.md](docs/SPEC_DRIVEN_DEVELOPMENT.md) — the Spec Kit workflow
- [.specify/memory/constitution.md](.specify/memory/constitution.md) — the non-negotiables

Anything needing a real backend lives in [`portfolio-api/`](portfolio-api/), a
separate Vercel project — the static export has no server.
