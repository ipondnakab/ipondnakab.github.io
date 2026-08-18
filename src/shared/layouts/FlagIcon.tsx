import { Image } from "@nextui-org/react";
import React from "react";

const FlagIcon: React.FC<{ src: string; size?: number }> = ({
  src,
  size = 20,
}) => (
  <Image
    src={src}
    alt=""
    radius="none"
    width={size}
    height={size}
    className="object-cover shadow-sm"
  />
);

export default FlagIcon;
