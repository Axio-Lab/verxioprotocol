'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'

interface CountdownTimerProps {
  startDate: Date
  endDate: Date
}

export function CountdownTimer({ startDate, endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const end = new Date(endDate)
      const start = new Date(startDate)

      if (now < start) {
        // Campaign hasn't started yet
        return {
          days: differenceInDays(start, now),
          hours: differenceInHours(start, now) % 24,
          minutes: differenceInMinutes(start, now) % 60,
          seconds: differenceInSeconds(start, now) % 60,
        }
      } else if (now > end) {
        // Campaign has ended
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      } else {
        // Campaign is active
        return {
          days: differenceInDays(end, now),
          hours: differenceInHours(end, now) % 24,
          minutes: differenceInMinutes(end, now) % 60,
          seconds: differenceInSeconds(end, now) % 60,
        }
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [startDate, endDate])

  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  let status = 'active'
  if (now < start) {
    status = 'upcoming'
  } else if (now > end) {
    status = 'ended'
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            {status === 'upcoming' ? 'Campaign starts in' : status === 'active' ? 'Time remaining' : 'Campaign ended'}
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.hours}</div>
              <div className="text-sm text-muted-foreground">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.minutes}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.seconds}</div>
              <div className="text-sm text-muted-foreground">Seconds</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
