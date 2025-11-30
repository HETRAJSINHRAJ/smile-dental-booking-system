'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronRight,
  User,
  Calendar,
  Activity,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Card } from '@/components/ui/card';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuditLog, AuditAction } from '@/types/shared';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const actionColors: Record<string, string> = {
  create: 'bg-green-500/10 text-green-500 border-green-500/20',
  read: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  update: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  delete: 'bg-red-500/10 text-red-500 border-red-500/20',
  login: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  logout: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  password_reset: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  payment_initiated: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  payment_completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  payment_failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  refund_initiated: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  refund_completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  appointment_confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  appointment_cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  appointment_rescheduled: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  appointment_completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  review_submitted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  review_approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  review_rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Filter states
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, userFilter, actionFilter, resourceFilter, startDate, endDate]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const logsRef = collection(db, 'auditLogs');
      const q = query(
        logsRef,
        orderBy('timestamp', 'desc'),
        limit(500) // Limit to last 500 logs for performance
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AuditLog[];

      setLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // User filter
    if (userFilter) {
      const term = userFilter.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.userName.toLowerCase().includes(term) ||
          log.userEmail.toLowerCase().includes(term) ||
          log.userId.toLowerCase().includes(term)
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Resource filter
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(log => log.resource === resourceFilter);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => {
        const logDate = log.timestamp instanceof Timestamp 
          ? log.timestamp.toDate() 
          : log.timestamp;
        return logDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => {
        const logDate = log.timestamp instanceof Timestamp 
          ? log.timestamp.toDate() 
          : log.timestamp;
        return logDate <= end;
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleRow = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'Timestamp',
        'User',
        'Email',
        'Role',
        'Action',
        'Resource',
        'Resource ID',
        'Description',
        'IP Address',
      ];

      const rows = filteredLogs.map(log => [
        log.timestamp instanceof Timestamp 
          ? log.timestamp.toDate().toISOString() 
          : new Date(log.timestamp).toISOString(),
        log.userName,
        log.userEmail,
        log.userRole,
        log.action,
        log.resource,
        log.resourceId,
        log.description || '',
        log.metadata.ipAddress,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const formatTimestamp = (timestamp: Timestamp | Date) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderChanges = (log: AuditLog) => {
    if (!log.changes) return null;

    const { before, after } = log.changes;
    const changedFields = Object.keys(after).filter(
      key => JSON.stringify(before[key]) !== JSON.stringify(after[key])
    );

    if (changedFields.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Changes:</h4>
        {changedFields.map(field => (
          <div key={field} className="bg-gray-50 p-3 rounded border border-gray-200">
            <div className="text-xs font-medium text-gray-600 mb-1">{field}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">Before:</div>
                <div className="text-red-600 font-mono text-xs break-all">
                  {JSON.stringify(before[field], null, 2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">After:</div>
                <div className="text-green-600 font-mono text-xs break-all">
                  {JSON.stringify(after[field], null, 2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Get unique values for filters
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueResources = Array.from(new Set(logs.map(log => log.resource)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all administrative actions for compliance and security
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={filteredLogs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <User className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Users</p>
              <p className="text-2xl font-bold">
                {new Set(logs.map(log => log.userId)).size}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resources</p>
              <p className="text-2xl font-bold">{uniqueResources.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Filtered</p>
              <p className="text-2xl font-bold">{filteredLogs.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Input
                placeholder="Search by name or email..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource</label>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {uniqueResources.map(resource => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {(userFilter || actionFilter !== 'all' || resourceFilter !== 'all' || startDate || endDate) && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUserFilter('');
                  setActionFilter('all');
                  setResourceFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : currentLogs.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
          <p className="text-muted-foreground">
            {userFilter || actionFilter !== 'all' || resourceFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Audit logs will appear here as actions are performed'}
          </p>
        </Card>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLogs.map((log) => (
                  <>
                    <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell onClick={() => toggleRow(log.id)}>
                        {log.changes ? (
                          expandedRows.has(log.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )
                        ) : null}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div>{formatTimestamp(log.timestamp)}</div>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(
                            log.timestamp instanceof Timestamp 
                              ? log.timestamp.toDate() 
                              : log.timestamp,
                            { addSuffix: true }
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-sm text-muted-foreground">{log.userEmail}</div>
                        <Badge variant="outline" className="mt-1">
                          {log.userRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={actionColors[log.action] || 'bg-gray-500/10 text-gray-500'}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.resource}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {log.resourceId}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm truncate">{log.description}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.metadata.ipAddress}
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(log.id) && log.changes && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30">
                          <div className="p-4">
                            {renderChanges(log)}
                            <div className="mt-4 text-xs text-muted-foreground">
                              <div>User Agent: {log.metadata.userAgent}</div>
                              {log.metadata.sessionId && (
                                <div>Session ID: {log.metadata.sessionId}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
