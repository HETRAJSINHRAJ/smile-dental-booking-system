"use client";

import { Card } from "@/components/ui/card";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getAppointments } from "@/lib/firebase/firestore";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Appointment } from "@/types/firebase";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  todayAppointments: number;
  totalPatients: number;
  pendingAppointments: number;
  monthlyAppointments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    todayAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    monthlyAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch all appointments
        const appointments = await getAppointments();
        
        // Fetch total patients count
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalPatients = usersSnapshot.size;
        
        // Calculate today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Calculate this month's date range
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Filter appointments
        const todayAppointments = appointments.filter(apt => {
          const aptDate = apt.appointmentDate.toDate();
          return aptDate >= today && aptDate < tomorrow;
        });
        
        const pendingAppointments = appointments.filter(
          apt => apt.status === "pending"
        );
        
        const monthlyAppointments = appointments.filter(apt => {
          const aptDate = apt.appointmentDate.toDate();
          return aptDate >= monthStart && aptDate <= monthEnd;
        });
        
        setStats({
          todayAppointments: todayAppointments.length,
          totalPatients,
          pendingAppointments: pendingAppointments.length,
          monthlyAppointments: monthlyAppointments.length,
        });
        
        // Get recent appointments (top 5)
        const recentApts = appointments
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
          .slice(0, 5);
        setRecentAppointments(recentApts);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients.toString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      title: "Pending Appointments",
      value: stats.pendingAppointments.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950",
    },
    {
      title: "This Month",
      value: stats.monthlyAppointments.toString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300";
      case "completed":
        return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300";
      default:
        return "bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your practice today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
          <div className="space-y-4">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </>
            ) : recentAppointments.length > 0 ? (
              recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {apt.patientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {apt.serviceName} • {apt.startTime}
                    </p>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(
                      apt.status
                    )}`}
                  >
                    {apt.status}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No appointments yet
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">Confirmed Today</span>
                  <span className="text-lg font-bold text-green-600">
                    {recentAppointments.filter(apt => apt.status === "confirmed").length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">Pending Today</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {recentAppointments.filter(apt => apt.status === "pending").length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">Completed Today</span>
                  <span className="text-lg font-bold text-blue-600">
                    {recentAppointments.filter(apt => apt.status === "completed").length}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
