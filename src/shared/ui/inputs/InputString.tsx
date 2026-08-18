"use client";

import { Input } from "@nextui-org/react";
import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FieldController } from "@/interfaces/field-controller";

// NextUI's <Input> prop type is a very large union; spreading into the JSX
// element exceeds TypeScript's complexity budget (TS2590) now that the 3D stack
// adds type surface. This alias keeps the runtime identical while collapsing the
// union for the checker (same technique as components/layouts/SwitchAutoLabel).
const BaseInput = Input as unknown as React.FC<
  React.ComponentProps<typeof Input>
>;

export type InputStringProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldController<TFieldValues, TName> &
  React.ComponentProps<typeof Input> & {
    disableAutoPlaceholder?: boolean;
  };

const InputString: React.FC<InputStringProps> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  rules,
  placeholder,
  disableAutoPlaceholder,
  ...props
}: InputStringProps<TFieldValues, TName>): React.ReactElement => {
  const { t } = useTranslation();
  const { control } = useFormContext<TFieldValues>();
  const [focusInput, setFocusInput] = React.useState(false);
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <BaseInput
            {...field}
            {...props}
            onClear={() => {
              field.onChange("");
              props.onClear?.();
            }}
            onFocus={() => setFocusInput(true)}
            onBlur={() => setFocusInput(false)}
            autoComplete="off"
            errorMessage={error?.message as string}
            placeholder={
              disableAutoPlaceholder
                ? placeholder || t("common.pleaseEnter")
                : focusInput
                  ? placeholder || t("common.pleaseEnter")
                  : undefined
            }
            isInvalid={error ? true : undefined}
            data-testid={name}
          />
        );
      }}
    />
  );
};

export default InputString;
