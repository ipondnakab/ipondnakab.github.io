"use client";
import React, { Fragment, useEffect } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export interface TriggerFormInitiallyProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> {
  trigger: UseFormReturn<TFieldValues, TContext>["trigger"];
}

const TriggerFormInitially = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  trigger,
}: TriggerFormInitiallyProps<TFieldValues, TContext>): React.ReactElement => {
  useEffect(() => {
    trigger();
  }, [trigger]);

  return <Fragment />;
};

export default TriggerFormInitially;
