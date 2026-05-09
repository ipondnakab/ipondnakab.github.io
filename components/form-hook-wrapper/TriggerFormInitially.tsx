"use client";
import React, { Fragment, useEffect } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export default function TriggerFormInitially<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  trigger,
}: {
  trigger: UseFormReturn<TFieldValues, TContext>["trigger"];
}): React.ReactElement {
  useEffect(() => {
    trigger();
  }, [trigger]);

  return <Fragment />;
}
