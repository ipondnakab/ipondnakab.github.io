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
              en:
                "Course projects Fundamentals of computer programming an aplication using python languages",
              th:
                "โปรเจ็ครายวิชา หลักมูลของการเขียนโปรแกรมคอมพิวเตอร์ ด้วยภาษา Python",
            },
            {
              en:
                "Course projects Advanced computer programming make an android application using Java languages and android studio IDE",
              th:
                "โปรเจ็ครายวิชา หลักมูลของการเขียนโปรแกรมคอมพิวเตอร์ โดยพัฒนาแอพลิเคชันแอนดรอย์ ด้วยภาษา Java และ Android Studio IDE",
            },
            {
              en: "I've joined the race a PLC Competition 14th by TPA",
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
                "I've joined the race a '12เทพสาย Dev มหาวิทยาลัยขอนแก่น' by Innovation Hub KKU and ThaiBev",
              th:
                "เข้าร่วมเวิร์คช็อปของโครงการ '12เทพสาย Dev มหาวิทยาลัยขอนแก่น' จัดโดย Innovation Hub ร่วมกับ บริษัทไทยเบฟเวอเรจ",
            },
            {
              en:
                "I've joined internship programs's Zercle Technology. Learn about website development and framework Angular",
              th:
                "ได้เข้่ร่วมโปรแกรมฝึกงานกับบริษัท Zercle Technology โดยได้เรียนรู้เรื่องการพัฒนาเว็บไซต์เฟลมเวิร์ค Angular",
            },
            {
              en: "I've joined the race a PLC Competition 15th by TPA",
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
                "I've joined training a Getting started with SCB API learn about SCB API",
              th:
                "เข้าร่วมเวิร์คช็อปของโครงการ Getting started with SCB API ได้รับความรู้เรื่องการใช้งาน SCB API จัดโดย ธนาคารไทยพานิช",
            },
            {
              en:
                "I've joined the race a Robo inovetor Challenge By Software Pake Thailand",
              th:
                "เข้าร่วมการแข่งขันหุ่นยนต์ระบบ AI โครงการ Robo inovetor Challenge By Software Pake Thailand ",
            },
            {
              en:
                "I used to be a guest speaker about IoT (internet of things) and NodeMCU of smart camps",
              th:
                "เป็นวิทยากรสอนเรื่อง IoT (Internet of things) และการใช้งาน NodeMCU(ESP8266) ของค่าย Smart Camp",
            },
            {
              en:
                "Course projects Web Apllication Deverlopmeny make an Web Application shopping Farmacro using React, Firebase, Google API and Facebook API (in progress)",
              th:
                "โปรเจครายวิชาการพัฒนาเว็บแอพพลิเคชัน โดยพัฒนาเว็บแอพพลิเคชัน Farmacro ด้วยเฟลมเวิร์ค React, Firebase, Google API และ Facebook API (อยู่ในระหว่างการพัฒนา)",
            },
            {
              en:
                "Course projects Web Apllication Deverlopmeny make an Web Application shopping Farmacro using React and Firebase (in progress)",
              th:
                "โปรเจครายวิชาระบบฐานข้อมูล โดยพัฒนาฐานข้อมูล ด้วย React และ Firebase (อยู่ในระหว่างการพัฒนา)",
            },
            {
              en:
                "I've joined the race a NSC (National Software Contest) frist round (In progress)",
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
          en: "Student Union Khon Kaen Univerity (2018 - Present)",
          th: "ทำงานองค์การนักศึกษา (2018-ปัจจุบัน)",
        },
        {
          en:
            "Mechatronics club Faculty of engineering Khon Kaen Unuversity president (2019 - Present)",
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
