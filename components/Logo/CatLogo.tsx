import clsx from "clsx";
import React from "react";

interface CatLogoProps extends React.HTMLAttributes<HTMLSpanElement> {}

const CatLogo: React.FC<CatLogoProps> = (props) => {
  return (
    <span {...props} className={clsx("text-lg", props.className)}>
      <span className="text-xl">ᄼ</span>- ˕ -マⳊ
    </span>
  );
};

export default CatLogo;
