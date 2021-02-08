import React from "react";
import Bar from "../Bar";
import { AiFillHtml5 } from "react-icons/ai";
import { DiCss3 } from "react-icons/di";
import {
  SiSass,
  SiJavascript,
  SiTypescript,
  SiPython,
  SiJava,
  SiCplusplus,
} from "react-icons/si";

import "./skills.css"

export default ({props}) => {

    
  const listSkill = [
    {
      name: "HTML",
      percent: 90,
      icon: <AiFillHtml5 size={30} />,
    },
    {
      name: "CSS",
      percent: 90,
      icon: <DiCss3 size={30} />,
    },
    {
      name: "SASS",
      percent: 90,
      icon: <SiSass size={30} />,
    },
    {
      name: "JS",
      percent: 90,
      icon: <SiJavascript size={30} />,
    },
    {
      name: "TS",
      percent: 80,
      icon: <SiTypescript size={30} />,
    },
    {
      name: "Python",
      percent: 75,
      icon: <SiPython size={30} />,
    },
    {
      name: "Java",
      percent: 70,
      icon: <SiJava size={30} />,
    },
    {
      name: "C++",
      percent: 60,
      icon: <SiCplusplus size={30} />,
    },
  ];
  return (
    <div className="software-skill">
      <h1 className="header-skill">{props.isEnglish? " Programming skills": "การเขียนโปรแกรม"}</h1>
      {listSkill.map((item) => (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          {item.icon}
          <Bar
            barWidth={item.percent}
            delayTime={1}
            backgroundStyles={{ padding: 2, margin: 10, height: 16 }}
            borderRadius={"0"}
            barColor={"#333"}
            textInner={item.name}
            textStyles={{fontSize: 12, marginRight: 8, color: "#fff"}}
          />
        </div>
      ))}
    </div>
  );
};
