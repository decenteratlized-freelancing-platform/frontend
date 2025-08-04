"use client"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface ChartWidgetProps {
  title: string
  data: Array<{ name: string; value: number }>
  color?: string
}

export default function ChartWidget({ title, data, color = "#3b82f6" }: ChartWidgetProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis hide />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
