"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { UserProfile } from "@/types/shared";
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

export default function PatientsReportPage() {
  const [loading, setLoading] = useState(true);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("month");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    newPatients: 0,
    activePatients: 0,
    growthRate: 0,
  });

  useEffect(() => {
    fetchData();
  }, [dateRangePreset, customDateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateRange = AnalyticsDataService.getDateRange(dateRangePreset, customDateRange);
      
      // Fetch all patients
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, where("role", "==", "patient"));
      const usersSnapshot = await getDocs(usersQuery);
      const allPatients = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserProfile[];

      // Filter new patients by date range
      const newPatients = allPatients.filter(patient => {
        const createdAt = patient.createdAt.toDate();
        return createdAt >= dateRange.start && createdAt <= dateRange.end;
      });

      setPatients(newPatients);

      // Calculate previous period for growth rate
      const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
      const previousStart = new Date(dateRange.start.getTime() - periodLength);
      const previousEnd = new Date(dateRange.start);

      const previousPatients = allPatients.filter(patient => {
        const createdAt = patient.createdAt.toDate();
        return createdAt >= previousStart && createdAt < previousEnd;
      });

      const growthRate = previousPatients.length > 0
        ? ((newPatients.length - previousPatients.length) / previousPatients.length) * 100
        : 0;

      setStats({
        total: allPatients.length,
        newPatients: newPatients.length,
        activePatients: allPatients.length, // Could be refined with last activity date
        growthRate,
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Registration Date",
      "Date of Birth",
      "Gender"
    ];

    const rows = patients.map(patient => [
      patient.fullName,
      patient.email,
      patient.phone || "N/A",
      patient.createdAt.toDate().toLocaleDateString(),
      patient.dateOfBirth ? patient.dateOfBirth.toDate().toLocaleDateString() : "N/A",
      patient.gender || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      "",
      `Total Patients,${stats.total}`,
      `New Patients (Period),${stats.newPatients}`,
      `Growth Rate,${stats.growthRate.toFixed(2)}%`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patients-report-${dateRangePreset}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patient Demographics Report</h1>
          <p className="text-muted-foreground">
            Patient registration trends and insights
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={patients.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select date range to view patient registration data</CardDescription>
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
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.newPatients}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.growthRate >= 0 ? "+" : ""}{stats.growthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              vs previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activePatients}</div>
            <p className="text-xs text-muted-foreground">With accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Trend</CardTitle>
          <CardDescription>New patient registrations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Registrations</span>
              <span className="text-2xl font-bold text-green-600">{stats.newPatients}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${stats.total > 0 ? (stats.newPatients / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.newPatients / stats.total) * 100).toFixed(1) : 0}% of total patients
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>New Patient Registrations</CardTitle>
          <CardDescription>
            {patients.length} new patients in selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No new patients</h3>
              <p className="text-muted-foreground">
                No new patient registrations in the selected time range
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Gender</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.slice(0, 50).map((patient) => (
                    <TableRow key={patient.uid}>
                      <TableCell className="font-medium">{patient.fullName}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phone || "N/A"}</TableCell>
                      <TableCell>
                        {patient.createdAt.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell className="capitalize">{patient.gender || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {patients.length > 50 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  Showing 50 of {patients.length} patients. Export to CSV to view all.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
