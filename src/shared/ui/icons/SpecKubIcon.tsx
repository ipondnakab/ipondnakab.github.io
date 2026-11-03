import React from "react";
import type { IconBaseProps } from "react-icons";

export interface SpecKubIconProps extends IconBaseProps {}

const SpecKubIcon: React.FC<SpecKubIconProps> = ({
  size = "1em",
  title,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024 1024"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden={title ? undefined : true}
    role={title ? "img" : undefined}
    {...props}
  >
    {title && <title>{title}</title>}
    <path d="M116.823 590.233 591.01 433.747 353.843 1024H191.147C85.579 1024 0 938.421 0 832.853V191.147C0 85.579 85.58 0 191.147 0H592.92L116.823 590.233Z" />
    <path d="M832.853 0C938.421 0 1024 85.58 1024 191.147v641.706C1024 938.421 938.421 1024 832.853 1024h-426.67l502.534-749.11-474.19 158.857L652.213 0h180.64Z" />
  </svg>
);

export default SpecKubIcon;
