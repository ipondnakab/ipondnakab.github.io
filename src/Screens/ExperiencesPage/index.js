import React from "react";
import "./experiencesPage.css";

export default function ExperiencesPage({ isEnglish }) {
  const dataExperiences = [
    {
      en: "Experiences",
      th: "ประสบการณ์",
      data: [
        {
          en: "2018",
          th: "2018",
          data: [
            {
              en: "Developed an aplication using python languages.",
              th:
                "โปรเจ็ครายวิชา หลักมูลของการเขียนโปรแกรมคอมพิวเตอร์ ด้วยภาษา Python",
            },
            {
              en:
                "Developed an Android application using Java language, and Android Studio IDE.",
              th:
                "พัฒนาแอพพลิเคชันแอนดรอยด์ ด้วยภาษา Java และ Android Studio IDE",
            },
            {
              en: "Participated in PLC Competition 14th by TPA",
              th:
                "เข้าร่วมการแข่งขัน PLC Competition ครั้งที่ 14 จัดแข่งโดยสถาบันเทคโนโลยีไทยญี่ปุ่น",
            },
          ],
        },
        {
          en: "2019",
          th: "2019",
          data: [
            {
              en:
                "Participated in '12เทพสาย Dev มหาวิทยาลัยขอนแก่น' by Innovation Hub KKU and ThaiBev",
              th:
                "เข้าร่วมเวิร์คช็อปของโครงการ '12เทพสาย Dev มหาวิทยาลัยขอนแก่น' จัดโดย Innovation Hub ร่วมกับ บริษัทไทยเบฟเวอเรจ",
            },
            {
              en:
                "internship programs's Zercle Technology. Learn about website development, mySQL, framework NodeJS and framework Angular",
              th:
                "ได้เข้าร่วมโปรแกรมฝึกงานกับบริษัท Zercle Technology โดยได้เรียนรู้เรื่องการพัฒนาเว็บไซต์ เฟรมเวิร์ค NodeJS และ Angular",
            },
            {
              en: "Participated in PLC Competition 15th operated by TPA.",
              th:
                "เข้าร่วมการแข่งขัน PLC Competition ครั้งที่ 15 จัดแข่งโดยสถาบันเทคโนโลยีไทยญี่ปุ่น",
            },
          ],
        },
        {
          en: "2020",
          th: "2020",
          data: [
            {
              en:
                "Participated in training program of A Getting Started with SCB API to learn about using SCB API.",
              th:
                "เข้าร่วมเวิร์คช็อปของโครงการ Getting started with SCB API ได้รับความรู้เรื่องการใช้งาน SCB API จัดโดย ธนาคารไทยพานิช",
            },
            {
              en:
                "Participated in Inovetor Challenge by Software Park Thailand about the robot competition of AI system.",
              th:
                "เข้าร่วมการแข่งขันหุ่นยนต์ระบบ AI โครงการ Robo inovetor Challenge By Software Park Thailand ",
            },
            {
              en:
                "Guest speaker tlak about IoT (Internet of Things) and NodeMCU (ESP8266) in Smart camp.",
              th:
                "เป็นวิทยากรสอนเรื่อง IoT (Internet of things) และการใช้งาน NodeMCU(ESP8266) ของค่าย Smart Camp",
            },
            {
              en:
                "Developed web application of Shopping Farmacro with React, Firebase, Google API, and Facebook API.",
              th:
                "พัฒนาเว็บแอพพลิเคชัน Farmacro ด้วยเฟลมเวิร์ค React, Firebase, Google API และ Facebook API",
            },
            {
              en: "Developed data-base with React and Firebase.",
              th:
                "พัฒนาฐานข้อมูล ด้วย React และ Firebase",
            },
            {
              en:
                "I've participated with NSC (National Software Contest) (In process)",
              th:
                "เข้าร่วมโครงการ NSC (National Software Contest) ในขณะนี้ผ่านเข้ารอบคัดเลือก (อยู่ในระหว่างแข่ง)",
            },
          ],
        },
      ],
    },
    {
      en: "Other",
      th: "อื่นๆ",
      data: [
        {
          en: "Student Union Khon Kaen Univerity (2018 - 2020)",
          th: "ทำงานองค์การนักศึกษา (2018-2020)",
        },
        {
          en:
            "Head of Mechatronics Club, Faculty of Engineering, Khon Kaen Unuversity (2019 - Present)",
          th:
            "ประธานชุมนุมแม็คคาทรอนิกส์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยขอนแก่น (2019-ปัจจุบัน)",
        },
      ],
    },
  ];
  return (
    <div className="experiences-page">
      {dataExperiences.map((item, key) => {
        return (
          <div className="exp-content" key={key}>
            <h1>{isEnglish ? item.en : item.th}</h1>
            {item.data.map((data, i) => {
              return data.data ? (
                <div className="exp-container">
                  <h2>{isEnglish ? data.en : data.th}</h2>
                  <ul>
                    {data.data.map((exp) => (
                      <li>{isEnglish ? exp.en : exp.th}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ul>
                  <li>{isEnglish ? data.en : data.th}</li>
                </ul>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
