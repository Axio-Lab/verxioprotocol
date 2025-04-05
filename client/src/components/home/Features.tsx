'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Users, LineChart, Star, Database, Shield, Layers } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  index: number
  color: 'purple' | 'blue' | 'cyan' | 'pink' | 'green'
}

function FeatureCard({ title, description, icon, index, color }: FeatureCardProps) {
  const colorClasses = {
    purple: {
      badge: 'bg-verxio-purple/20 text-verxio-purple border-verxio-purple/30',
      icon: 'text-verxio-purple',
      border: 'border-verxio-purple/10',
    },
    blue: {
      badge: 'bg-verxio-blue/20 text-verxio-blue border-verxio-blue/30',
      icon: 'text-verxio-blue',
      border: 'border-verxio-blue/10',
    },
    cyan: {
      badge: 'bg-verxio-cyan/20 text-verxio-cyan border-verxio-cyan/30',
      icon: 'text-verxio-cyan',
      border: 'border-verxio-cyan/10',
    },
    pink: {
      badge: 'bg-verxio-pink/20 text-verxio-pink border-verxio-pink/30',
      icon: 'text-verxio-pink',
      border: 'border-verxio-pink/10',
    },
    green: {
      badge: 'bg-verxio-green/20 text-verxio-green border-verxio-green/30',
      icon: 'text-verxio-green',
      border: 'border-verxio-green/10',
    },
  }

  const classes = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <Card className={`bg-verxio-dark border ${classes.border} hover:shadow-lg transition-all duration-300 h-full`}>
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className={`pixel-font ${classes.badge} px-3 py-1 text-xs`}>
              Feature {index + 1}
            </Badge>
            <div className={`p-2 rounded-full bg-verxio-dark/70 ${classes.icon}`}>{icon}</div>
          </div>

          <h3 className="pixel-font text-base font-bold text-white mb-2">{title}</h3>
          <p className="kalam text-white/70 text-sm flex-grow">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Features() {
  const features = [
    {
      id: 'on-chain-loyalty',
      title: 'On-Chain Loyalty',
      description: 'Transparent, immutable, and secure loyalty programs for enhanced trust and reliability.',
      icon: <Database size={24} />,
      color: 'purple' as const,
    },
    {
      id: 'customer-engagement',
      title: 'Customer Engagement',
      description: 'Boost engagement with gamified loyalty experiences that keep customers coming back',
      icon: <Users size={24} />,
      color: 'blue' as const,
    },
    {
      id: 'data-insights',
      title: 'Data Insights',
      description: 'Gain valuable insights into customer behaviors to optimize your marketing strategies.',
      icon: <LineChart size={24} />,
      color: 'cyan' as const,
    },
    {
      id: 'seamless-rewards',
      title: 'Seamless Rewards',
      description: 'Automatically trigger rewards based on customer actions and loyalty levels.',
      icon: <Star size={24} />,
      color: 'pink' as const,
    },
    {
      id: 'security-first',
      title: 'Security First',
      description: 'Protect your loyalty program and customer data from unauthorized access and fraud.',
      icon: <Shield size={24} />,
      color: 'green' as const,
    },
    {
      id: 'flexible-integration',
      title: 'Flexible Integration',
      description: 'Integrate with your existing systems and customize to match your brand identity.',
      icon: <Layers size={24} />,
      color: 'purple' as const,
    },
  ]

  return (
    <div className="py-20 px-4 md:px-0">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="pixel-font text-3xl md:text-4xl text-white gradient-text mb-4 uppercase"
          >
            Powerful Features for Your Loyalty Program
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="orbitron text-lg text-white/70 max-w-3xl mx-auto"
          >
            Enhance customer retention while gaining valuable insights into your customer preferences with our on-chain
            loyalty solution
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
              color={feature.color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
