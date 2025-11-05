"use client";

import { useState, useEffect } from 'react';
import { Heart, Search, AlertTriangle, Pill, Activity, FileText } from 'lucide-react';
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
import type { UserProfile } from '@/types/firebase';
import { toast } from 'sonner';

export default function MedicalHistoryPage() {
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filterType]);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      const patientsData = await getAllDocuments<UserProfile>('users');
      
      // Filter only patients with medical history
      const patientsWithMedicalHistory = patientsData.filter(patient => 
        patient.medicalHistory && (
          patient.medicalHistory.allergies?.length > 0 ||
          patient.medicalHistory.medications?.length > 0 ||
          patient.medicalHistory.conditions?.length > 0 ||
          patient.medicalHistory.notes
        )
      );
      
      setPatients(patientsWithMedicalHistory);
    } catch (error) {
      console.error('Error loading medical history:', error);
      toast.error('Failed to load medical history');
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
        patient.medicalHistory?.allergies?.some(allergy => 
          allergy.toLowerCase().includes(term)
        ) ||
        patient.medicalHistory?.medications?.some(med => 
          med.toLowerCase().includes(term)
        ) ||
        patient.medicalHistory?.conditions?.some(condition => 
          condition.toLowerCase().includes(term)
        )
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(patient => {
        switch (filterType) {
          case 'allergies':
            return patient.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0;
          case 'medications':
            return patient.medicalHistory?.medications && patient.medicalHistory.medications.length > 0;
          case 'conditions':
            return patient.medicalHistory?.conditions && patient.medicalHistory.conditions.length > 0;
          case 'critical':
            return patient.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0;
          default:
            return true;
        }
      });
    }

    setFilteredPatients(filtered);
  };

  const getRiskLevel = (patient: UserProfile) => {
    const allergies = patient.medicalHistory?.allergies?.length || 0;
    const conditions = patient.medicalHistory?.conditions?.length || 0;
    const medications = patient.medicalHistory?.medications?.length || 0;
    
    const totalRiskFactors = allergies + conditions + medications;
    
    if (totalRiskFactors >= 5) return { level: 'High', color: 'bg-red-100 text-red-800' };
    if (totalRiskFactors >= 3) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    if (totalRiskFactors >= 1) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    return { level: 'None', color: 'bg-gray-100 text-gray-800' };
  };

  const getAllAllergies = () => {
    const allergies = new Set<string>();
    patients.forEach(patient => {
      patient.medicalHistory?.allergies?.forEach(allergy => allergies.add(allergy));
    });
    return Array.from(allergies);
  };

  const getAllConditions = () => {
    const conditions = new Set<string>();
    patients.forEach(patient => {
      patient.medicalHistory?.conditions?.forEach(condition => conditions.add(condition));
    });
    return Array.from(conditions);
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
            <Heart className="h-8 w-8 text-red-600" />
            Medical History
          </h1>
          <p className="text-muted-foreground mt-2">
            Review patient medical histories, allergies, and conditions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients with History</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              Have medical records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Known Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {patients.filter(p => p.medicalHistory?.allergies && p.medicalHistory.allergies.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Patients with allergies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Medications</CardTitle>
            <Pill className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {patients.filter(p => p.medicalHistory?.medications && p.medicalHistory.medications.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Taking medications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Conditions</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {patients.filter(p => p.medicalHistory?.conditions && p.medicalHistory.conditions.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Have conditions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Common Allergies and Conditions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Common Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getAllAllergies().slice(0, 10).map((allergy, index) => (
                <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {allergy}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Common Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getAllConditions().slice(0, 10).map((condition, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Medical History</CardTitle>
              <CardDescription>
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} with medical history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, allergy, medication, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="allergies">Has Allergies</SelectItem>
                <SelectItem value="medications">On Medications</SelectItem>
                <SelectItem value="conditions">Has Conditions</SelectItem>
                <SelectItem value="critical">Critical Allergies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Medical History Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Allergies</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterType !== 'all' 
                        ? 'No medical history found matching your criteria.' 
                        : 'No medical history records found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => {
                    const riskLevel = getRiskLevel(patient);
                    
                    return (
                      <TableRow key={patient.uid}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{patient.fullName}</div>
                            <div className="text-sm text-muted-foreground">{patient.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={riskLevel.color}>
                            {riskLevel.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {patient.medicalHistory?.allergies?.slice(0, 2).map((allergy, index) => (
                              <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                {allergy}
                              </Badge>
                            ))}
                            {(patient.medicalHistory?.allergies?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(patient.medicalHistory?.allergies?.length || 0) - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {patient.medicalHistory?.medications?.slice(0, 2).map((medication, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                {medication}
                              </Badge>
                            ))}
                            {(patient.medicalHistory?.medications?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(patient.medicalHistory?.medications?.length || 0) - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {patient.medicalHistory?.conditions?.slice(0, 2).map((condition, index) => (
                              <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                {condition}
                              </Badge>
                            ))}
                            {(patient.medicalHistory?.conditions?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(patient.medicalHistory?.conditions?.length || 0) - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {patient.medicalHistory?.notes ? (
                            <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {patient.medicalHistory.notes}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
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