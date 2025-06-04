import { ReactNode } from 'react'
import { Form } from '@/components/ui/form'
import { UseFormReturn } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface VerxioFormProps<T extends Record<string, any>> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void
  children: ReactNode
  className?: string
}

export function VerxioForm<T extends Record<string, any>>({
  form,
  onSubmit,
  children,
  className,
}: VerxioFormProps<T>) {
  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className={cn(
          "w-full max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-xl shadow-lg",
          "border border-gray-100",
          className
        )}
      >
        {children}
      </form>
    </Form>
  )
} 