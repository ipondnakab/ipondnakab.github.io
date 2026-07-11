import { Image } from "@nextui-org/react";
import React from "react";

const FlagIcon: React.FC<{ src: string; size?: number }> = ({
  src,
  size = 22,
}) => (
  <Image
    src={src}
    alt=""
    radius="none"
    width={size}
    height={Math.round((size * 2) / 3)}
    className="object-cover shadow-sm"
  />
);

export default FlagIcon;
