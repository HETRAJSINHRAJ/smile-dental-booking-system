"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { getAllDocuments } from "@/lib/firebase/firestore";
import type { Appointment } from "@/types/shared";
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
import { Badge } from "@/components/ui/badge";

export default function AppointmentsReportPage() {
  const [loading, setLoading] = useState(true);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("month");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
    noShow: 0,
    cancellationRate: 0,
    completionRate: 0,
  });

  useEffect(() => {
    fetchData();
  }, [dateRangePreset, customDateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateRange = AnalyticsDataService.getDateRange(dateRangePreset, customDateRange);
      
      const allAppointments = await getAllDocuments<Appointment>("appointments");
      
      // Filter by date range
      const filtered = allAppointments.filter(apt => {
        const aptDate = apt.appointmentDate.toDate();
        return aptDate >= dateRange.start && aptDate <= dateRange.end;
      });

      setAppointments(filtered);

      // Calculate stats
      const total = filtered.length;
      const confirmed = filtered.filter(a => a.status === "confirmed").length;
      const pending = filtered.filter(a => a.status === "pending").length;
      const cancelled = filtered.filter(a => a.status === "cancelled").length;
      const completed = filtered.filter(a => a.status === "completed").length;
      const noShow = filtered.filter(a => a.status === "no_show").length;

      setStats({
        total,
        confirmed,
        pending,
        cancelled,
        completed,
        noShow,
        cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Patient",
      "Service",
      "Provider",
      "Status",
      "Time",
      "Confirmation Number"
    ];

    const rows = appointments.map(apt => [
      apt.appointmentDate.toDate().toLocaleDateString(),
      apt.userName,
      apt.serviceName,
      apt.providerName,
      apt.status,
      `${apt.startTime} - ${apt.endTime}`,
      apt.confirmationNumber || apt.id.substring(0, 8).toUpperCase()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      "",
      `Total Appointments,${stats.total}`,
      `Confirmed,${stats.confirmed}`,
      `Pending,${stats.pending}`,
      `Cancelled,${stats.cancelled}`,
      `Completed,${stats.completed}`,
      `No Show,${stats.noShow}`,
      `Cancellation Rate,${stats.cancellationRate.toFixed(2)}%`,
      `Completion Rate,${stats.completionRate.toFixed(2)}%`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments-report-${dateRangePreset}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      case "no_show":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointment Analytics Report</h1>
          <p className="text-muted-foreground">
            Comprehensive appointment statistics and trends
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={appointments.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select date range to view appointment data</CardDescription>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.confirmed / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stats.completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              {stats.cancellationRate.toFixed(1)}% cancellation rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Breakdown of appointments by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Confirmed", count: stats.confirmed, color: "bg-green-500" },
              { label: "Pending", count: stats.pending, color: "bg-yellow-500" },
              { label: "Completed", count: stats.completed, color: "bg-blue-500" },
              { label: "Cancelled", count: stats.cancelled, color: "bg-red-500" },
              { label: "No Show", count: stats.noShow, color: "bg-gray-500" },
            ].map((item) => {
              const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>
            {appointments.length} appointments in selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
              <p className="text-muted-foreground">
                No appointments recorded for the selected time range
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.slice(0, 50).map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        {apt.appointmentDate.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{apt.userName}</TableCell>
                      <TableCell>{apt.serviceName}</TableCell>
                      <TableCell>{apt.providerName}</TableCell>
                      <TableCell className="text-sm">
                        {apt.startTime} - {apt.endTime}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(apt.status)} className="capitalize">
                          {apt.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {appointments.length > 50 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  Showing 50 of {appointments.length} appointments. Export to CSV to view all.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
