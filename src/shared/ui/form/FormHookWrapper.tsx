"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useImperativeHandle } from "react";
import {
  FieldErrors,
  FieldValues,
  FormProvider,
  useForm,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import { ZodType, ZodTypeDef } from "zod";

import { preventFormSubmit } from "@/shared/lib/prevent-form-submit";

import TriggerFormInitially from "./TriggerFormInitially";

export type SubmitHandler<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> = (
  data: TFieldValues,
  event?: React.BaseSyntheticEvent,
  args?: UseFormReturn<TFieldValues, TContext>,
) => void | Promise<void>;

export type SubmitErrorHandler<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> = (
  data: FieldErrors<TFieldValues>,
  event?: React.BaseSyntheticEvent,
  args?: UseFormReturn<TFieldValues, TContext>,
) => void | Promise<void>;

type ValidationSchema<TFieldValues extends FieldValues> = ZodType<
  TFieldValues,
  ZodTypeDef,
  TFieldValues
>;

interface FormHookWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends UseFormProps<TFieldValues, TContext> {
  validateInitially?: boolean;
  validationSchema?:
    ValidationSchema<TFieldValues> | (() => ValidationSchema<TFieldValues>);
  preventEnterSubmit?: boolean;
  onSubmit: SubmitHandler<TFieldValues, TContext>;
  onError?: SubmitErrorHandler<TFieldValues, TContext> | undefined;
  children?: (args: UseFormReturn<TFieldValues, TContext>) => React.ReactNode;
}

export type FormHookWrapperRef<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> = UseFormReturn<TFieldValues, TContext>;

function FormHookWrapperInner<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  {
    children,
    onSubmit,
    onError,
    validateInitially,
    validationSchema,
    preventEnterSubmit = true,
    ...props
  }: FormHookWrapperProps<TFieldValues, TContext>,
  forwardRef: React.ForwardedRef<UseFormReturn<TFieldValues, TContext>>,
): JSX.Element {
  const schema =
    typeof validationSchema === "function"
      ? validationSchema()
      : validationSchema;

  const args = useForm<TFieldValues, TContext>({
    mode: "all",
    resolver: schema ? zodResolver(schema) : undefined,
    ...props,
  });

  const onFormSubmit = (
    data: TFieldValues,
    event?: React.BaseSyntheticEvent,
  ) => {
    return onSubmit(data, event, args);
  };

  const onFormError = (
    data: FieldErrors<TFieldValues>,
    event?: React.BaseSyntheticEvent,
  ) => {
    return (
      onError &&
      onError(data, event, args as UseFormReturn<TFieldValues, TContext>)
    );
  };

  useImperativeHandle(forwardRef, () => args, [args]);

  return (
    <FormProvider {...args}>
      <form
        onKeyDown={preventEnterSubmit ? preventFormSubmit : undefined}
        onSubmit={args.handleSubmit(onFormSubmit, onFormError)}
      >
        {children && children(args)}
      </form>
      {validateInitially && <TriggerFormInitially trigger={args.trigger} />}
    </FormProvider>
  );
}

const FormHookWrapper = React.forwardRef(FormHookWrapperInner) as <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  props: FormHookWrapperProps<TFieldValues, TContext> & {
    ref?: React.ForwardedRef<FormHookWrapperRef<TFieldValues, TContext>>;
  },
) => ReturnType<typeof FormHookWrapperInner>;

export default FormHookWrapper;
