import { ReactNode } from 'react'
import { Form } from '@/components/ui/form'
import { UseFormReturn } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface VerxioFormProps<T extends Record<string, any>> {
  form?: UseFormReturn<T>
  onSubmit: (data: T) => void
  children: ReactNode
  className?: string
}

export function VerxioForm<T extends Record<string, any>>({ form, onSubmit, children, className }: VerxioFormProps<T>) {
  if (form) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            'w-full max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-xl shadow-lg',
            'border border-gray-100',
            className,
          )}
        >
          {children}
        </form>
      </Form>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'w-full max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-xl shadow-lg',
        'border border-gray-100',
        className,
      )}
    >
      {children}
    </form>
  )
}

interface VerxioFormSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function VerxioFormSection({ title, children, className }: VerxioFormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

interface VerxioFormFieldProps {
  label: string
  children: ReactNode
  error?: string
  className?: string
}

export function VerxioFormField({ label, children, error, className }: VerxioFormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
