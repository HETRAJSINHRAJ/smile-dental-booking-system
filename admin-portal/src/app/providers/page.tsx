"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  StandardizedDialog,
  StandardizedDialogContent,
  StandardizedDialogDescription,
  StandardizedDialogFooter,
  StandardizedDialogHeader,
  StandardizedDialogTitle,
  StandardizedDialogBody,
} from "@/components/ui/standardized-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, User, X, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  getServices,
  getProviderSchedule,
  createProviderSchedule,
  updateProviderSchedule,
  deleteProviderSchedule,
} from "@/lib/firebase/firestore";
import type { Provider, Service, ProviderSchedule } from "@/types/firebase";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadcareImageUpload } from "@/components/ui/uploadcare-image-upload";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerSchedules, setProviderSchedules] = useState<
    ProviderSchedule[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    imageUrl: "",
    specialty: "",
    serviceIds: [] as string[],
    yearsOfExperience: 0,
    education: [] as string[],
    languages: [] as string[],
    specializations: [] as string[],
    acceptingNewPatients: true,
    rating: 0,
    totalReviews: 0,
  });

  // Temp input states for arrays
  const [newEducation, setNewEducation] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [providerCountryCode, setProviderCountryCode] = useState('+91');
  const [providerPhoneNumber, setProviderPhoneNumber] = useState('');

  // Country codes list
  const countryCodes = [
    { code: '+1', country: 'US/CA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  ];

  // Phone formatting helper
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as 12345 12345 (5 digits, space, 5 digits)
    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 5)} ${numbers.slice(5)}`;
    } else {
      return `${numbers.slice(0, 5)} ${numbers.slice(5, 10)}`;
    }
  };

  const handleProviderPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setProviderPhoneNumber(formatted);
  };

  // Provider Schedule states
  const [scheduleFormData, setScheduleFormData] = useState<
    Partial<ProviderSchedule>
  >({});
  const [editingSchedule, setEditingSchedule] =
    useState<ProviderSchedule | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [providersData, servicesData] = await Promise.all([
        getProviders(),
        getServices(),
      ]);
      setProviders(providersData);
      setServices(servicesData);

      // Load schedules for all providers
      const allSchedules = await Promise.all(
        providersData.map((provider) => getProviderSchedule(provider.id)),
      );
      setProviderSchedules(allSchedules.flat());
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingProvider(null);
    setFormData({
      name: "",
      title: "",
      bio: "",
      email: "",
      phone: "",
      imageUrl: "",
      specialty: "",
      serviceIds: [],
      yearsOfExperience: 0,
      education: [],
      languages: [],
      specializations: [],
      acceptingNewPatients: true,
      rating: 0,
      totalReviews: 0,
    });
    setProviderCountryCode('+91');
    setProviderPhoneNumber('');
    setDialogOpen(true);
  }

  function openEditDialog(provider: Provider) {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      title: provider.title,
      bio: provider.bio || "",
      email: provider.email || "",
      phone: provider.phone || "",
      imageUrl: provider.imageUrl || "",
      specialty: provider.specialty || "",
      serviceIds: provider.serviceIds || [],
      yearsOfExperience: provider.yearsOfExperience || 0,
      education: provider.education || [],
      languages: provider.languages || [],
      specializations: provider.specializations || [],
      acceptingNewPatients: provider.acceptingNewPatients ?? true,
      rating: provider.rating || 0,
      totalReviews: provider.totalReviews || 0,
    });
    
    // Parse phone number to extract country code
    if (provider.phone) {
      const phoneMatch = provider.phone.match(/^(\+\d+)\s*(.+)$/);
      if (phoneMatch) {
        setProviderCountryCode(phoneMatch[1]);
        setProviderPhoneNumber(phoneMatch[2]);
      } else {
        setProviderCountryCode('+91');
        setProviderPhoneNumber(provider.phone);
      }
    } else {
      setProviderCountryCode('+91');
      setProviderPhoneNumber('');
    }
    
    setDialogOpen(true);
  }

  function openDeleteDialog(provider: Provider) {
    setDeletingProvider(provider);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Combine country code with phone number
      const providerData = {
        ...formData,
        phone: providerPhoneNumber ? `${providerCountryCode} ${providerPhoneNumber}` : ''
      };
      
      if (editingProvider) {
        await updateProvider(editingProvider.id, providerData);
        toast.success("Provider updated successfully");
      } else {
        await createProvider(providerData);
        toast.success("Provider created successfully");
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving provider:", error);
      toast.error("Failed to save provider");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingProvider) return;
    setSubmitting(true);

    try {
      await deleteProvider(deletingProvider.id);
      toast.success("Provider deleted successfully");
      setDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast.error("Failed to delete provider");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleService(serviceId: string) {
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  }

  // Array management functions
  const addEducation = () => {
    if (newEducation.trim()) {
      setFormData((prev) => ({
        ...prev,
        education: [...prev.education, newEducation.trim()],
      }));
      setNewEducation("");
    }
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, newCertification.trim()],
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  // Provider Schedule functions
  function openScheduleDialog(
    providerId?: string,
    schedule?: ProviderSchedule,
  ) {
    setEditingSchedule(schedule || null);
    if (schedule) {
      // Editing existing schedule
      setScheduleFormData(schedule);
    } else {
      // Creating new schedule
      setScheduleFormData({
        id: "",
        providerId: providerId || "",
        dayOfWeek: 1, // Monday
        startTime: "09:00",
        endTime: "17:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        isAvailable: true,
      });
    }
    setScheduleDialogOpen(true);
  }

  async function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate schedule data
    const scheduleData = scheduleFormData;

    // Check if day of week is selected
    if (
      scheduleData.dayOfWeek === undefined ||
      scheduleData.dayOfWeek === null
    ) {
      toast.error("Please select a day of the week");
      return;
    }

    // Validate time slots
    if (!scheduleData.startTime || !scheduleData.endTime) {
      toast.error("Please select both start and end times");
      return;
    }

    // Check if start time is before end time
    if (scheduleData.startTime >= scheduleData.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    // Validate break times if provided
    if (scheduleData.breakStartTime && scheduleData.breakEndTime) {
      if (scheduleData.breakStartTime >= scheduleData.breakEndTime) {
        toast.error("Break start time must be before break end time");
        return;
      }

      // Check if break is within working hours
      if (
        scheduleData.breakStartTime < scheduleData.startTime ||
        scheduleData.breakEndTime > scheduleData.endTime
      ) {
        toast.error("Break time must be within working hours");
        return;
      }
    }

    // Check for conflicting schedules (only for new schedules or when editing day/time)
    const existingSchedules = getProviderSchedules(
      scheduleData.providerId || "",
    );
    const hasConflict = existingSchedules.some((schedule) => {
      if (editingSchedule && schedule.id === editingSchedule.id) return false;

      return (
        schedule.dayOfWeek === scheduleData.dayOfWeek &&
        schedule.isAvailable &&
        scheduleData.isAvailable &&
        scheduleData.startTime &&
        scheduleData.endTime &&
        ((scheduleData.startTime >= schedule.startTime &&
          scheduleData.startTime < schedule.endTime) ||
          (scheduleData.endTime > schedule.startTime &&
            scheduleData.endTime <= schedule.endTime) ||
          (scheduleData.startTime <= schedule.startTime &&
            scheduleData.endTime >= schedule.endTime))
      );
    });

    if (hasConflict) {
      toast.error(
        "This schedule conflicts with an existing schedule for the same day",
      );
      return;
    }

    setSubmitting(true);

    try {
      if (editingSchedule) {
        await updateProviderSchedule(editingSchedule.id, scheduleData);
        toast.success("Schedule updated successfully");
      } else {
        // Ensure all required fields are present for new schedule
        const newScheduleData: Omit<ProviderSchedule, "id"> = {
          providerId: scheduleData.providerId || "",
          dayOfWeek: scheduleData.dayOfWeek!,
          startTime: scheduleData.startTime!,
          endTime: scheduleData.endTime!,
          breakStartTime: scheduleData.breakStartTime,
          breakEndTime: scheduleData.breakEndTime,
          isAvailable: scheduleData.isAvailable ?? true,
        };
        await createProviderSchedule(newScheduleData);
        toast.success("Schedule created successfully");
      }

      setScheduleDialogOpen(false);
      loadData(); // Reload all data including schedules
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleScheduleDelete(scheduleId: string) {
    if (!scheduleId) return;
    setSubmitting(true);

    try {
      await deleteProviderSchedule(scheduleId);
      toast.success("Schedule deleted successfully");
      loadData(); // Reload all data including schedules
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    } finally {
      setSubmitting(false);
    }
  }

  const updateScheduleFormData = (
    field: keyof ProviderSchedule,
    value: string | boolean | number,
  ) => {
    setScheduleFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getProviderSchedules = (providerId: string) => {
    return providerSchedules.filter(
      (schedule) => schedule.providerId === providerId,
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
          <p className="text-muted-foreground mt-2">
            Manage your dental care providers
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {/* Providers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Services</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : providers.length > 0 ? (
              providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {provider.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={provider.imageUrl}
                          alt={provider.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        {provider.acceptingNewPatients && (
                          <span className="text-xs text-green-600">
                            Accepting patients
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{provider.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {provider.specialty || "N/A"}
                  </TableCell>
                  <TableCell>
                    {provider.rating ? (
                      <span className="text-sm">
                        ⭐ {provider.rating.toFixed(1)} (
                        {provider.totalReviews || 0})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {provider.yearsOfExperience} years
                    </span>
                  </TableCell>
                  <TableCell>
                    {provider.serviceIds && provider.serviceIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {provider.serviceIds.slice(0, 2).map((serviceId) => {
                          const service = services.find(s => s.id === serviceId);
                          return service ? (
                            <span key={serviceId} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {service.name}
                            </span>
                          ) : null;
                        })}
                        {provider.serviceIds.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{provider.serviceIds.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No services</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(provider)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(provider)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">
                    No providers found. Add your first provider to get started.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <StandardizedDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <StandardizedDialogContent
          size="3xl"
          className="max-h-[90vh] overflow-hidden flex flex-col p-0"
        >
          <StandardizedDialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <StandardizedDialogTitle>
              {editingProvider ? "Edit Provider" : "Add New Provider"}
            </StandardizedDialogTitle>
            <StandardizedDialogDescription>
              {editingProvider
                ? "Update provider information"
                : "Add a new dental care provider"}
            </StandardizedDialogDescription>
          </StandardizedDialogHeader>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <StandardizedDialogBody className="overflow-y-auto flex-1 px-6 py-4">
              <div className="grid gap-4">
                {/* Provider Image */}
                <div className="space-y-2">
                  <Label>Provider Photo</Label>
                  <UploadcareImageUpload
                    value={formData.imageUrl}
                    onChange={(url) =>
                      setFormData({ ...formData, imageUrl: url })
                    }
                    folder="providers"
                    disabled={submitting}
                  />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., DDS, DMD"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      placeholder="e.g., Orthodontics"
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">
                      Years of Experience
                    </Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearsOfExperience: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex gap-2">
                      <Select value={providerCountryCode} onValueChange={setProviderCountryCode}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              <span className="flex items-center gap-2">
                                <span>{item.flag}</span>
                                <span>{item.code}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        type="tel"
                        className="flex-1"
                        value={providerPhoneNumber}
                        onChange={(e) => handleProviderPhoneChange(e.target.value)}
                        placeholder="98765 43210"
                        maxLength={11}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Brief description about the provider..."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                {/* Rating & Reviews */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rating: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalReviews">Total Reviews</Label>
                    <Input
                      id="totalReviews"
                      type="number"
                      min="0"
                      value={formData.totalReviews}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalReviews: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.acceptingNewPatients}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            acceptingNewPatients: checked === true,
                          })
                        }
                      />
                      <span className="text-sm">Accepting New Patients</span>
                    </label>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <Label>Education</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Harvard School of Dental Medicine"
                      value={newEducation}
                      onChange={(e) => setNewEducation(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addEducation())
                      }
                    />
                    <Button type="button" onClick={addEducation} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                      >
                        <span>{edu}</span>
                        <button
                          type="button"
                          onClick={() => removeEducation(idx)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Board Certified Orthodontist"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addCertification())
                      }
                    />
                    <Button type="button" onClick={addCertification} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specializations.map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                      >
                        <span>{spec}</span>
                        <button
                          type="button"
                          onClick={() => removeCertification(idx)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., English, Spanish"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addLanguage())
                      }
                    />
                    <Button type="button" onClick={addLanguage} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.languages.map((lang, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                      >
                        <span>{lang}</span>
                        <button
                          type="button"
                          onClick={() => removeLanguage(idx)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Provider Schedule */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Provider Schedule</Label>
                    <Button
                      type="button"
                      onClick={() => openScheduleDialog(editingProvider?.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Schedule
                    </Button>
                  </div>

                  {getProviderSchedules(editingProvider?.id || "").length >
                  0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {getProviderSchedules(editingProvider?.id || "").map(
                        (schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {getDayName(schedule.dayOfWeek)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(schedule.startTime)} -{" "}
                                  {formatTime(schedule.endTime)}
                                </span>
                              </div>
                              {schedule.breakStartTime &&
                                schedule.breakEndTime && (
                                  <span className="text-xs text-gray-400">
                                    Break: {formatTime(schedule.breakStartTime)}{" "}
                                    - {formatTime(schedule.breakEndTime)}
                                  </span>
                                )}
                              {!schedule.isAvailable && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Unavailable
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                onClick={() =>
                                  openScheduleDialog(
                                    editingProvider?.id,
                                    schedule,
                                  )
                                }
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() =>
                                  handleScheduleDelete(schedule.id)
                                }
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4 border rounded-lg">
                      No schedules added yet. Click &quot;Add Schedule&quot; to
                      create one.
                    </p>
                  )}
                </div>

                {/* Services */}
                <div className="space-y-2">
                  <Label>Services Offered</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.serviceIds.includes(service.id)}
                          onCheckedChange={() => toggleService(service.id)}
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {service.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </StandardizedDialogBody>
            <StandardizedDialogFooter className="px-6 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingProvider
                    ? "Update"
                    : "Create"}
              </Button>
            </StandardizedDialogFooter>
          </form>
        </StandardizedDialogContent>
      </StandardizedDialog>

      {/* Delete Confirmation Dialog */}
      <StandardizedDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <StandardizedDialogContent size="md">
          <StandardizedDialogHeader>
            <StandardizedDialogTitle>Delete Provider</StandardizedDialogTitle>
            <StandardizedDialogDescription>
              Are you sure you want to delete {deletingProvider?.name}? This
              action cannot be undone.
            </StandardizedDialogDescription>
          </StandardizedDialogHeader>
          <StandardizedDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </StandardizedDialogFooter>
        </StandardizedDialogContent>
      </StandardizedDialog>

      {/* Provider Schedule Dialog */}
      <StandardizedDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      >
        <StandardizedDialogContent size="lg">
          <StandardizedDialogHeader>
            <StandardizedDialogTitle>
              {editingSchedule ? "Edit Schedule" : "Add Schedule"}
            </StandardizedDialogTitle>
            <StandardizedDialogDescription>
              {editingSchedule
                ? "Update provider schedule information"
                : "Add a new schedule for the provider"}
            </StandardizedDialogDescription>
          </StandardizedDialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <StandardizedDialogBody>
              <div className="space-y-4">
                {/* Day of Week */}
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Day of Week *</Label>
                  <Select
                    value={scheduleFormData?.dayOfWeek?.toString() || ""}
                    onValueChange={(value) =>
                      updateScheduleFormData("dayOfWeek", parseInt(value))
                    }
                  >
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Slots */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={scheduleFormData?.startTime || ""}
                      onChange={(e) =>
                        updateScheduleFormData("startTime", e.target.value)
                      }
                      required
                      min="00:00"
                      max="23:59"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={scheduleFormData?.endTime || ""}
                      onChange={(e) =>
                        updateScheduleFormData("endTime", e.target.value)
                      }
                      required
                      min="00:00"
                      max="23:59"
                    />
                  </div>
                </div>
                {scheduleFormData?.startTime &&
                  scheduleFormData?.endTime &&
                  scheduleFormData.startTime >= scheduleFormData.endTime && (
                    <p className="text-sm text-red-600">
                      End time must be after start time
                    </p>
                  )}

                {/* Break Time */}
                <div className="space-y-2">
                  <Label>Break Time (Optional)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="breakStartTime">Break Start Time</Label>
                      <Input
                        id="breakStartTime"
                        type="time"
                        value={scheduleFormData?.breakStartTime || ""}
                        onChange={(e) =>
                          updateScheduleFormData(
                            "breakStartTime",
                            e.target.value,
                          )
                        }
                        min={scheduleFormData?.startTime || "00:00"}
                        max={scheduleFormData?.endTime || "23:59"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breakEndTime">Break End Time</Label>
                      <Input
                        id="breakEndTime"
                        type="time"
                        value={scheduleFormData?.breakEndTime || ""}
                        onChange={(e) =>
                          updateScheduleFormData("breakEndTime", e.target.value)
                        }
                        min={scheduleFormData?.startTime || "00:00"}
                        max={scheduleFormData?.endTime || "23:59"}
                      />
                    </div>
                  </div>
                  {scheduleFormData?.breakStartTime &&
                    scheduleFormData?.breakEndTime &&
                    scheduleFormData.breakStartTime >=
                      scheduleFormData.breakEndTime && (
                      <p className="text-sm text-red-600">
                        Break end time must be after break start time
                      </p>
                    )}
                  {scheduleFormData?.breakStartTime &&
                    scheduleFormData?.breakEndTime &&
                    scheduleFormData.startTime &&
                    scheduleFormData.endTime &&
                    (scheduleFormData.breakStartTime <
                      scheduleFormData.startTime ||
                      scheduleFormData.breakEndTime >
                        scheduleFormData.endTime) && (
                      <p className="text-sm text-red-600">
                        Break time must be within working hours
                      </p>
                    )}
                </div>

                {/* Availability */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAvailable"
                    checked={scheduleFormData?.isAvailable || false}
                    onCheckedChange={(checked) =>
                      updateScheduleFormData("isAvailable", checked === true)
                    }
                  />
                  <Label htmlFor="isAvailable" className="cursor-pointer">
                    Available on this day
                  </Label>
                </div>
              </div>
            </StandardizedDialogBody>
            <StandardizedDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingSchedule
                    ? "Update"
                    : "Create"}
              </Button>
            </StandardizedDialogFooter>
          </form>
        </StandardizedDialogContent>
      </StandardizedDialog>
    </div>
  );
}
