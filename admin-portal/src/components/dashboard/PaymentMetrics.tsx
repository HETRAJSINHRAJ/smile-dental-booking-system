"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/localization/currency';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart } from 'lucide-react';
import { getAllDocuments } from '@/lib/firebase/firestore';
import type { Appointment } from '@/types/shared';
import { Timestamp } from 'firebase/firestore';

interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  refunds: number;
  paymentSuccessRate: number;
  paymentMethodDistribution: {
    cash: number;
    card: number;
    upi: number;
    other: number;
  };
  revenueByType: {
    reservationFees: number;
    servicePayments: number;
  };
}

export function PaymentMetrics() {
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    refunds: 0,
    paymentSuccessRate: 0,
    paymentMethodDistribution: {
      cash: 0,
      card: 0,
      upi: 0,
      other: 0,
    },
    revenueByType: {
      reservationFees: 0,
      servicePayments: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStats();
  }, []);

  const fetchPaymentStats = async () => {
    try {
      setLoading(true);
      const appointments = await getAllDocuments<Appointment>('appointments');

      // Calculate this month's date range
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);

      // Filter appointments for this month
      const monthlyAppointments = appointments.filter(apt => {
        const aptDate = apt.appointmentDate instanceof Timestamp 
          ? apt.appointmentDate.toDate() 
          : apt.appointmentDate;
        return aptDate >= monthStart;
      });

      let totalRevenue = 0;
      let pendingPayments = 0;
      let refunds = 0;
      let totalPaymentAttempts = 0;
      let successfulPayments = 0;
      const paymentMethods = { cash: 0, card: 0, upi: 0, other: 0 };
      let reservationFees = 0;
      let servicePayments = 0;

      monthlyAppointments.forEach(apt => {
        // Count payment attempts
        if (apt.paymentStatus !== 'pending') {
          totalPaymentAttempts++;
        }

        // Reservation fees
        if (apt.paymentStatus === 'reservation_paid' || apt.paymentStatus === 'fully_paid') {
          reservationFees += apt.paymentAmount || 0;
          totalRevenue += apt.paymentAmount || 0;
          successfulPayments++;
        }

        // Service payments
        if (apt.servicePaymentStatus === 'paid') {
          servicePayments += apt.servicePaymentAmount || 0;
          totalRevenue += apt.servicePaymentAmount || 0;

          // Track payment method distribution
          const method = apt.servicePaymentMethod || 'other';
          if (method in paymentMethods) {
            paymentMethods[method as keyof typeof paymentMethods]++;
          } else {
            paymentMethods.other++;
          }
        }

        // Pending service payments
        if (apt.servicePaymentStatus === 'pending' && apt.status === 'completed') {
          pendingPayments += apt.servicePaymentAmount || 0;
        }

        // Refunds
        if (apt.paymentStatus === 'refunded') {
          refunds += apt.paymentAmount || 0;
          totalRevenue -= apt.paymentAmount || 0;
        }
      });

      // Calculate payment success rate
      const paymentSuccessRate = totalPaymentAttempts > 0 
        ? (successfulPayments / totalPaymentAttempts) * 100 
        : 0;

      setStats({
        totalRevenue,
        pendingPayments,
        refunds,
        paymentSuccessRate,
        paymentMethodDistribution: paymentMethods,
        revenueByType: {
          reservationFees,
          servicePayments,
        },
      });
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPaymentMethodCount = Object.values(stats.paymentMethodDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Payment Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-500">{formatCurrency(stats.pendingPayments)}</div>
                <p className="text-xs text-muted-foreground">Service payments due</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-500">-{formatCurrency(stats.refunds)}</div>
                <p className="text-xs text-muted-foreground">Refunded this month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Success Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-500">{stats.paymentSuccessRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Successful payments</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown and Payment Methods */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue by payment type this month</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reservation Fees</p>
                      <p className="text-xs text-muted-foreground">Online payments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(stats.revenueByType.reservationFees)}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalRevenue > 0 
                        ? `${((stats.revenueByType.reservationFees / stats.totalRevenue) * 100).toFixed(0)}%` 
                        : '0%'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Service Payments</p>
                      <p className="text-xs text-muted-foreground">Collected at clinic</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(stats.revenueByType.servicePayments)}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalRevenue > 0 
                        ? `${((stats.revenueByType.servicePayments / stats.totalRevenue) * 100).toFixed(0)}%` 
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of service payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : totalPaymentMethodCount > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.paymentMethodDistribution).map(([method, count]) => {
                  const percentage = (count / totalPaymentMethodCount) * 100;
                  return (
                    <div key={method} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{method}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No payment data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
