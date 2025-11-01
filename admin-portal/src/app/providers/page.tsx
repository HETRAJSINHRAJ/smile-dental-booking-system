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
import {  Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, User, X } from "lucide-react";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  getServices,
} from "@/lib/firebase/firestore";
import type { Provider, Service } from "@/types/firebase";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    imageUrl: "",
    specialization: "",
    specialty: "",
    serviceIds: [] as string[],
    yearsOfExperience: 0,
    rating: 5.0,
    totalReviews: 0,
    education: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
    acceptingNewPatients: true,
  });

  // Temp input states for arrays
  const [newEducation, setNewEducation] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

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
      specialization: "",
      specialty: "",
      serviceIds: [],
      yearsOfExperience: 0,
      rating: 5.0,
      totalReviews: 0,
      education: [],
      certifications: [],
      languages: [],
      acceptingNewPatients: true,
    });
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
      specialization: provider.specialization || "",
      specialty: provider.specialty || "",
      serviceIds: provider.serviceIds || [],
      yearsOfExperience: provider.yearsOfExperience || 0,
      rating: provider.rating || 5.0,
      totalReviews: provider.totalReviews || 0,
      education: provider.education || [],
      certifications: provider.certifications || [],
      languages: provider.languages || [],
      acceptingNewPatients: provider.acceptingNewPatients ?? true,
    });
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
      if (editingProvider) {
        await updateProvider(editingProvider.id, formData);
        toast.success("Provider updated successfully");
      } else {
        await createProvider(formData);
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
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  }

  // Array management functions
  const addEducation = () => {
    if (newEducation.trim()) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, newEducation.trim()]
      }));
      setNewEducation("");
    }
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
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
                          <span className="text-xs text-green-600">Accepting patients</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{provider.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {provider.specialty || provider.specialization || "N/A"}
                  </TableCell>
                  <TableCell>
                    {provider.rating ? (
                      <span className="text-sm">
                        ⭐ {provider.rating.toFixed(1)} ({provider.totalReviews || 0})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{provider.yearsOfExperience} years</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {provider.serviceIds?.length || 0} services
                    </span>
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
        <StandardizedDialogContent size="3xl" className="max-h-[90vh] overflow-hidden flex flex-col p-0">
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
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <StandardizedDialogBody className="overflow-y-auto flex-1 px-6 py-4">
              <div className="grid gap-4">
              {/* Provider Image */}
              <div className="space-y-2">
                <Label>Provider Photo</Label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
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
                      setFormData({ ...formData, specialty: e.target.value, specialization: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })
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
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
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
                      setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })
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
                      setFormData({ ...formData, totalReviews: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.acceptingNewPatients}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, acceptingNewPatients: checked === true })
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
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEducation())}
                  />
                  <Button type="button" onClick={addEducation} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.education.map((edu, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                      <span>{edu}</span>
                      <button type="button" onClick={() => removeEducation(idx)}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Board Certified Orthodontist"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                      <span>{cert}</span>
                      <button type="button" onClick={() => removeCertification(idx)}>
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
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  />
                  <Button type="button" onClick={addLanguage} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.languages.map((lang, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                      <span>{lang}</span>
                      <button type="button" onClick={() => removeLanguage(idx)}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="space-y-2">
                <Label>Services Offered</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
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
                {submitting ? "Saving..." : editingProvider ? "Update" : "Create"}
              </Button>
            </StandardizedDialogFooter>
          </form>
        </StandardizedDialogContent>
      </StandardizedDialog>

      {/* Delete Confirmation Dialog */}
      <StandardizedDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <StandardizedDialogContent size="md">
          <StandardizedDialogHeader>
            <StandardizedDialogTitle>Delete Provider</StandardizedDialogTitle>
            <StandardizedDialogDescription>
              Are you sure you want to delete {deletingProvider?.name}? This action
              cannot be undone.
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
    </div>
  );
}