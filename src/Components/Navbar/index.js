import React, { useState } from "react";
import DarkModeToggle from "react-dark-mode-toggle";
import { useLocation, Link } from "react-router-dom";
import * as Colors from "../../Assets/Color";
import * as message from "../../Assets/massage";
import "./navbar.css";
import { AiOutlineUser } from "react-icons/ai";
import { FiTerminal } from "react-icons/fi";
import { FiBook, FiAward, FiUsers } from "react-icons/fi";
import imageLogo from "../../Images/profile-small.jpg";
const windowWidth = window.innerWidth;
export default ({ isDarkMode, setIsDarkMode, isEnglish, setIsEnglish }) => {
  const listLink = [
    {
      title: isEnglish ? message.about.en : message.about.th,
      index: 0,
      path: "/about",
      icon: <AiOutlineUser size={24} />,
    },
    {
      title: isEnglish ? message.skill.en : message.skill.th,
      index: 1,
      path: "/skill",
      icon: <FiTerminal size={24} />,
    },
    {
      title: isEnglish ? message.education.en : message.education.th,
      index: 2,
      path: "/education",
      icon: <FiBook size={24} />,
    },
    {
      title: isEnglish ? message.experiences.en : message.experiences.th,
      index: 3,
      path: "/experiences",
      icon: <FiAward size={24} />,
    },
    {
      title: isEnglish ? message.reference.en : message.reference.th,
      index: 4,
      path: "/reference",
      icon: <FiUsers size={24} />,
    },
  ];
  const location = useLocation();
  let currentIndex = 0;
  for (const item of listLink) {
    if (location.pathname === item.path) {
      currentIndex = item.index;
    }
  }

  const [linkActive, setLinkActive] = useState(currentIndex);
  let textColor = isDarkMode ? Colors.lightText : Colors.darkText;

  return (
    <nav className={"navbar"}>
      <div className={"left-navbar"}>
        <img src={imageLogo} alt="Profile" />
      </div>
      <div className={"center-navbar"}>
        <ul>
          {listLink.map((item, key) => (
            <li key={key}>
              <Link
                style={{
                  color: textColor,
                  fontWeight: linkActive === item.index ? "bold" : "200",
                }}
                onClick={() => setLinkActive(item.index)}
                to={item.path}
              >
                <div className="text-icon">{item.title}</div>
                <div className="icon">{item.icon}</div>
                {/* {windowWidth > 600 ? item.title : item.icon} */}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={"right-navbar"}>
        <img
          className={"language"}
          src={
            isEnglish
              ? "https://www.flaticon.com/svg/static/icons/svg/323/323310.svg"
              : "https://www.flaticon.com/svg/static/icons/svg/323/323281.svg"
          }
          onClick={() => setIsEnglish(!isEnglish)}
        />
        <DarkModeToggle
          onChange={setIsDarkMode}
          checked={isDarkMode}
          size={50}
        />
      </div>
    </nav>
  );
};
