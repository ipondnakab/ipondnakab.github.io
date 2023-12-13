"use client";
import React from "react";
import {
  FieldValues,
  useFieldArray,
  UseFieldArrayProps,
  UseFieldArrayReturn,
  useFormContext,
} from "react-hook-form";

export interface FieldArrayWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
> extends UseFieldArrayProps<TFieldValues> {
  isWatch?: boolean;
  children: (args: UseFieldArrayReturn<TFieldValues>) => React.ReactNode;
}

function FieldArrayWrapper<TFieldValues extends FieldValues = FieldValues>({
  children,
  isWatch,
  ...props
}: FieldArrayWrapperProps<TFieldValues>): JSX.Element {
  const { control, watch } = useFormContext<TFieldValues>();
  const args = useFieldArray<TFieldValues>({ control, ...props });

  if (isWatch) {
    const watchFieldArray = watch(props.name as any);
    args.fields = args.fields.map((field, index) => {
      return {
        ...field,
        ...watchFieldArray[index],
      };
    });
  }

  return <>{children && children(args)}</>;
}

export default FieldArrayWrapper;
