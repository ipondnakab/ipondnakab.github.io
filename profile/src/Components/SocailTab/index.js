import React, { Component } from "react";
import PropTypes from "prop-types";
import { FaLinkedinIn, FaFacebookF, FaMediumM } from "react-icons/fa";
import "./socailTab.css";

export default () => {
  const listSocail = [
    {
      name: "facebook",
      icon: (
        <FaFacebookF size={24}
          onClick={() => window.open("https://www.facebook.com/IPondNaKab")}
        />
      ),
    },
    {
      name: "linkIn",
      icon: (
        <FaLinkedinIn size={24}
          onClick={() => window.open("https://www.facebook.com/IPondNaKab")}
        />
      ),
    },
    {
      name: "medium",
      icon: (
        <FaMediumM size={24}
          onClick={() => window.open("https://www.facebook.com/IPondNaKab")}
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
