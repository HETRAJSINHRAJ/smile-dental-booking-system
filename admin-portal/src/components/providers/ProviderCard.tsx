"use client";

import React, { memo, useMemo } from "react";
import { User, Star, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Provider, Service } from "@/types/shared";

interface ProviderCardProps {
  provider: Provider;
  services?: Service[];
  onEdit?: (provider: Provider) => void;
  onDelete?: (provider: Provider) => void;
  showActions?: boolean;
}

/**
 * Memoized provider card component for optimized list rendering
 */
export const ProviderCard = memo(function ProviderCard({
  provider,
  services = [],
  onEdit,
  onDelete,
  showActions = true,
}: ProviderCardProps) {
  // Memoize service names
  const serviceNames = useMemo(() => {
    if (!provider.serviceIds || provider.serviceIds.length === 0) return [];
    return provider.serviceIds
      .slice(0, 2)
      .map((serviceId) => {
        const service = services.find((s) => s.id === serviceId);
        return service?.name;
      })
      .filter(Boolean);
  }, [provider.serviceIds, services]);

  // Memoize rating display
  const ratingDisplay = useMemo(() => {
    if (!provider.rating) return null;
    return `${provider.rating.toFixed(1)} (${provider.totalReviews || 0})`;
  }, [provider.rating, provider.totalReviews]);

  // Memoize star rating
  const stars = useMemo(() => {
    const rating = provider.rating || 0;
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= Math.round(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  }, [provider.rating]);

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          {provider.imageUrl ? (
            <Image
              src={provider.imageUrl}
              alt={provider.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold truncate">{provider.name}</h3>
              <p className="text-sm text-muted-foreground">{provider.title}</p>
            </div>
            {showActions && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(provider)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(provider)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {provider.specialty && (
            <p className="text-sm text-muted-foreground mt-1">
              {provider.specialty}
            </p>
          )}

          {ratingDisplay && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">{stars}</div>
              <span className="text-sm text-muted-foreground">{ratingDisplay}</span>
            </div>
          )}

          {provider.yearsOfExperience && (
            <p className="text-xs text-muted-foreground mt-1">
              {provider.yearsOfExperience} years experience
            </p>
          )}

          {serviceNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {serviceNames.map((name, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {name}
                </span>
              ))}
              {provider.serviceIds && provider.serviceIds.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{provider.serviceIds.length - 2} more
                </span>
              )}
            </div>
          )}

          {provider.acceptingNewPatients && (
            <span className="inline-block text-xs text-green-600 mt-2">
              Accepting new patients
            </span>
          )}
        </div>
      </div>
    </Card>
  );
});

// Display name for debugging
ProviderCard.displayName = "ProviderCard";
