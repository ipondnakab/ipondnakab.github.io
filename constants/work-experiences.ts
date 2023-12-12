import { WorkExperience } from "@/interfaces/work-experience";

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    urlImage: "./images/odds-logo.jpeg",
    title: "ODDS ( May 2021 - Present )",
    position: "Software Engineer",
    description: "Responsible for projects",
    projects: [
      {
        title: "DIPO (SET)",
        urlImage: "./images/set-logo.png",
        description:
          "Develop a website for SET (The Stock Exchange of Thailand) as an outsourcing worker in the DIPO Team using React.Js and Spring Boot for Frontend and Node.Js for Backend",
      },
      {
        title: "PAIR-CO",
        urlImage: "J",
        description:
          "Develop a taxes management website for Japan’s local government using React.Js for Frontend, Node.Js for Backend, and Playwright for Automated tests.",
      },
    ],
  },
  {
    urlImage: "./images/odds-logo.jpeg",
    title: "ODDS ( Summer 2021 )",
    description:
      "Internship in software development using React.js, Flutter, Node.js, Golang, and Agile. I have been assigned to the following projects",
    position: "Software Engineer Intern",
    projects: [
      {
        title: "PEA",
        urlImage: "./images/pea-logo.jpeg",
        description:
          "PEA Outage Map: a web application for checking areas with power outages.",
      },
      {
        title: "SafeBSC",
        urlImage: "./images/safe-bsc-logo.png",
        description:
          "SafeBSC: a web application for finance portfolio digital currency.",
      },
    ],
  },
  {
    urlImage: "./images/zercle-logo.jpg",
    title: "Zercle Technology Co., Ltd. ( Summer 2020 )",
    description:
      "3 months internship on Website development with Angular, SQL, Node.Js, Deno.JS, HTML, CSS, SCSS",
    position: "Fullstack Develop Intern",
  },
];
