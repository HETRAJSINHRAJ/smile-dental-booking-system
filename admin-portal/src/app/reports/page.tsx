"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Star, 
  FileText,
  TrendingUp,
  BarChart3,
  PieChart
} from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  const reports = [
    {
      id: "revenue",
      title: "Revenue Report",
      description: "Detailed revenue breakdown by service, provider, and payment type",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
      href: "/reports/revenue",
      features: [
        "Revenue by service",
        "Revenue by provider",
        "Payment type breakdown",
        "Date range filtering",
        "CSV export"
      ]
    },
    {
      id: "appointments",
      title: "Appointment Analytics",
      description: "Comprehensive appointment statistics and status distribution",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
      href: "/reports/appointments",
      features: [
        "Status distribution",
        "Appointment trends",
        "Cancellation analysis",
        "No-show tracking",
        "CSV export"
      ]
    },
    {
      id: "patients",
      title: "Patient Demographics",
      description: "Patient registration trends and demographic insights",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950",
      href: "/reports/patients",
      features: [
        "Registration trends",
        "Active patients",
        "Patient retention",
        "Geographic distribution",
        "CSV export"
      ]
    },
    {
      id: "providers",
      title: "Provider Performance",
      description: "Provider ratings, appointment counts, and performance metrics",
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950",
      href: "/reports/providers",
      features: [
        "Appointment counts",
        "Average ratings",
        "Review analysis",
        "Revenue by provider",
        "CSV export"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate and export detailed reports for business insights
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${report.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <div>
                      <CardTitle>{report.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {report.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={report.href}>
                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Report Overview</CardTitle>
          <CardDescription>
            All reports support date range filtering and CSV export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Real-time Data</p>
                <p className="text-xs text-muted-foreground">
                  All reports use live data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <div className="bg-green-100 dark:bg-green-950 p-3 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Trend Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Compare with previous periods
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <div className="bg-purple-100 dark:bg-purple-950 p-3 rounded-lg">
                <PieChart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Visual Charts</p>
                <p className="text-xs text-muted-foreground">
                  Interactive data visualization
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
