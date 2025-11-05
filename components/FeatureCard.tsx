'use client'

import { Card, CardContent } from '@/components/ui/card'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({
  icon,
  title,
  description
}: FeatureCardProps) {
  return (
    <Card className="border border-border rounded-3xl bg-card">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 rounded-2xl bg-brand flex items-center justify-center flex-shrink-0 mb-5 text-brand-foreground">
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
