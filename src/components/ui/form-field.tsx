import { useId } from 'react'
import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

export interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div>
      <label htmlFor={id} className="pf-label">
        {label}
        {required && <span className="ml-0.5 text-coral">*</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error ? (
        <p id={errorId} role="alert" className="mt-1 flex items-center gap-1 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1 text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export interface SelectOption {
  value: string
  label: string
}

export function Select({
  options,
  placeholder = 'Select an option',
  className = '',
  ...rest
}: {
  options: SelectOption[]
  placeholder?: string
  className?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`pf-input ${className}`} {...rest}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
