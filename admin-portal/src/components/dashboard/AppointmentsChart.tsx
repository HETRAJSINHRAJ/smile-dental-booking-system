"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AppointmentsChartProps {
  data: Array<{
    date: string;
    confirmed: number;
    cancelled: number;
    completed: number;
    total: number;
  }>;
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments Over Time</CardTitle>
        <CardDescription>Daily appointment trends by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Total"
              />
              <Line 
                type="monotone" 
                dataKey="confirmed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Confirmed"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Completed"
              />
              <Line 
                type="monotone" 
                dataKey="cancelled" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Cancelled"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
