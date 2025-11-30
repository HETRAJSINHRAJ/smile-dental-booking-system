'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, TrendingDown, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AnalyticsData {
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickThroughRate: number;
  byChannel: {
    email: ChannelStats;
    sms: ChannelStats;
    push: ChannelStats;
  };
}

interface ChannelStats {
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickThroughRate: number;
}

export default function NotificationAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });
  const [channel, setChannel] = useState<string>('all');
  const [type, setType] = useState<string>('all');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, channel, type]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });

      if (channel !== 'all') {
        params.append('channel', channel);
      }

      if (type !== 'all') {
        params.append('type', type);
      }

      const response = await fetch(`/api/notifications/analytics?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Customize your analytics view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium">From</label>
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">To</label>
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Channel</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="appointment_confirmed">Appointment Confirmed</SelectItem>
                  <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                  <SelectItem value="appointment_cancelled">Appointment Cancelled</SelectItem>
                  <SelectItem value="payment_success">Payment Success</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSent.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.deliveryRate)}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              {analytics.deliveryRate >= 95 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              {analytics.totalFailed} failed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.openRate)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {analytics.totalOpened.toLocaleString()} opened
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Click-Through Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.clickThroughRate)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {analytics.totalClicked.toLocaleString()} clicked
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Channel</CardTitle>
          <CardDescription>Compare notification performance across different channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Email</h3>
              </div>
              <div className="grid grid-cols-4 gap-4 pl-7">
                <div>
                  <div className="text-sm text-muted-foreground">Sent</div>
                  <div className="text-lg font-semibold">{analytics.byChannel.email.sent.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Delivery Rate</div>
                  <div className="text-lg font-semibold">{formatPercentage(analytics.byChannel.email.deliveryRate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Open Rate</div>
                  <div className="text-lg font-semibold">{formatPercentage(analytics.byChannel.email.openRate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">CTR</div>
                  <div className="text-lg font-semibold">{formatPercentage(analytics.byChannel.email.clickThroughRate)}</div>
                </div>
              </div>
            </div>

            {/* SMS */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">SMS</h3>
              </div>
              <div className="grid grid-cols-4 gap-4 pl-7">
                <div>
                  <div className="text-sm text-muted-foreground">Sent</div>
                  <div className="text-lg font-semibold">{analytics.byChannel.sms.sent.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Delivery Rate</div>
                  <div className="text-lg font-semibold">{formatPercentage(analytics.byChannel.sms.deliveryRate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Open Rate</div>
                  <div className="text-lg font-semibold">{formatPercentage(analytics.byChannel.sms.openRate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">CTR</div>
                  <div className="text-lg font-semibold">{formatPercentage(analytics.byChannel.sms.clickThroughRate)}</div>
                </div>
              </div>
            </div>

            {/* Push */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Push Notifications</h3>
              </div>
              <div className="grid grid-cols-4 gap-4 pl-7">
                <div>
                  <div className="text-sm text-muted-foreground">Sent</div>
                  <div className="text-lg font-semibold">{analytics.byChannel.push.sent.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Delivery Rate</div>
                  <div className="text-lg font-semibold">{formatPercentage(analytics.byChannel.push.deliveryRate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Open Rate</div>
                  <div className="text-lg font-semibold">{formatPercentage(analytics.byChannel.push.openRate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">CTR</div>
                  <div className="text-lg font-semibold">{formatPercentage(analytics.byChannel.push.clickThroughRate)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
