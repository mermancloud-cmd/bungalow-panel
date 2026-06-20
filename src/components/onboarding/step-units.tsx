"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  Users,
  Home,
  ChevronDown,
  ChevronUp,
  TurkishLira,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { UnitData } from "@/lib/onboarding/types";
import { AMENITIES_LIST } from "@/lib/onboarding/types";

interface StepUnitsProps {
  data: UnitData[];
  onChange: (data: UnitData[]) => void;
}

function createEmptyUnit(): UnitData {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    capacity: 2,
    basePrice: 0,
    weekendPrice: 0,
    amenities: [],
  };
}

export function StepUnits({ data, onChange }: StepUnitsProps) {
  const [expandedUnit, setExpandedUnit] = React.useState<string | null>(
    data[0]?.id ?? null
  );

  function updateUnit(unitId: string, field: keyof UnitData, value: unknown) {
    const updated = data.map((u) =>
      u.id === unitId ? { ...u, [field]: value } : u
    );
    onChange(updated);
  }

  function toggleAmenity(unitId: string, amenityId: string) {
    const updated = data.map((u) => {
      if (u.id !== unitId) return u;
      const has = u.amenities.includes(amenityId);
      return {
        ...u,
        amenities: has
          ? u.amenities.filter((a) => a !== amenityId)
          : [...u.amenities, amenityId],
      };
    });
    onChange(updated);
  }

  function addUnit() {
    const newUnit = createEmptyUnit();
    onChange([...data, newUnit]);
    setExpandedUnit(newUnit.id);
  }

  function removeUnit(unitId: string) {
    if (data.length <= 1) return;
    const filtered = data.filter((u) => u.id !== unitId);
    onChange(filtered);
    if (expandedUnit === unitId) {
      setExpandedUnit(filtered[0]?.id ?? null);
    }
  }

  function incrementCapacity(unitId: string) {
    const unit = data.find((u) => u.id === unitId);
    if (unit && unit.capacity < 20) {
      updateUnit(unitId, "capacity", unit.capacity + 1);
    }
  }

  function decrementCapacity(unitId: string) {
    const unit = data.find((u) => u.id === unitId);
    if (unit && unit.capacity > 1) {
      updateUnit(unitId, "capacity", unit.capacity - 1);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Konaklama Birimleri</h3>
        <p className="text-xs text-muted-foreground">
          İşletmenize ait bungalov / oda birimlerini ekleyin. Her birim için
          kapasite, fiyat ve olanak bilgilerini girin.
        </p>
      </div>

      <div className="space-y-3">
        {data.map((unit, index) => {
          const isExpanded = expandedUnit === unit.id;
          const hasName = unit.name.trim().length > 0;

          return (
            <Card
              key={unit.id}
              size="sm"
              className={cn(
                "transition-all",
                isExpanded && "ring-1 ring-primary/30"
              )}
            >
              {/* Collapsible header */}
              <button
                type="button"
                onClick={() =>
                  setExpandedUnit(isExpanded ? null : unit.id)
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      hasName ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    <Home
                      className={cn(
                        "size-4",
                        hasName
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {hasName ? unit.name : `Birim ${index + 1}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {unit.capacity} kişi · {unit.basePrice > 0 ? `₺${unit.basePrice.toLocaleString("tr-TR")}` : "Fiyat girilmedi"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {data.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUnit(unit.id);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <>
                  <Separator />
                  <CardContent className="space-y-4 pt-0">
                    {/* Unit name */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`unit-name-${unit.id}`}>
                        Birim Adı *
                      </Label>
                      <Input
                        id={`unit-name-${unit.id}`}
                        placeholder="örn: Deluxe Bungalov A1"
                        value={unit.name}
                        onChange={(e) =>
                          updateUnit(unit.id, "name", e.target.value)
                        }
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`unit-desc-${unit.id}`}>
                        Açıklama
                      </Label>
                      <Input
                        id={`unit-desc-${unit.id}`}
                        placeholder="Kısa bir açıklama..."
                        value={unit.description}
                        onChange={(e) =>
                          updateUnit(unit.id, "description", e.target.value)
                        }
                      />
                    </div>

                    {/* Capacity number selector */}
                    <div className="space-y-1.5">
                      <Label>Kapasite (Kişi)</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => decrementCapacity(unit.id)}
                          disabled={unit.capacity <= 1}
                        >
                          -
                        </Button>
                        <div className="flex items-center gap-2 rounded-lg border border-input px-3 py-1.5 min-w-[80px] justify-center">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {unit.capacity}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => incrementCapacity(unit.id)}
                          disabled={unit.capacity >= 20}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`unit-base-${unit.id}`}>
                          <div className="flex items-center gap-1">
                            <TurkishLira className="size-3" />
                            Gece Ücreti
                          </div>
                        </Label>
                        <Input
                          id={`unit-base-${unit.id}`}
                          type="number"
                          min={0}
                          placeholder="0"
                          value={unit.basePrice || ""}
                          onChange={(e) =>
                            updateUnit(
                              unit.id,
                              "basePrice",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`unit-weekend-${unit.id}`}>
                          <div className="flex items-center gap-1">
                            <TurkishLira className="size-3" />
                            Hafta Sonu
                          </div>
                        </Label>
                        <Input
                          id={`unit-weekend-${unit.id}`}
                          type="number"
                          min={0}
                          placeholder="0"
                          value={unit.weekendPrice || ""}
                          onChange={(e) =>
                            updateUnit(
                              unit.id,
                              "weekendPrice",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Amenities checkbox grid */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Olanaklar</Label>
                        <Badge variant="outline" className="text-[10px]">
                          {unit.amenities.length} seçili
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {AMENITIES_LIST.map((amenity) => {
                          const isChecked = unit.amenities.includes(
                            amenity.id
                          );
                          return (
                            <label
                              key={amenity.id}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs cursor-pointer transition-colors",
                                isChecked
                                  ? "bg-primary/5 text-foreground"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() =>
                                  toggleAmenity(unit.id, amenity.id)
                                }
                              />
                              <span className="truncate">{amenity.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add unit button */}
      <Button
        variant="outline"
        className="w-full border-dashed"
        size="lg"
        onClick={addUnit}
      >
        <Plus className="size-4" />
        Yeni Birim Ekle
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        {data.length} birim eklendi. Daha sonra da birim ekleyip
        çıkarabilirsiniz.
      </p>
    </div>
  );
}
