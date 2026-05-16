export type FuelType = 'benzin' | 'dizel' | 'hibrid' | 'elektricni' | 'lpg' | 'cng';
export type TransmissionType = 'manuelni' | 'automatski' | 'poluautomatski';
export type DrivetrainType = 'prednji' | 'zadnji' | '4x4' | 'awd';
export type BodyType = 'limuzina' | 'hatchback' | 'karavan' | 'suv' | 'kupe' | 'kabriolet' | 'van' | 'pickup';
export type VehicleStatus = 'active' | 'sold' | 'hidden' | 'draft';
export type DealerStatus = 'active' | 'hidden';
export type VehicleCondition = 'novo' | 'polovno' | 'uvoz';
export type Currency = 'EUR' | 'RSD' | 'USD';
export type VatMode = 'INCLUDED' | 'EXCLUDED' | 'NONE';

export interface Dealer {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  phone: string;
  viber?: string;
  instagram?: string;
  facebook?: string;
  location: string;
  address?: string;
  description?: string;
  workingHours?: string;
  isVerified: boolean;
  status: DealerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface VehicleVideo {
  id: string;
  url: string;
  type: 'youtube' | 'vimeo' | 'direct';
  thumbnail?: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  generation?: string;
  year: number;
  mileage: number;
  price: number;
  currency: Currency;
  vatMode: VatMode;
  fuelType: FuelType;
  transmission: TransmissionType;
  drivetrain: DrivetrainType;
  bodyType: BodyType;
  engineSize?: number;
  horsepower?: number;
  kilowatts?: number;
  doors: number;
  seats: number;
  color: string;
  interiorColor?: string;
  vin?: string;
  registration?: string;
  origin?: string;
  condition: VehicleCondition;
  description: string;
  equipment: string[];
  safetyFeatures: string[];
  features: string[];
  images: VehicleImage[];
  videos?: VehicleVideo[];
  status: VehicleStatus;
  featured?: boolean;
  tags?: string[];
  dealerNotes?: string;
  dealerId?: string;
  dealer?: Dealer;
  contactPhone?: string;
  contactViber?: string;
  contactName?: string;
  seoSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFilters {
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  bodyType?: BodyType;
  dealerId?: string;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';
