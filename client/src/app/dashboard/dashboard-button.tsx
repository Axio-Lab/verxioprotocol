'use client'
import { dashboardActionCreate } from '@/app/dashboard/dashboard-actions'

export function DashboardButton() {
  return (
    <button
      onClick={(event) => {
        // This is still running on the Client
        const name = prompt('What is your name?', 'John Doe')
        if (!name) {
          console.log('No name provided')
          return
        }
        console.log('I am on the Client, and will call a server action', event)

        const locationOfClick = `${event.clientX},${event.clientY}`

        return dashboardActionCreate({ name: `${name} clicked on ${locationOfClick}` })
      }}
    >
      dashboardActionCreate
    </button>
  )
}
