import React from "react";
import { FaReact, FaAngular } from "react-icons/fa";

import { SiNodeDotJs, SiDeno } from "react-icons/si";

import "./hardware.css";

export default ({ props }) => {
  const listFrameWork = [
    {
      name: "Arduino",
      icon: <FaReact size={40} />,
    },
    {
      name: "NodeMCU",
      icon: <FaAngular size={40} />,
    },
    {
      name: "PLC",
      icon: <SiNodeDotJs size={40} />,
    },
    {
      name: "JesonNano",
      icon: <SiDeno size={40} />,
    },
    {
      name: "Raspberry Pi",
      icon: <SiDeno size={40} />,
    },
  ];
  return (
    <div className="hardware">
      <h1 className="header-hardware">
        {props.isEnglish ? "Hardware" : "ฮาร์ดแวร์"}
      </h1>
      {listFrameWork.map((item) => {
        return (
          <div>
            <ul>
              <li>{item.name}</li>
            </ul>
          </div>
        );
      })}
    </div>
  );
};
