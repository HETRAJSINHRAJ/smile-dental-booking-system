'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Receipt, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Appointment } from '@/types/firebase';
import { generateAndUploadReceipt } from '@/lib/receiptGenerator';

interface ReceiptManagerProps {
  appointment: Appointment;
  onReceiptGenerated?: (receiptUrl: string) => void;
}

export function ReceiptManager({ appointment, onReceiptGenerated }: ReceiptManagerProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGenerateReceipt = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const receiptUrl = await generateAndUploadReceipt(appointment);
      
      if (receiptUrl) {
        setSuccess('Receipt generated and uploaded successfully!');
        onReceiptGenerated?.(receiptUrl);
      } else {
        setError('Failed to generate receipt. Please try again.');
      }
    } catch (err) {
      console.error('Receipt generation error:', err);
      setError('An error occurred while generating the receipt.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (appointment.receiptUrl) {
      window.open(appointment.receiptUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-5 w-5" />
          Receipt Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Receipt Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Receipt Status:</span>
          {appointment.receiptGenerated ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Generated
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Generated
            </Badge>
          )}
        </div>

        {/* Receipt ID */}
        {appointment.receiptId && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Receipt ID:</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {appointment.receiptId}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!appointment.receiptGenerated ? (
            <Button
              onClick={handleGenerateReceipt}
              disabled={generating}
              className="flex-1"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Receipt
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleDownloadReceipt}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                onClick={handleGenerateReceipt}
                variant="outline"
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Regenerate'
                )}
              </Button>
            </>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Receipt URL */}
        {appointment.receiptUrl && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            <strong>Receipt URL:</strong>
            <br />
            <a 
              href={appointment.receiptUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {appointment.receiptUrl}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
