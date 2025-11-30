'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface SMSLog {
  id: string;
  to: string;
  body: string;
  type: string;
  status: 'sent' | 'failed' | 'delivered' | 'undelivered';
  messageSid?: string;
  deliveryStatus?: string;
  error?: string;
  errorCode?: string;
  sentAt: Timestamp;
}

export function SMSLogsViewer() {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const logsRef = collection(db, 'smsLogs');
      const q = query(logsRef, orderBy('sentAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SMSLog[];
      
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      sent: 'default',
      delivered: 'default',
      failed: 'destructive',
      undelivered: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SMS Logs</CardTitle>
          <CardDescription>Loading SMS delivery logs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Logs</CardTitle>
        <CardDescription>
          Recent SMS messages sent through the system (last 50)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No SMS logs found</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.to}</span>
                      {getStatusBadge(log.status)}
                      <Badge variant="outline">{log.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.body.substring(0, 100)}
                      {log.body.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(log.sentAt.toDate(), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                
                {log.error && (
                  <div className="text-sm text-destructive">
                    Error: {log.error}
                    {log.errorCode && ` (${log.errorCode})`}
                  </div>
                )}
                
                {log.messageSid && (
                  <div className="text-xs text-muted-foreground">
                    Message SID: {log.messageSid}
                    {log.deliveryStatus && ` • Status: ${log.deliveryStatus}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
