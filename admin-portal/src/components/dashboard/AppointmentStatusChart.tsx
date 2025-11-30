"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface AppointmentStatusChartProps {
  data: {
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
    noShow: number;
  };
}

const COLORS = {
  confirmed: "#10b981",
  pending: "#f59e0b",
  cancelled: "#ef4444",
  completed: "#3b82f6",
  noShow: "#6b7280",
};

export function AppointmentStatusChart({ data }: AppointmentStatusChartProps) {
  const chartData = [
    { name: "Confirmed", value: data.confirmed, color: COLORS.confirmed },
    { name: "Pending", value: data.pending, color: COLORS.pending },
    { name: "Cancelled", value: data.cancelled, color: COLORS.cancelled },
    { name: "Completed", value: data.completed, color: COLORS.completed },
    { name: "No Show", value: data.noShow, color: COLORS.noShow },
  ].filter((item) => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Status Distribution</CardTitle>
        <CardDescription>Breakdown of appointments by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
