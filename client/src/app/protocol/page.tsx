'use client'

import Layout from '@/components/layout/Layout'
import DashboardStats from '@/components/statistics/DashboardStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, Download, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function DashboardPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      },
    }),
  }

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeIn}
          className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="orbitron text-3xl font-bold text-white text-glow">Dashboard</h1>
            <p className="orbitron text-white/70">Manage your loyalty program and track performance</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button variant="outline" className="pixel-font text-white border-verxio-purple/30">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="pixel-font bg-verxio-purple hover:bg-verxio-neon-purple text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Program
            </Button>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeIn} className="mb-8">
          <DashboardStats />
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeIn}>
          <Tabs defaultValue="active" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-verxio-dark border border-verxio-purple/20">
                <TabsTrigger value="active" className="pixel-font">
                  Active Programs
                </TabsTrigger>
                <TabsTrigger value="drafts" className="pixel-font">
                  Drafts
                </TabsTrigger>
                <TabsTrigger value="archived" className="pixel-font">
                  Archived
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="pixel-font h-9 text-white border-verxio-purple/30">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <TabsContent value="active" className="space-y-4">
              <Card className="bg-verxio-dark border-verxio-purple/20">
                <CardHeader className="pb-3">
                  <CardTitle className="orbitron text-white">Active Loyalty Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-verxio-purple/10 overflow-hidden">
                    <table className="min-w-full divide-y divide-verxio-purple/10">
                      <thead className="bg-verxio-purple/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs pixel-font text-white/70 uppercase tracking-wider">
                            Program
                          </th>
                          <th className="px-6 py-3 text-left text-xs pixel-font text-white/70 uppercase tracking-wider">
                            Members
                          </th>
                          <th className="px-6 py-3 text-left text-xs pixel-font text-white/70 uppercase tracking-wider">
                            Points Issued
                          </th>
                          <th className="px-6 py-3 text-left text-xs pixel-font text-white/70 uppercase tracking-wider">
                            Redemption Rate
                          </th>
                          <th className="px-6 py-3 text-right text-xs pixel-font text-white/70 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-verxio-purple/10">
                        {[
                          {
                            id: 'premium-rewards',
                            name: 'Premium Customer Rewards',
                            members: '1,240',
                            points: '540,320',
                            redemption: '42%',
                            color: 'purple',
                          },
                          {
                            id: 'vip-membership',
                            name: 'VIP Membership Program',
                            members: '856',
                            points: '367,520',
                            redemption: '38%',
                            color: 'blue',
                          },
                          {
                            id: 'anniversary-rewards',
                            name: 'Anniversary Rewards',
                            members: '487',
                            points: '129,850',
                            redemption: '25%',
                            color: 'cyan',
                          },
                        ].map((program) => (
                          <tr key={program.id} className="hover:bg-verxio-purple/5">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className={`h-10 w-10 flex-shrink-0 rounded-full bg-verxio-${program.color}/20 flex items-center justify-center text-verxio-${program.color}`}
                                >
                                  {program.name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm pixel-font font-medium text-white">{program.name}</div>
                                  <div className="text-[10px] orbitron text-white/60">Created 3 months ago</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm pixel-font text-white">
                              {program.members}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm pixel-font text-white">
                              {program.points}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm pixel-font text-white">{program.redemption}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Button
                                variant="ghost"
                                className="pixel-font text-white/70 hover:text-white h-8 px-2"
                                asChild
                              >
                                <Link href={`/programs/${program.id}`}>Manage</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drafts">
              <Card className="bg-verxio-dark border-verxio-purple/20">
                <CardHeader>
                  <CardTitle className="orbitron text-white">Draft Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-verxio-dark p-3 mb-4">
                      <Plus className="h-10 w-10 text-verxio-purple" />
                    </div>
                    <h3 className="text-xl orbitron font-medium text-white mb-2">Create a new draft</h3>
                    <p className="orbitron text-white/70 mb-6 max-w-md">
                      Start building your next loyalty program and save it as a draft until you're ready to launch
                    </p>
                    <Button className="pixel-font bg-verxio-purple hover:bg-verxio-neon-purple text-white">
                      Create Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="archived">
              <Card className="bg-verxio-dark border-verxio-purple/20">
                <CardHeader>
                  <CardTitle className="orbitron text-white">Archived Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="orbitron text-white/70">No archived programs found</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  )
}
