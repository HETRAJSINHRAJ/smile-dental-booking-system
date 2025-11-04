import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/localization/currency';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, Search, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { paymentAuditService, PaymentAuditLog } from '@/lib/payment/paymentAudit';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentAuditViewerProps {
  appointmentId?: string;
  patientId?: string;
  showFilters?: boolean;
}

const ACTION_ICONS: Record<string, React.ReactElement> = {
  payment_initiated: <Clock className="w-4 h-4" />,
  payment_success: <CheckCircle className="w-4 h-4" />,
  payment_failed: <XCircle className="w-4 h-4" />,
  payment_cancelled: <XCircle className="w-4 h-4" />,
  refund_initiated: <RefreshCw className="w-4 h-4" />,
  refund_completed: <CheckCircle className="w-4 h-4" />
};

const ACTION_COLORS: Record<string, string> = {
  payment_initiated: 'bg-blue-100 text-blue-800',
  payment_success: 'bg-green-100 text-green-800',
  payment_failed: 'bg-red-100 text-red-800',
  payment_cancelled: 'bg-gray-100 text-gray-800',
  refund_initiated: 'bg-yellow-100 text-yellow-800',
  refund_completed: 'bg-green-100 text-green-800'
};

const PAYMENT_TYPE_COLORS: Record<string, string> = {
  appointment_reservation: 'bg-purple-100 text-purple-800',
  service_payment: 'bg-indigo-100 text-indigo-800',
  refund: 'bg-orange-100 text-orange-800'
};

export function PaymentAuditViewer({ appointmentId, patientId, showFilters = true }: PaymentAuditViewerProps) {
  const [auditLogs, setAuditLogs] = useState<PaymentAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadAuditLogs();
  }, [appointmentId, patientId]);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError('');

    try {
      let logs: PaymentAuditLog[] = [];

      if (appointmentId) {
        logs = await paymentAuditService.getPaymentHistory(appointmentId);
      } else if (patientId) {
        logs = await paymentAuditService.getPatientPaymentHistory(patientId);
      } else {
        // Load recent logs if no specific filter
        logs = []; // You might want to implement a method to get recent logs
      }

      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError('Failed to load payment audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesPaymentType = paymentTypeFilter === 'all' || log.paymentType === paymentTypeFilter;

    return matchesSearch && matchesAction && matchesPaymentType;
  });

  const getActionDisplay = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPaymentTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading payment audit logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Audit Filters</CardTitle>
            <CardDescription>Filter payment logs by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action-filter">Action</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger id="action-filter">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="payment_initiated">Payment Initiated</SelectItem>
                    <SelectItem value="payment_success">Payment Success</SelectItem>
                    <SelectItem value="payment_failed">Payment Failed</SelectItem>
                    <SelectItem value="payment_cancelled">Payment Cancelled</SelectItem>
                    <SelectItem value="refund_initiated">Refund Initiated</SelectItem>
                    <SelectItem value="refund_completed">Refund Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-type-filter">Payment Type</Label>
                <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                  <SelectTrigger id="payment-type-filter">
                    <SelectValue placeholder="Filter by payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="appointment_reservation">Appointment Reservation</SelectItem>
                    <SelectItem value="service_payment">Service Payment</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Audit Logs</CardTitle>
          <CardDescription>
            {appointmentId ? `Payment history for appointment ${appointmentId}` : 
             patientId ? `Payment history for patient ${patientId}` : 
             'Recent payment audit logs'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment audit logs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <div key={log.id || index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${ACTION_COLORS[log.action]}`}>
                        {ACTION_ICONS[log.action]}
                      </div>
                      <div>
                        <p className="font-medium">{getActionDisplay(log.action)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(log.createdAt?.toDate() || new Date(), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={PAYMENT_TYPE_COLORS[log.paymentType]}>
                        {getPaymentTypeDisplay(log.paymentType)}
                      </Badge>
                      <p className="font-bold text-lg mt-1">
                        {formatCurrency(log.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Patient</p>
                      <p className="font-medium">{log.patientName}</p>
                      <p className="text-muted-foreground">{log.patientEmail}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Service & Provider</p>
                      <p className="font-medium">{log.serviceName}</p>
                      <p className="text-muted-foreground">{log.providerName}</p>
                    </div>
                  </div>

                  {log.transactionId && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-xs">{log.transactionId}</p>
                    </div>
                  )}

                  {log.paymentMethod && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{log.paymentMethod}</p>
                    </div>
                  )}

                  {log.errorMessage && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{log.errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}