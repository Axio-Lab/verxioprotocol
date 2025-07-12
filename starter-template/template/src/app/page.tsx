'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Dashboard() {

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Verxio Points Dashboard</h1>
        <div className="space-x-4">
          <Link href="/program">
            <Button>Create Program</Button>
          </Link>
          <Link href="/manage">
            <Button variant="outline">Manage Loyalty</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Programs</CardTitle>
            <CardDescription>Active loyalty programs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
            <CardDescription>Registered members</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Points</CardTitle>
            <CardDescription>Points issued</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No activity yet</p>
              <p className="text-sm text-gray-400 mt-2">Create a program to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
