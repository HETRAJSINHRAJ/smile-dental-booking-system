"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { getAllDocuments } from "@/lib/firebase/firestore";
import type { Provider, Appointment, Review } from "@/types/shared";
import { DateRangeSelector, DateRangePreset, DateRange } from "@/components/dashboard/DateRangeSelector";
import { AnalyticsDataService } from "@/lib/analytics/analyticsDataService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/localization/currency";

interface ProviderStats {
  id: string;
  name: string;
  appointmentCount: number;
  completedCount: number;
  cancelledCount: number;
  averageRating: number;
  totalReviews: number;
  revenue: number;
  completionRate: number;
}

export default function ProvidersReportPage() {
  const [loading, setLoading] = useState(true);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("month");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);

  useEffect(() => {
    fetchData();
  }, [dateRangePreset, customDateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateRange = AnalyticsDataService.getDateRange(dateRangePreset, customDateRange);
      
      // Fetch all data
      const [providers, appointments, reviews] = await Promise.all([
        getAllDocuments<Provider>("providers"),
        getAllDocuments<Appointment>("appointments"),
        getAllDocuments<Review>("reviews"),
      ]);

      // Filter appointments by date range
      const filteredAppointments = appointments.filter(apt => {
        const aptDate = apt.appointmentDate.toDate();
        return aptDate >= dateRange.start && aptDate <= dateRange.end;
      });

      // Calculate stats for each provider
      const stats: ProviderStats[] = providers.map(provider => {
        const providerAppointments = filteredAppointments.filter(
          apt => apt.providerId === provider.id
        );
        const completedAppointments = providerAppointments.filter(
          apt => apt.status === "completed"
        );
        const cancelledAppointments = providerAppointments.filter(
          apt => apt.status === "cancelled"
        );

        // Calculate revenue
        const revenue = providerAppointments.reduce((sum, apt) => {
          let total = 0;
          if (apt.paymentStatus === "reservation_paid" || apt.paymentStatus === "fully_paid") {
            total += apt.paymentAmount || 0;
          }
          if (apt.servicePaymentStatus === "paid") {
            total += apt.servicePaymentAmount || 0;
          }
          return sum + total;
        }, 0);

        // Get provider reviews
        const providerReviews = reviews.filter(
          review => review.providerId === provider.id && review.status === "approved"
        );

        const completionRate = providerAppointments.length > 0
          ? (completedAppointments.length / providerAppointments.length) * 100
          : 0;

        return {
          id: provider.id,
          name: provider.name,
          appointmentCount: providerAppointments.length,
          completedCount: completedAppointments.length,
          cancelledCount: cancelledAppointments.length,
          averageRating: provider.rating || 0,
          totalReviews: providerReviews.length,
          revenue,
          completionRate,
        };
      });

      // Sort by appointment count
      stats.sort((a, b) => b.appointmentCount - a.appointmentCount);

      setProviderStats(stats);
    } catch (error) {
      console.error("Error fetching provider data:", error);
      toast.error("Failed to load provider data");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Provider",
      "Total Appointments",
      "Completed",
      "Cancelled",
      "Completion Rate",
      "Average Rating",
      "Total Reviews",
      "Revenue"
    ];

    const rows = providerStats.map(provider => [
      provider.name,
      provider.appointmentCount,
      provider.completedCount,
      provider.cancelledCount,
      `${provider.completionRate.toFixed(2)}%`,
      provider.averageRating.toFixed(1),
      provider.totalReviews,
      provider.revenue.toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      "",
      `Total Providers,${providerStats.length}`,
      `Total Appointments,${providerStats.reduce((sum, p) => sum + p.appointmentCount, 0)}`,
      `Total Revenue,${providerStats.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `providers-report-${dateRangePreset}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully!");
  };

  const totalAppointments = providerStats.reduce((sum, p) => sum + p.appointmentCount, 0);
  const totalRevenue = providerStats.reduce((sum, p) => sum + p.revenue, 0);
  const averageRating = providerStats.length > 0
    ? providerStats.reduce((sum, p) => sum + p.averageRating, 0) / providerStats.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Provider Performance Report</h1>
          <p className="text-muted-foreground">
            Provider ratings, appointments, and revenue metrics
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={providerStats.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select date range to view provider performance</CardDescription>
        </CardHeader>
        <CardContent>
          <DateRangeSelector
            value={dateRangePreset}
            customRange={customDateRange}
            onChange={(preset, range) => {
              setDateRangePreset(preset);
              setCustomDateRange(range);
            }}
          />
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providerStats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-600" />
              {averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Across all providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
      </div>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Performance</CardTitle>
          <CardDescription>
            Detailed performance metrics for each provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : providerStats.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No provider data</h3>
              <p className="text-muted-foreground">
                No provider performance data available
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-right">Appointments</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">Completion Rate</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Reviews</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providerStats.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell className="text-right">{provider.appointmentCount}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {provider.completedCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>{provider.completionRate.toFixed(1)}%</span>
                          {provider.completionRate >= 80 && (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span>{provider.averageRating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{provider.totalReviews}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(provider.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
