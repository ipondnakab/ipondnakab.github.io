import React, { Component } from "react";
import PropTypes from "prop-types";
import { FaLinkedinIn, FaFacebookF, FaMediumM } from "react-icons/fa";
import "./socailTab.css";

export default () => {
  const listSocail = [
    {
      name: "facebook",
      icon: (
        <FaFacebookF
          size={24}
          onClick={() => window.open("https://www.facebook.com/IPondNaKab")}
        />
      ),
    },
    {
      name: "linkIn",
      icon: (
        <FaLinkedinIn
          size={24}
          onClick={() =>
            window.open(
              "https://www.linkedin.com/in/kittipat-daengdee-0b26441b9/"
            )
          }
        />
      ),
    },
    {
      name: "medium",
      icon: (
        <FaMediumM
          size={24}
          onClick={() => window.open("https://medium.com/@kittipat_dd")}
        />
      ),
    },
  ];
  return (
    <aside className={"socail-tab"}>
      <div className={"button-socail"}>
        {listSocail.map((item) => {
          return item.icon;
        })}
      </div>
    </aside>
  );
};
