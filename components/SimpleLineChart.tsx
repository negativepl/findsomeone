'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SimpleLineChartProps {
  data: { date: string; value: number }[]
  label: string
  color?: string
  totalValue?: number // Optional: use this instead of calculating from data
}

export function SimpleLineChart({ data, label, color = '#f27361', totalValue }: SimpleLineChartProps) {
  // Use provided totalValue or calculate from data
  const displayValue = totalValue ?? data.reduce((sum, item) => sum + item.value, 0)

  // Custom dot component
  const CustomDot = (props: any) => {
    const { cx, cy } = props
    return (
      <circle cx={cx} cy={cy} r={5} fill={color} />
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-bold text-foreground">
          {displayValue.toLocaleString('pl-PL')}
        </span>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 6, left: 6, bottom: 0 }}
          >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
          <XAxis
            dataKey="date"
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px'
                    }}
                  >
                    <p style={{ color: 'hsl(var(--foreground))', margin: 0, marginBottom: '4px', fontWeight: 500 }}>
                      {payload[0].payload.date}
                    </p>
                    <p style={{ color: 'hsl(var(--foreground))', margin: 0 }}>
                      {payload[0].value} wyświetleń
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#colorValue)"
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
