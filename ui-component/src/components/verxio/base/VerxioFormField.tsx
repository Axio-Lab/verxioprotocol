import { ReactNode } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { UseFormReturn, Path } from 'react-hook-form'

interface VerxioFormFieldProps<T extends Record<string, any>> {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
  description?: string
  children: ReactNode
  className?: string
}

export function VerxioFormField<T extends Record<string, any>>({
  form,
  name,
  label,
  description,
  children,
  className,
}: VerxioFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>{children}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 