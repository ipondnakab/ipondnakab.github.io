"use client";
import { FieldController } from "@/shared/types/field-controller";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

export interface InputSelectProps extends FieldController {
  label: string;
  children: React.ReactNode;
}
const InputSelect: React.FC<InputSelectProps> = ({
  name,
  label,
  children,
  rules,
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <label className="flex flex-col gap-1 text-small">
          {label}
          <select
            {...field}
            data-testid={name}
            aria-invalid={!!fieldState.error}
            className="min-h-12 w-full min-w-0 rounded-medium border border-default-300 bg-content1 px-3 text-base text-foreground focus-visible:outline-primary"
          >
            {children}
          </select>
          {fieldState.error && (
            <span className="text-danger" role="alert">
              {fieldState.error.message}
            </span>
          )}
        </label>
      )}
    />
  );
};
export default InputSelect;
