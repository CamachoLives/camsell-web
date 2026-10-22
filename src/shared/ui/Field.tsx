import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { useId } from 'react'

import { cn } from '@/shared/lib/cn'

const CONTROL_BASE =
  'w-full rounded-xl border border-surface bg-surface-raised px-3.5 text-sm text-strong ' +
  'placeholder:text-muted/70 transition-colors focus:border-brand-500 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

interface WrapperProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  htmlFor: string
  className?: string
  children: ReactNode
}

function FieldShell({ label, hint, error, required, htmlFor, className, children }: WrapperProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-strong text-sm font-medium">
          {label}
          {required ? (
            <span className="ml-0.5 text-red-600" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="text-muted text-xs">{hint}</p>
      ) : null}
    </div>
  )
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string
  hint?: string
  error?: string
  leading?: ReactNode
  trailing?: ReactNode
  wrapperClassName?: string
}

export function TextField({
  label,
  hint,
  error,
  leading,
  trailing,
  wrapperClassName,
  id,
  required,
  ...rest
}: TextFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      className={wrapperClassName}
    >
      <div className="relative flex items-center">
        {leading ? (
          <span className="text-muted pointer-events-none absolute left-3.5">{leading}</span>
        ) : null}
        <input
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            CONTROL_BASE,
            'h-11',
            leading && 'pl-10',
            trailing && 'pr-10',
            error && 'border-red-500',
          )}
          {...rest}
        />
        {trailing ? <span className="absolute right-3.5">{trailing}</span> : null}
      </div>
    </FieldShell>
  )
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string
  hint?: string
  error?: string
  wrapperClassName?: string
  children: ReactNode
}

export function SelectField({
  label,
  hint,
  error,
  wrapperClassName,
  id,
  required,
  children,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      className={wrapperClassName}
    >
      <select
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL_BASE, 'h-11 cursor-pointer pr-9', error && 'border-red-500')}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  )
}

interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string
  hint?: string
  error?: string
  wrapperClassName?: string
}

export function TextAreaField({
  label,
  hint,
  error,
  wrapperClassName,
  id,
  required,
  rows = 5,
  ...rest
}: TextAreaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      className={wrapperClassName}
    >
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL_BASE, 'resize-y py-2.5', error && 'border-red-500')}
        {...rest}
      />
    </FieldShell>
  )
}

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
}

export function CheckboxField({ label, hint, id, className, ...rest }: CheckboxFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        id={fieldId}
        type="checkbox"
        className="accent-brand-600 mt-0.5 size-4 cursor-pointer rounded"
        {...rest}
      />
      <div className="flex flex-col">
        <label htmlFor={fieldId} className="text-strong cursor-pointer text-sm font-medium">
          {label}
        </label>
        {hint ? <span className="text-muted text-xs">{hint}</span> : null}
      </div>
    </div>
  )
}
