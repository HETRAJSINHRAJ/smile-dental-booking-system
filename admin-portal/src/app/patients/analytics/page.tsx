"use client";

import { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Calendar, Clock, MapPin } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllDocuments } from '@/lib/firebase/firestore';
import type { UserProfile, Appointment } from '@/types/firebase';
import { toast } from 'sonner';

interface PatientAnalytics {
  totalPatients: number;
  newPatientsThisMonth: number;
  averageAge: number;
  genderDistribution: { male: number; female: number; other: number };
  locationDistribution: { [key: string]: number };
  appointmentFrequency: { [key: string]: number };
  retentionRate: number;
  averageAppointmentsPerPatient: number;
}

export default function PatientAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PatientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [topLocations, setTopLocations] = useState<Array<{ location: string; count: number }>>([]);
  const [appointmentTrends, setAppointmentTrends] = useState<Array<{ month: string; count: number }>>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [patientsData, appointmentsData] = await Promise.all([
        getAllDocuments<UserProfile>('users'),
        getAllDocuments<Appointment>('appointments')
      ]);

      const analytics = calculateAnalytics(patientsData, appointmentsData);
      setAnalytics(analytics);

      // Calculate top locations
      const locationCounts = Object.entries(analytics.locationDistribution)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopLocations(locationCounts);

      // Calculate appointment trends (last 6 months)
      const trends = calculateAppointmentTrends(appointmentsData);
      setAppointmentTrends(trends);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (patients: UserProfile[], appointments: Appointment[]): PatientAnalytics => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Basic counts
    const totalPatients = patients.length;
    const newPatientsThisMonth = patients.filter(p => {
      const createdDate = p.createdAt?.toDate?.() || new Date(p.createdAt || 0);
      return createdDate >= thisMonth;
    }).length;

    // Age calculation
    const patientsWithAge = patients.filter(p => p.dateOfBirth);
    const totalAge = patientsWithAge.reduce((sum, p) => {
      const birthDate = p.dateOfBirth!.toDate();
      const age = now.getFullYear() - birthDate.getFullYear();
      return sum + age;
    }, 0);
    const averageAge = patientsWithAge.length > 0 ? Math.round(totalAge / patientsWithAge.length) : 0;

    // Gender distribution
    const genderDistribution = patients.reduce(
      (acc, p) => {
        const gender = p.gender?.toLowerCase() || 'other';
        acc[gender as keyof typeof acc] = (acc[gender as keyof typeof acc] || 0) + 1;
        return acc;
      },
      { male: 0, female: 0, other: 0 }
    );

    // Location distribution
    const locationDistribution: { [key: string]: number } = {};
    patients.forEach(p => {
      if (p.address?.city) {
        const city = p.address.city;
        locationDistribution[city] = (locationDistribution[city] || 0) + 1;
      }
    });

    // Appointment frequency per patient
    const appointmentCounts: { [key: string]: number } = {};
    appointments.forEach(apt => {
      appointmentCounts[apt.userId] = (appointmentCounts[apt.userId] || 0) + 1;
    });

    const appointmentFrequency: { [key: string]: number } = {};
    Object.values(appointmentCounts).forEach(count => {
      const range = count === 1 ? '1' : count <= 3 ? '2-3' : count <= 5 ? '4-5' : '6+';
      appointmentFrequency[range] = (appointmentFrequency[range] || 0) + 1;
    });

    // Retention rate (patients with more than 1 appointment)
    const patientsWithMultipleAppointments = Object.values(appointmentCounts).filter(count => count > 1).length;
    const retentionRate = totalPatients > 0 ? Math.round((patientsWithMultipleAppointments / totalPatients) * 100) : 0;

    // Average appointments per patient
    const totalAppointments = appointments.length;
    const averageAppointmentsPerPatient = totalPatients > 0 ? Math.round((totalAppointments / totalPatients) * 10) / 10 : 0;

    return {
      totalPatients,
      newPatientsThisMonth,
      averageAge,
      genderDistribution,
      locationDistribution,
      appointmentFrequency,
      retentionRate,
      averageAppointmentsPerPatient
    };
  };

  const calculateAppointmentTrends = (appointments: Appointment[]) => {
    const trends: { [key: string]: number } = {};
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      trends[monthKey] = 0;
    }

    appointments.forEach(apt => {
      const aptDate = apt.appointmentDate?.toDate?.() || new Date(apt.appointmentDate);
      const monthKey = aptDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (trends.hasOwnProperty(monthKey)) {
        trends[monthKey]++;
      }
    });

    return Object.entries(trends).map(([month, count]) => ({ month, count }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
        <p className="text-muted-foreground">Unable to load patient analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Patient Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Insights and trends about your patient base
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Registered patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.newPatientsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              New registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.averageAge}</div>
            <p className="text-xs text-muted-foreground">
              Years old
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Return patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demographics and Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Patient demographics by gender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Female</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(analytics.genderDistribution.female / analytics.totalPatients) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {analytics.genderDistribution.female}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Male</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(analytics.genderDistribution.male / analytics.totalPatients) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {analytics.genderDistribution.male}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Other</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(analytics.genderDistribution.other / analytics.totalPatients) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {analytics.genderDistribution.other}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Locations
            </CardTitle>
            <CardDescription>Cities with most patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLocations.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{location.location}</span>
                  </div>
                  <Badge variant="secondary">{location.count} patients</Badge>
                </div>
              ))}
              {topLocations.length === 0 && (
                <p className="text-sm text-muted-foreground">No location data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Patterns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointment Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Frequency</CardTitle>
            <CardDescription>Distribution of appointments per patient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.appointmentFrequency).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{range} appointments</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(count / analytics.totalPatients) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Appointments over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointmentTrends.map((trend) => (
                <div key={trend.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{trend.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max((trend.count / Math.max(...appointmentTrends.map(t => t.count))) * 100, 5)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {trend.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{analytics.averageAppointmentsPerPatient}</div>
              <div className="text-sm text-muted-foreground">Avg Appointments per Patient</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.retentionRate}%</div>
              <div className="text-sm text-muted-foreground">Patient Retention Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((analytics.newPatientsThisMonth / analytics.totalPatients) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Growth Rate This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}