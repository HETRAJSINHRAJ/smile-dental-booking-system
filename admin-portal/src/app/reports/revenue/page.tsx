"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/localization/currency';
import { Download, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getAllDocuments } from '@/lib/firebase/firestore';
import type { Appointment } from '@/types/shared';
import { Timestamp } from 'firebase/firestore';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'custom';

interface RevenueData {
  date: string;
  reservationFees: number;
  servicePayments: number;
  refunds: number;
  netRevenue: number;
}

export default function RevenueReportPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totals, setTotals] = useState({
    reservationFees: 0,
    servicePayments: 0,
    refunds: 0,
    netRevenue: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      calculateRevenue();
    }
  }, [appointments, timeRange, startDate, endDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAllDocuments<Appointment>('appointments');
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = () => {
    let filteredAppointments = [...appointments];

    // Apply date filters
    const now = new Date();
    let filterStartDate: Date;
    let filterEndDate: Date = new Date(now);

    if (timeRange === 'daily') {
      filterStartDate = new Date(now);
      filterStartDate.setHours(0, 0, 0, 0);
      filterEndDate.setHours(23, 59, 59, 999);
    } else if (timeRange === 'weekly') {
      filterStartDate = new Date(now);
      filterStartDate.setDate(now.getDate() - 7);
      filterStartDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'monthly') {
      filterStartDate = new Date(now);
      filterStartDate.setDate(1);
      filterStartDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'custom' && startDate && endDate) {
      filterStartDate = new Date(startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999);
    } else {
      filterStartDate = new Date(now);
      filterStartDate.setDate(1);
      filterStartDate.setHours(0, 0, 0, 0);
    }

    filteredAppointments = filteredAppointments.filter(apt => {
      const aptDate = apt.appointmentDate instanceof Timestamp 
        ? apt.appointmentDate.toDate() 
        : apt.appointmentDate;
      return aptDate >= filterStartDate && aptDate <= filterEndDate;
    });

    // Group by date
    const revenueByDate = new Map<string, RevenueData>();

    filteredAppointments.forEach(apt => {
      const aptDate = apt.appointmentDate instanceof Timestamp 
        ? apt.appointmentDate.toDate() 
        : apt.appointmentDate;
      const dateKey = aptDate.toISOString().split('T')[0];

      if (!revenueByDate.has(dateKey)) {
        revenueByDate.set(dateKey, {
          date: dateKey,
          reservationFees: 0,
          servicePayments: 0,
          refunds: 0,
          netRevenue: 0,
        });
      }

      const dayData = revenueByDate.get(dateKey)!;

      // Add reservation fees (only if paid)
      if (apt.paymentStatus === 'reservation_paid' || apt.paymentStatus === 'fully_paid') {
        dayData.reservationFees += apt.paymentAmount || 0;
      }

      // Add service payments (only if paid)
      if (apt.servicePaymentStatus === 'paid') {
        dayData.servicePayments += apt.servicePaymentAmount || 0;
      }

      // Add refunds
      if (apt.paymentStatus === 'refunded') {
        dayData.refunds += apt.paymentAmount || 0;
      }

      // Calculate net revenue
      dayData.netRevenue = dayData.reservationFees + dayData.servicePayments - dayData.refunds;
    });

    // Convert to array and sort by date
    const revenueArray = Array.from(revenueByDate.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setRevenueData(revenueArray);

    // Calculate totals
    const newTotals = revenueArray.reduce(
      (acc, day) => ({
        reservationFees: acc.reservationFees + day.reservationFees,
        servicePayments: acc.servicePayments + day.servicePayments,
        refunds: acc.refunds + day.refunds,
        netRevenue: acc.netRevenue + day.netRevenue,
      }),
      { reservationFees: 0, servicePayments: 0, refunds: 0, netRevenue: 0 }
    );

    setTotals(newTotals);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Reservation Fees', 'Service Payments', 'Refunds', 'Net Revenue'];
    const rows = revenueData.map(row => [
      new Date(row.date).toLocaleDateString(),
      row.reservationFees.toFixed(2),
      row.servicePayments.toFixed(2),
      row.refunds.toFixed(2),
      row.netRevenue.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      `Total,${totals.reservationFees.toFixed(2)},${totals.servicePayments.toFixed(2)},${totals.refunds.toFixed(2)},${totals.netRevenue.toFixed(2)}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Revenue report exported successfully!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Report</h1>
          <p className="text-muted-foreground">Track revenue from reservations, service payments, and refunds</p>
        </div>
        <Button onClick={exportToCSV} disabled={revenueData.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select time range to view revenue data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time-range">Time Range</Label>
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger id="time-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">Last 7 Days</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservation Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.reservationFees)}</div>
            <p className="text-xs text-muted-foreground">Online payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.servicePayments)}</div>
            <p className="text-xs text-muted-foreground">Collected at clinic</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">-{formatCurrency(totals.refunds)}</div>
            <p className="text-xs text-muted-foreground">Refunded to patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totals.netRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total after refunds</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
          <CardDescription>Revenue breakdown by date</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : revenueData.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No revenue data</h3>
              <p className="text-muted-foreground">No revenue recorded for the selected time range</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Reservation Fees</TableHead>
                    <TableHead className="text-right">Service Payments</TableHead>
                    <TableHead className="text-right">Refunds</TableHead>
                    <TableHead className="text-right">Net Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{formatDate(row.date)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.reservationFees)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.servicePayments)}</TableCell>
                      <TableCell className="text-right text-red-500">
                        {row.refunds > 0 ? `-${formatCurrency(row.refunds)}` : formatCurrency(0)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <Badge variant={row.netRevenue >= 0 ? 'default' : 'destructive'}>
                          {formatCurrency(row.netRevenue)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.reservationFees)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.servicePayments)}</TableCell>
                    <TableCell className="text-right text-red-500">
                      {totals.refunds > 0 ? `-${formatCurrency(totals.refunds)}` : formatCurrency(0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={totals.netRevenue >= 0 ? 'default' : 'destructive'}>
                        {formatCurrency(totals.netRevenue)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
