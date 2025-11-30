"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";

interface ConversionFunnelChartProps {
  data: {
    serviceViews: number;
    providerViews: number;
    bookingStarted: number;
    bookingCompleted: number;
  };
}

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const calculateRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current / previous) * 100).toFixed(1);
  };

  const stages = [
    {
      name: "Service Views",
      count: data.serviceViews,
      color: "bg-blue-500",
      width: "100%",
    },
    {
      name: "Provider Views",
      count: data.providerViews,
      color: "bg-blue-600",
      width: `${(data.providerViews / data.serviceViews) * 100}%`,
      rate: calculateRate(data.providerViews, data.serviceViews),
    },
    {
      name: "Booking Started",
      count: data.bookingStarted,
      color: "bg-blue-700",
      width: `${(data.bookingStarted / data.serviceViews) * 100}%`,
      rate: calculateRate(data.bookingStarted, data.providerViews),
    },
    {
      name: "Booking Completed",
      count: data.bookingCompleted,
      color: "bg-green-600",
      width: `${(data.bookingCompleted / data.serviceViews) * 100}%`,
      rate: calculateRate(data.bookingCompleted, data.bookingStarted),
    },
  ];

  const overallConversionRate = calculateRate(data.bookingCompleted, data.serviceViews);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>
          Booking conversion rate: {overallConversionRate}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stage.name}</span>
                  {stage.rate && (
                    <span className="text-xs text-muted-foreground">
                      ({stage.rate}% conversion)
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold">{stage.count.toLocaleString()}</span>
              </div>
              <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                <div
                  className={`h-full ${stage.color} flex items-center justify-center text-white font-medium text-sm transition-all duration-500`}
                  style={{ width: stage.width }}
                >
                  {stage.count > 0 && stage.width !== "0%" && (
                    <span className="px-2">{stage.name}</span>
                  )}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
