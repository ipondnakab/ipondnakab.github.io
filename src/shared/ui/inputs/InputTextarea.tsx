"use client";

import { Textarea } from "@nextui-org/react";
import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FieldController } from "@/interfaces/field-controller";

// See components/inputs/InputString: alias collapses NextUI's huge <Textarea>
// prop union so the spread below stays within TS's complexity budget (TS2590).
const BaseTextarea = Textarea as unknown as React.FC<
  React.ComponentProps<typeof Textarea>
>;

export type InputTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldController<TFieldValues, TName> &
  React.ComponentProps<typeof Textarea> & {
    disableAutoPlaceholder?: boolean;
  };

const InputTextarea: React.FC<InputTextareaProps> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  rules,
  placeholder,
  disableAutoPlaceholder,
  ...props
}: InputTextareaProps<TFieldValues, TName>): React.ReactElement => {
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
          <BaseTextarea
            {...field}
            {...props}
            // NextUI infers clearability from the handler being present —
            // `const isClearable = !!onClear || originalProps.isClearable` — so
            // wiring onClear unconditionally floats a ✕ in the corner of every
            // textarea, even an empty one, and no `isClearable={false}` can
            // override it. Opt in via `isClearable` instead.
            onClear={
              props.isClearable
                ? () => {
                    field.onChange("");
                    props.onClear?.();
                  }
                : undefined
            }
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

export default InputTextarea;
