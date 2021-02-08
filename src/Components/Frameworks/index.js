import React from "react";
import { FaReact, FaAngular } from "react-icons/fa";

import { SiNodeDotJs, SiDeno } from "react-icons/si";
import { BsBootstrap } from "react-icons/bs";

import "./framework.css";

export default ({ props }) => {
  const listFrameWork = [
    {
      name: "React",
      icon: <FaReact size={40} />,
    },
    {
      name: "Angular",
      icon: <FaAngular size={40} />,
    },
    {
      name: "NodeJS",
      icon: <SiNodeDotJs size={40} />,
    },
    {
      name: "Deno",
      icon: <SiDeno size={40} />,
    },
    {
      name: "Bootstrap",
      icon: <BsBootstrap size={40} />,
    },
  ];
  return (
    <div className="framework">
      <h1 className="header-framework">
        {props.isEnglish ? "Framework" : "เฟรมเวิร์ค"}
      </h1>
      <div className="icons-framework">

      {listFrameWork.map((item) => {
        return (
          <div>
            {item.icon}
            <p>{item.name}</p>
          </div>
        );
      })}
      </div>
    </div>
  );
};
