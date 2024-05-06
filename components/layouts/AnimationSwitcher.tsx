import React, { useEffect, useState } from "react";
import SwitchAutoLabel from "../Switch/SwitchAutoLabel";
import { Skeleton, Switch, SwitchProps } from "@nextui-org/react";
import { FaPlayCircle, FaStopCircle } from "react-icons/fa";

export interface AnimationSwitcherProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  disableLabelAnimation?: boolean;
}

const switchProps: SwitchProps = {
  size: "sm",
  color: "default",
  startContent: <FaPlayCircle />,
  endContent: <FaStopCircle />,
};

const AnimationSwitcher: React.FC<AnimationSwitcherProps> = ({
  setShow,
  show,
  disableLabelAnimation,
}) => {
  const [mounted, setMounted] = useState(false);

  const onChangeAnimation = () => {
    localStorage.setItem("animation", show ? "0" : "1");
    setShow(!show);
  };

  useEffect(() => {
    if (window && window.localStorage) {
      const animation = window.localStorage.getItem("animation");
      setShow(animation === null ? true : animation === "1");
    }
    setMounted(true);
  }, [setShow]);

  if (!mounted)
    return (
      <Skeleton className="rounded-full w-fit ml-1 mr-3">
        <div className="w-8 h-5 rounded-full bg-secondary"></div>
      </Skeleton>
    );

  const label = "Animation ".concat(show ? "On" : "Off");

  if (disableLabelAnimation)
    return (
      <Switch {...switchProps} isSelected={show} onChange={onChangeAnimation}>
        {label}
      </Switch>
    );

  return (
    <SwitchAutoLabel
      {...switchProps}
      onChange={onChangeAnimation}
      isSelected={show}
      label={label}
      labelWidth="w-[78px] max-w-[78px]"
    />
  );
};

export default AnimationSwitcher;
