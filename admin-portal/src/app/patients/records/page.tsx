"use client";

import { useState, useEffect } from 'react';
import { FileText, Search, Download, Eye, Edit, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllDocuments } from '@/lib/firebase/firestore';
import type { UserProfile } from '@/types/shared';
import { toast } from 'sonner';

export default function PatientRecordsPage() {
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadPatientRecords();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter]);

  const loadPatientRecords = async () => {
    try {
      setLoading(true);
      const patientsData = await getAllDocuments<UserProfile>('users');
      
      // Sort by creation date (most recent first)
      patientsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patient records:', error);
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.fullName.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term) ||
        (patient.phone && patient.phone.includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => {
        switch (statusFilter) {
          case 'complete':
            return patient.medicalHistory && patient.insurance && patient.emergencyContact;
          case 'incomplete':
            return !patient.medicalHistory || !patient.insurance || !patient.emergencyContact;
          case 'verified':
            return patient.emailVerified;
          case 'unverified':
            return !patient.emailVerified;
          default:
            return true;
        }
      });
    }

    setFilteredPatients(filtered);
  };

  const getRecordStatus = (patient: UserProfile) => {
    const hasBasicInfo = patient.fullName && patient.email && patient.phone;
    const hasMedicalHistory = patient.medicalHistory;
    const hasInsurance = patient.insurance;
    const hasEmergencyContact = patient.emergencyContact;
    
    const completedSections = [hasBasicInfo, hasMedicalHistory, hasInsurance, hasEmergencyContact].filter(Boolean).length;
    
    if (completedSections === 4) return { status: 'Complete', color: 'bg-green-100 text-green-800' };
    if (completedSections >= 2) return { status: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Incomplete', color: 'bg-red-100 text-red-800' };
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const dateObj = date?.toDate?.() || new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportRecords = () => {
    // This would typically export to CSV or PDF
    toast.info('Export functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Patient Records
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and review patient documentation and records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportRecords}>
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              All patient records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete Records</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {patients.filter(p => {
                const { status } = getRecordStatus(p);
                return status === 'Complete';
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Fully documented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial Records</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {patients.filter(p => {
                const { status } = getRecordStatus(p);
                return status === 'Partial';
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Needs completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplete Records</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {patients.filter(p => {
                const { status } = getRecordStatus(p);
                return status === 'Incomplete';
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>
                {filteredPatients.length} record{filteredPatients.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="verified">Email Verified</SelectItem>
                <SelectItem value="unverified">Email Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Records Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Record Status</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No patient records found matching your criteria.' 
                        : 'No patient records found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => {
                    const recordStatus = getRecordStatus(patient);
                    
                    return (
                      <TableRow key={patient.uid}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{patient.fullName}</div>
                            <div className="text-sm text-muted-foreground">{patient.email}</div>
                            {patient.phone && (
                              <div className="text-sm text-muted-foreground">{patient.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={recordStatus.color}>
                            {recordStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={patient.emailVerified ? "default" : "secondary"}>
                            {patient.emailVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(patient.updatedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(patient.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}