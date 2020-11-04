import React from "react";
import Skill from "../../Components/Skills";
import Framework from "../../Components/Frameworks";
import Hardware from "../../Components/Hardware";
import OtherSkill from "../../Components/OtherSkills";
import "./skillsPage.css";

export default function Skills(props) {
  return (
    <div className={"skill-page"}>
      <div className="main-skills">
        <Skill props={props} />
        <div className={"skill-right"}>
          <Framework props={props} />
          <Hardware props={props} />
        </div>
      </div>
      <OtherSkill props={props} />
    </div>
  );
}
