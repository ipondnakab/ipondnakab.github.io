import React, { useState, useEffect } from "react";

export default function BarAnimation({
  barWidth,
  backgroundColor,
  barColor,
  delayTime,
  showPercent,
  speedAnimation,
  height,
  width,
  borderRadius,
  textAlign,
  color,
  textStyles,
  innerStyles,
  backgroundStyles,
  textInner,
}) {
  const [completed, setCompleted] = useState(0);
  const [textShow, setTextShow] = useState(0);

  useEffect(() => {
    setInterval(
      () => setCompleted(Math.floor(barWidth ? barWidth : 50)),
      delayTime ? delayTime * 1000 : 200
    );
    setInterval(
      () => setTextShow(Math.floor(1)),
      delayTime ? delayTime * 1500 : 1500
    );
  }, []);

  const containerStyles = {
    display: "flex",
    height: height ? height : 20,
    width: width ? width : "100%",
    backgroundColor: backgroundColor ? backgroundColor : "#e0e0de",
    borderRadius: borderRadius ? borderRadius : "12px",

    ...backgroundStyles,
  };

  const fillerStyles = {
    alignSelf: "center",
    height: "100%",
    width: `${completed}%`,
    backgroundColor: barColor ? barColor : "#69c7fe",
    borderRadius: borderRadius ? borderRadius : "12px",
    transition: `width ${speedAnimation ? speedAnimation : 1}s ease-in-out`,
    display: "flex",
    justifyContent: "flex-end",
    ...innerStyles,
  };

  const labelStyles = {
    fontWeight: "bold",
    opacity: textShow,
    ...textStyles,
  };

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}>
          {textInner ? textInner : ""}
          {showPercent ? completed + "%" : ""}
        </span>
      </div>
    </div>
  );
}
