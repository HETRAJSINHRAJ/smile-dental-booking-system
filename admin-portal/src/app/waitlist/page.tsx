"use client";

import { useState, useEffect } from "react";
import { Clock, Filter, Search, Calendar, User, Briefcase, Bell, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllDocuments } from "@/lib/firebase/firestore";
import type { Waitlist } from "@/types/shared";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { notifyNextWaitlistUser } from "@/lib/waitlist/waitlistNotificationService";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

type WaitlistStatus = "active" | "notified" | "expired" | "booked" | "cancelled";

const statusColors: Record<WaitlistStatus, string> = {
  active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  notified: "bg-green-500/10 text-green-500 border-green-500/20",
  expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  booked: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function WaitlistPage() {
  const [waitlistEntries, setWaitlistEntries] = useState<Waitlist[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Waitlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [notifying, setNotifying] = useState<string | null>(null);

  useEffect(() => {
    fetchWaitlistEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [waitlistEntries, searchTerm, statusFilter]);

  const fetchWaitlistEntries = async () => {
    try {
      setLoading(true);
      const entries = await getAllDocuments<Waitlist>("waitlist");
      
      // Sort by creation date (newest first)
      entries.sort((a, b) => {
        const aDate = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
        const bDate = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
        return bDate - aDate;
      });
      
      setWaitlistEntries(entries);
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      toast.error("Failed to load waitlist entries");
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...waitlistEntries];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.userName.toLowerCase().includes(term) ||
          entry.userEmail.toLowerCase().includes(term) ||
          entry.serviceName.toLowerCase().includes(term) ||
          entry.providerName.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((entry) => entry.status === statusFilter);
    }

    setFilteredEntries(filtered);
  };

  const handleManualNotify = async (entry: Waitlist) => {
    try {
      setNotifying(entry.id);
      const appointmentDate = entry.preferredDate.toDate();
      
      const notified = await notifyNextWaitlistUser(
        entry.providerId,
        entry.serviceId,
        appointmentDate,
        entry.preferredTime
      );

      if (notified) {
        toast.success("Waitlist user notified successfully!");
        await fetchWaitlistEntries();
      } else {
        toast.error("Failed to notify waitlist user");
      }
    } catch (error) {
      console.error("Error notifying waitlist user:", error);
      toast.error("Failed to notify waitlist user");
    } finally {
      setNotifying(null);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this waitlist entry?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "waitlist", entryId));
      toast.success("Waitlist entry deleted");
      await fetchWaitlistEntries();
    } catch (error) {
      console.error("Error deleting waitlist entry:", error);
      toast.error("Failed to delete waitlist entry");
    }
  };

  const formatDate = (date: Timestamp) => {
    return date.toDate().toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getStatusBadge = (status: WaitlistStatus) => {
    return (
      <Badge variant="outline" className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: waitlistEntries.length,
    active: waitlistEntries.filter((e) => e.status === "active").length,
    notified: waitlistEntries.filter((e) => e.status === "notified").length,
    expired: waitlistEntries.filter((e) => e.status === "expired").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Waitlist Management</h1>
        <p className="text-muted-foreground">
          Manage and notify patients on the waitlist
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.notified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, service, or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="notified">Notified</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries</CardTitle>
          <CardDescription>
            {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No waitlist entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Preferred Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.userName}</div>
                          <div className="text-sm text-muted-foreground">{entry.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{entry.serviceName}</TableCell>
                      <TableCell>{entry.providerName}</TableCell>
                      <TableCell>{formatDate(entry.preferredDate)}</TableCell>
                      <TableCell>{formatTime(entry.preferredTime)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>{formatDate(entry.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {entry.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleManualNotify(entry)}
                              disabled={notifying === entry.id}
                            >
                              {notifying === entry.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Bell className="h-4 w-4 mr-1" />
                                  Notify
                                </>
                              )}
                            </Button>
                          )}
                          {(entry.status === "expired" || entry.status === "cancelled") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
