import React from "react";
import { FaReact, FaAngular } from "react-icons/fa";

import { SiNodeDotJs, SiDeno } from "react-icons/si";

import "./otherSkills.css";

export default ({ props }) => {
  const listOtherSkills = [
    {
      en: "Photography",
      th: "ถ่ายภาพ",
    },
    {
      en: "Graphic Design",
      th:"งานกราฟฟิก",
    },
    {
      en: "Video Edit",
      th: "ตัดต่อวีดีโอ",
    },
    {
      en: "Play Guitar",
      th: "เล่นกีต้า",
    },
    {
      en: "3D Printring",
      th: "ปริ้น 3 มิติ",
    },
    {
      en: "Solidworks",
      th: "Solidworks",
    },
  ];
  return (
    <div className="other-skills" >
      <h1 className="header-other-skills">
        {props.isEnglish ? "Other Skills" : "สกิลอื่นๆ"}
      </h1>
      <div>
        {listOtherSkills.map((item) => {
          return (
            <div>
              <ul>
                <li>{props.isEnglish ? item.en : item.th}</li>
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
