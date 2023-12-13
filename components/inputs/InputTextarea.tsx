import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { Textarea } from "@nextui-org/react";
import { FieldController } from "@/interfaces/field-controller";

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
  const { control } = useFormContext<TFieldValues>();
  const [focusInput, setFocusInput] = React.useState(false);
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <Textarea
            {...field}
            {...props}
            onClear={() => field.onChange("")}
            onFocus={() => setFocusInput(true)}
            onBlur={() => setFocusInput(false)}
            autoComplete="off"
            errorMessage={error?.message as string}
            placeholder={
              disableAutoPlaceholder
                ? placeholder || "please_enter"
                : focusInput
                  ? placeholder || "please_enter"
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
