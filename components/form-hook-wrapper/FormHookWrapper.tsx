"use client";
import React, { useImperativeHandle } from "react";
import {
  FieldErrors,
  FieldValues,
  FormProvider,
  useForm,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import TriggerFormInitially from "./TriggerFormInitially";
import { zodResolver } from "@hookform/resolvers/zod";
import { preventFormSubmit } from "@/functions/prevent-form-submit";

export type SubmitHandler<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> = (
  data: TFieldValues,
  event?: React.BaseSyntheticEvent,
  args?: UseFormReturn<TFieldValues, TContext>,
) => any | Promise<any>;

export type SubmitErrorHandler<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> = (
  data: FieldErrors<TFieldValues>,
  event?: React.BaseSyntheticEvent,
  args?: UseFormReturn<TFieldValues, TContext>,
) => any | Promise<any>;

interface FormHookWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> extends UseFormProps<TFieldValues, TContext> {
  validateInitially?: boolean;
  validationSchema?: any | (() => any);
  preventEnterSubmit?: boolean;
  onSubmit: SubmitHandler<TFieldValues, TContext>;
  onError?: SubmitErrorHandler<TFieldValues> | undefined;
  children?: (args: UseFormReturn<TFieldValues, TContext>) => React.ReactNode;
}

export type FormHookWrapperRef<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> = UseFormReturn<TFieldValues, TContext>;

function FormHookWrapperInner<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
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
  const args = useForm<TFieldValues, TContext>({
    mode: "all",
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
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
    return onError && onError(data, event, args);
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
      {validateInitially && <TriggerFormInitially {...args} />}
    </FormProvider>
  );
}

const FormHookWrapper = React.forwardRef(FormHookWrapperInner) as <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
>(
  props: FormHookWrapperProps<TFieldValues, TContext> & {
    ref?: React.ForwardedRef<FormHookWrapperRef<TFieldValues, TContext>>;
  },
) => ReturnType<typeof FormHookWrapperInner>;

export default FormHookWrapper;
