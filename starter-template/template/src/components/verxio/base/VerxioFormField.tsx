'use client'

import { UseFormReturn, Path } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from '@/components/ui/form'

interface VerxioFormFieldProps<T extends Record<string, unknown>> {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
  description?: string
  children: React.ReactNode
}

export function VerxioFormField<T extends Record<string, unknown>>({
  form,
  name,
  label,
  description,
  children,
}: VerxioFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            {children}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 