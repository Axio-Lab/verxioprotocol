import { ReactNode } from 'react'

interface VerxioFormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function VerxioFormSection({ title, description, children, className }: VerxioFormSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <div className={className}>{children}</div>
    </div>
  )
}
