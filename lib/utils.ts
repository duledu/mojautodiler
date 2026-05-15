import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Vehicle, VehicleFilters, SortOption, VatMode } from '@/types/vehicle';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = 'EUR'): string {
  if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
  }
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(price);
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat('de-DE').format(km) + ' km';
}

export function formatVatMode(vatMode: VatMode | null | undefined): string {
  if (vatMode === 'INCLUDED') return 'Cena uključuje PDV';
  if (vatMode === 'EXCLUDED') return '+ PDV';
  return '';
}

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  return vehicles.filter(v => {
    if (filters.brand && v.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
    if (filters.model && !v.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
    if (filters.yearFrom && v.year < filters.yearFrom) return false;
    if (filters.yearTo && v.year > filters.yearTo) return false;
    if (filters.priceFrom && v.price < filters.priceFrom) return false;
    if (filters.priceTo && v.price > filters.priceTo) return false;
    if (filters.mileageTo && v.mileage > filters.mileageTo) return false;
    if (filters.fuelType && v.fuelType !== filters.fuelType) return false;
    if (filters.transmission && v.transmission !== filters.transmission) return false;
    if (filters.bodyType && v.bodyType !== filters.bodyType) return false;
    return true;
  });
}

export function sortVehicles(vehicles: Vehicle[], sort: SortOption): Vehicle[] {
  const sorted = [...vehicles];
  switch (sort) {
    case 'newest': return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'price_asc': return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc': return sorted.sort((a, b) => b.price - a.price);
    case 'year_desc': return sorted.sort((a, b) => b.year - a.year);
    case 'mileage_asc': return sorted.sort((a, b) => a.mileage - b.mileage);
    default: return sorted;
  }
}

export function getUniqueBrands(vehicles: Vehicle[]): string[] {
  return [...new Set(vehicles.map(v => v.brand))].sort();
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
