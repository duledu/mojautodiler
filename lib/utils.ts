import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Vehicle, VehicleFilters, SortOption, VatMode } from '@/types/vehicle';
import type { TranslationKeys } from '@/lib/i18n';

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

export function formatVatMode(vatMode: VatMode | null | undefined, t?: TranslationKeys): string {
  if (vatMode === 'INCLUDED') return t?.vehicle.vatIncluded ?? 'Cena uključuje PDV';
  if (vatMode === 'EXCLUDED') return t?.vehicle.vatExcluded ?? '+ PDV';
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
    if (filters.dealerId && v.dealerId !== filters.dealerId) return false;
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

const SERBIAN_DIACRITIC_MAP: Record<string, string> = {
  đ: 'dj',
  Đ: 'dj',
  č: 'c',
  Č: 'c',
  ć: 'c',
  Ć: 'c',
  š: 's',
  Š: 's',
  ž: 'z',
  Ž: 'z',
};

/**
 * Generates a deterministic, URL-safe Serbian Latin slug.
 *
 * Preserves existing `slugify()` for legacy vehicle/dealer callers while
 * properly transliterating Serbian Latin diacritics (č, ć, š, ž, đ -> c, c, s, z, dj),
 * normalizing punctuation/dashes, collapsing duplicate hyphens, and stripping
 * unsafe characters.
 */
export function slugifySr(text: string): string {
  if (!text || typeof text !== 'string') return '';

  const transliterated = text
    .replace(/[đĐčČćĆšŠžŽ]/g, (ch) => SERBIAN_DIACRITIC_MAP[ch] ?? ch)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Returns true when the URL points to a Cloudflare R2 public bucket.
 * R2 public endpoints sometimes serve `application/octet-stream` instead
 * of a real image MIME type, which causes the Vercel Image Optimizer to
 * reject the upstream. Callers should set `unoptimized` on next/image.
 */
export function isR2Image(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.r2.dev');
  } catch {
    return url.includes('.r2.dev/');
  }
}

/**
 * Normalizes and validates an image URL from the database.
 * Returns the cleaned URL or null if the URL is invalid/unusable.
 */
export function sanitizeImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return null;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return null;
  try {
    return new URL(trimmed).href;
  } catch {
    try {
      return new URL(trimmed.replace(/ /g, '%20')).href;
    } catch {
      return null;
    }
  }
}
