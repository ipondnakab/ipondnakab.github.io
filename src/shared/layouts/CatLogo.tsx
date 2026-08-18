import clsx from "clsx";
import React from "react";

interface CatLogoProps extends React.HTMLAttributes<HTMLSpanElement> {}

const CatLogo: React.FC<CatLogoProps> = (props) => {
  return (
    <div {...props} className={clsx("text-lg flex", props.className)}>
      <svg
        width="12"
        height="16"
        viewBox="0 0 14 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mt-[5px] mr-1"
      >
        <path
          d="M1.5 17.5L7.60001 2L11 6.33962"
          stroke="hsl(var(--nextui-foreground))"
          strokeWidth="2"
        />
      </svg>
      - ˕ -マⳊ
    </div>
  );
};

export default CatLogo;
