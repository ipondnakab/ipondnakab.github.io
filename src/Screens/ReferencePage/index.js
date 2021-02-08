import React from "react";
import "./referencePage.css"

export default function ReferencePage() {
  const listReference = [
    {
      name: "Dr. Kanda Saikaew",
      position:
        "Associate Professor of Computer Engineering, Khon Kaen University",
    },
    {
      name: "Phattarajul Chantaramontree ",
      position: "Chief Design Officer & Co-founder Zercle Technology Co., Ltd.",
    },
  ];
  return (
    <div className="reference-page">
      {/* <h1>Reference</h1> */}
      <ul>
        {listReference.map((item, key) => {
          return (
            <li key={key}>
              <div>
                <h2>{item.name}</h2>
                <p>{item.position}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
