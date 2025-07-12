'use client'

import { cn } from '@/lib/utils'

interface VerxioFormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function VerxioFormSection({ title, description, children, className }: VerxioFormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-medium text-gray-100">{title}</h3>
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
} 