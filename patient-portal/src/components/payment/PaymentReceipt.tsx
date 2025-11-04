import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, User, CreditCard, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/localization/currency';
import { format } from 'date-fns';

interface PaymentReceiptProps {
  appointmentData: {
    id: string;
    serviceName: string;
    providerName: string;
    date: string;
    time: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
  };
  paymentData: {
    transactionId: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    paymentMethod: string;
    paymentDate: string;
    paymentDescription: string;
  };
  servicePaymentInfo?: {
    serviceAmount: number;
    serviceTax: number;
    serviceTotal: number;
    paymentDue: string;
  };
}

export function PaymentReceipt({ 
  appointmentData, 
  paymentData, 
  servicePaymentInfo 
}: PaymentReceiptProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <CardTitle className="text-green-900">Payment Receipt</CardTitle>
                <p className="text-sm text-green-700">Appointment Reservation Confirmed</p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Paid
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Appointment Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Appointment Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium">{appointmentData.serviceName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-medium">{appointmentData.providerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{format(new Date(appointmentData.date), 'dd MMMM yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{appointmentData.time}</p>
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Patient Information</h3>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{appointmentData.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{appointmentData.patientEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{appointmentData.patientPhone}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Payment Information</h3>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium font-mono text-sm">{paymentData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date:</span>
                <span className="font-medium">{format(new Date(paymentData.paymentDate), 'dd MMMM yyyy, HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{paymentData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type:</span>
                <span className="font-medium">{paymentData.paymentDescription}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Amount Paid</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Appointment Reservation Fee:</span>
                  <span className="font-medium">{formatCurrency(paymentData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">GST (18%):</span>
                  <span className="font-medium">{formatCurrency(paymentData.taxAmount)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between font-bold">
                  <span className="text-gray-900">Total Paid:</span>
                  <span className="text-blue-600">{formatCurrency(paymentData.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Payment Reminder */}
          {servicePaymentInfo && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-900">Service Payment Due</h4>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                The following amount will be collected at the clinic during your visit:
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Service Fee:</span>
                  <span className="font-medium">{formatCurrency(servicePaymentInfo.serviceAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">GST (18%):</span>
                  <span className="font-medium">{formatCurrency(servicePaymentInfo.serviceTax)}</span>
                </div>
                <div className="border-t border-yellow-200 pt-1 flex justify-between font-semibold">
                  <span className="text-yellow-900">Total Due at Clinic:</span>
                  <span className="text-yellow-800">{formatCurrency(servicePaymentInfo.serviceTotal)}</span>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                Payment due: {servicePaymentInfo.paymentDue}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p className="mt-1">Please keep this receipt for your records.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}