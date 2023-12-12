import React, { useEffect, useMemo, useState } from "react";
import SwitchAutoLabel from "../Switch/SwitchAutoLabel";
import { Skeleton, Switch, SwitchProps } from "@nextui-org/react";
import { FaPlayCircle, FaStopCircle } from "react-icons/fa";

export interface AnimationSwitcherProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  disableLabelAnimation?: boolean;
}

const AnimationSwitcher: React.FC<AnimationSwitcherProps> = ({
  setShow,
  show,
  disableLabelAnimation,
}) => {
  const [mounted, setMounted] = useState(false);
  const isShowAnimation = useMemo(() => {
    if (typeof window !== "undefined") {
      const animation = localStorage.getItem("animation");
      if (animation === null) {
        localStorage.setItem("animation", "1");
        return true;
      }
      return animation === "1";
    }
    return true;
  }, []);

  useEffect(() => {
    setShow(isShowAnimation);
  }, [isShowAnimation, setShow]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onChangeAnimation = () => {
    localStorage.setItem("animation", show ? "0" : "1");
    setShow(!show);
  };

  if (!mounted)
    return (
      <Skeleton className="rounded-full w-fit ml-1 mr-3">
        <div className="w-8 h-5 rounded-full bg-secondary"></div>
      </Skeleton>
    );

  const switchProps: SwitchProps = {
    size: "sm",
    color: "default",
    checked: show,
    defaultSelected: isShowAnimation,
    onClick: onChangeAnimation,
    startContent: <FaPlayCircle />,
    endContent: <FaStopCircle />,
  };

  const label = "Animation ".concat(show ? "On" : "Off");

  if (disableLabelAnimation) return <Switch {...switchProps}>{label}</Switch>;

  return (
    <SwitchAutoLabel {...switchProps} label={label} labelWidth="w-[78px]" />
  );
};

export default AnimationSwitcher;
