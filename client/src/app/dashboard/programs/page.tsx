'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Gift, Trophy, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function ProgramsPage() {
  // This would come from your backend/blockchain
  const programs: any[] = [] // Replace with actual programs data

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white orbitron">Loyalty Programs</h1>
        <Link href="/dashboard/programs/new">
          <Button className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Create Program
          </Button>
        </Link>
      </div>

      {programs.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-sm border-slate-800/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-12 w-12 text-[#00FFE0] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Programs Yet</h3>
            <p className="text-white/70 mb-6">Create your first loyalty program to start rewarding your customers</p>
            <Link href="/dashboard/programs/new">
              <Button className="bg-gradient-to-r from-[#00FFE0] via-[#0085FF] to-[#7000FF] text-white hover:opacity-90">
                Create Program
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.id} className="bg-black/20 backdrop-blur-sm border-slate-800/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-white">{program.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4 text-white/70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-black/20 backdrop-blur-sm border-slate-800/20">
                    <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/10">
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/10">
                      Issue Passes
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/10">
                      Manage Members
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/10">
                      Edit Program
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-[#0085FF]" />
                      <span className="text-sm text-white/70">Members</span>
                    </div>
                    <span className="text-sm font-medium text-white">{program.memberCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-[#7000FF]" />
                      <span className="text-sm text-white/70">Total Points</span>
                    </div>
                    <span className="text-sm font-medium text-white">{program.totalPoints}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-[#00FFE0]" />
                      <span className="text-sm text-white/70">Active Passes</span>
                    </div>
                    <span className="text-sm font-medium text-white">{program.activePasses}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
