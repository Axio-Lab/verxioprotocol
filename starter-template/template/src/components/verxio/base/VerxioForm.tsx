'use client'

import { UseFormReturn } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { cn } from '@/lib/utils'

interface VerxioFormProps<T extends Record<string, unknown>> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void
  children: React.ReactNode
  className?: string
}

export function VerxioForm<T extends Record<string, unknown>>({
  form,
  onSubmit,
  children,
  className,
}: VerxioFormProps<T>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
        {children}
      </form>
    </Form>
  )
} 