// Shared types for the onboarding wizard flow

export type BusinessType = "bungalow" | "hotel" | "pension" | "apartment";

export type Currency = "TRY" | "EUR" | "USD";

export interface BusinessInfoData {
  businessName: string;
  businessType: BusinessType;
  address: string;
  city: string;
  phone: string;
  email: string;
}

export interface WhatsAppData {
  phoneNumber: string;
  instanceName: string;
  connectionTested: boolean;
}

export interface UnitData {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  weekendPrice: number;
  amenities: string[];
}

export interface PricingData {
  currency: Currency;
  depositPercentage: number;
  cancellationPolicy: string;
  minimumStayNights: number;
  checkInTime: string;
  checkOutTime: string;
}

export interface OnboardingData {
  business: BusinessInfoData;
  whatsapp: WhatsAppData;
  units: UnitData[];
  pricing: PricingData;
}

export const AMENITIES_LIST = [
  { id: "wifi", label: "WiFi" },
  { id: "ac", label: "Klima" },
  { id: "tv", label: "TV" },
  { id: "kitchen", label: "Mutfak" },
  { id: "parking", label: "Otopark" },
  { id: "pool", label: "Havuz" },
  { id: "bbq", label: "Mangal" },
  { id: "garden", label: "Bahçe" },
  { id: "sea-view", label: "Deniz Manzarası" },
  { id: "forest-view", label: "Orman Manzarası" },
  { id: "fireplace", label: "Şömine" },
  { id: "jacuzzi", label: "Jakuzi" },
  { id: "washing-machine", label: "Çamaşır Makinesi" },
  { id: "iron", label: "Ütü" },
  { id: "hair-dryer", label: "Saç Kurutma" },
  { id: "safe-box", label: "Kasa" },
  { id: "pet-friendly", label: "Evcil Hayvan" },
  { id: "baby-cot", label: "Bebek Yatağı" },
] as const;

export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  business: {
    businessName: "",
    businessType: "bungalow",
    address: "",
    city: "",
    phone: "",
    email: "",
  },
  whatsapp: {
    phoneNumber: "",
    instanceName: "",
    connectionTested: false,
  },
  units: [
    {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      capacity: 2,
      basePrice: 0,
      weekendPrice: 0,
      amenities: [],
    },
  ],
  pricing: {
    currency: "TRY",
    depositPercentage: 30,
    cancellationPolicy: "",
    minimumStayNights: 1,
    checkInTime: "14:00",
    checkOutTime: "11:00",
  },
};
