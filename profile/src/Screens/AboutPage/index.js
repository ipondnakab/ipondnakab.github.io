import React from "react";
import "./aboutPage.css";
import { FiHome } from "react-icons/fi";
import { BsPhone } from "react-icons/bs";
import { HiOutlineMail } from "react-icons/hi";
import imageProfile from "../../Images/Profile-square.png";

export default function AboutPage({ isEnglish }) {
  const listContact = [
    {
      name: "address",
      labelEn: "Address",
      labelTh: "ที่อยู่",
      en: "42 m.2 MueangMai SiBunRueang NongBuaLamPhu 39180 (TH)",
      th: "บ้านเลขที่ 42 หมู่ 2 ต.เมืองใหม่ อ.ศรีบุญเรือง จ.หนองบัวลำภู 39180",
      icon: <FiHome size={30} />,
    },
    {
      name: "phone",
      labelEn: "Phone",
      labelTh: "เบอร์โทรศัพท์",
      en: "+66 893 759 808",
      th: "089 375 9808",
      icon: <BsPhone size={30} />,
    },
    {
      name: "email",
      labelEn: "Email",
      labelTh: "อีเมล์",
      en: "Kittipat_DD@kkumail.com",
      th: "Kittipat_DD@kkumail.com",
      icon: <HiOutlineMail size={30} />,
    },
  ];
  return (
    <div className="about-page">
      <div className="left-about">
        <img src={imageProfile} alt="Profile" />
      </div>
      <div className="right-about">
        <div className="about-me">
          <h2>{isEnglish ? "Kittipat Daengdee" : "กิตติพัฒน์ แดงดี"}</h2>
          <p>
            {isEnglish
              ? "Kittipat Daengdee"
              : "สวัสดีครับผมชื่อ นายกิตติพัฒน์ แดงดี ชื่อเล่นชื่อ ปอนด์ เป็นนักศึกษาชั้นปีที่ คณะวิศวกรรมศาสตร์ สาขาคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น"}
          </p>
        </div>
        <div className="about-me">
          <h3>{isEnglish ? "Career Objective" : "ตำแหน่งงานที่สนใจ"}</h3>
          <p>
            {isEnglish
              ? "Full Stack Developer, Mobile Developer"
              : "Full Stack Developer, Mobile Developer"}
          </p>
        </div>

        <div className="contact-me">
          <h3>{isEnglish ? "Contact" : "ช่องทางติดต่อ"}</h3>
          {listContact.map((item, key) => {
            return (
              <div className="contact-item" key={key}>
                <div className="contact-item-label">
                  {item.icon}
                  {/* <p>{isEnglish ? item.labelEn : item.labelTh}</p> */}
                </div>
                <p className="contact-item-detail">
                  {isEnglish ? item.en : item.th}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
