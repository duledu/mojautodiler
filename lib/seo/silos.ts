import { SITE_URL, normalizeSiteUrl } from '@/lib/site-url';
import type { Vehicle } from '@/types/vehicle';

export type BrandSiloSlug =
  | 'bmw'
  | 'audi'
  | 'volkswagen'
  | 'mercedes-benz'
  | 'skoda'
  | 'porsche'
  | 'tesla'
  | 'land-rover'
  | 'opel';
export type ModelSiloSlug = 'golf-8' | 'golf-7' | 'golf-6' | 'tiguan' | 'octavia' | 'audi-a6' | 'audi-a4' | 'bmw-x5' | 'bmw-x3' | 'bmw-serija-5';

export interface BrandSiloRef {
  readonly slug: BrandSiloSlug;
  readonly displayName: string;
  readonly dbName: string;
}

export interface ModelSiloRef {
  readonly slug: ModelSiloSlug;
  readonly brandSlug: BrandSiloSlug;
  readonly displayName: string;
  readonly brandDisplay: string;
  readonly dbBrand: string;
  readonly fullName: string;
  /** Exact case-insensitive `Vehicle.model` values matched on `/sr/model/[slug]`. */
  readonly categoryAliases: readonly string[];
  /** Contextual word-boundary aliases used for vehicle breadcrumbs and blog silo matching. */
  readonly aliases: readonly string[];
}

export interface CategoryVehicleCandidate {
  readonly brand: string;
  readonly model: string;
  readonly status?: string;
}

export interface ActiveCategorySilos {
  readonly brandSlugs: ReadonlySet<BrandSiloSlug>;
  readonly modelSlugs: ReadonlySet<ModelSiloSlug>;
  readonly brands: readonly BrandSiloRef[];
  readonly models: readonly ModelSiloRef[];
}

export interface BreadcrumbEntry {
  readonly name: string;
  readonly href: string;
  readonly url: string;
}

export const MODEL_CATEGORY_ALIASES: Record<ModelSiloSlug, readonly string[]> = {
  'bmw-x5': ['X5', 'X5 xDrive30d', 'G05', 'F15'],
  'bmw-x3': ['X3'],
  'bmw-serija-5': [
    'Serija 5',
    '520d',
    '520d xDrive',
    '530d',
    '530d xDrive',
    '530',
    '520',
    '525',
    '525d',
    '535',
    '535d',
    '540',
    '540d',
    '540i',
    '550',
    '550i',
    'M5',
    'G30',
    'G31',
    'F10',
    'F11',
  ],
  'audi-a6': ['A6', 'A6 45 TFSI', 'C8', 'C7'],
  'audi-a4': ['A4'],
  'golf-8': ['Golf 8', 'Golf VIII', 'Golf GTI', 'Mk8'],
  'golf-7': ['Golf 7', 'Golf VII'],
  'golf-6': ['Golf 6', 'Golf VI'],
  tiguan: ['Tiguan'],
  octavia: ['Octavia'],
};

export const BRAND_SILOS: readonly BrandSiloRef[] = [
  { slug: 'bmw', displayName: 'BMW', dbName: 'BMW' },
  { slug: 'audi', displayName: 'Audi', dbName: 'Audi' },
  { slug: 'volkswagen', displayName: 'Volkswagen', dbName: 'Volkswagen' },
  { slug: 'mercedes-benz', displayName: 'Mercedes-Benz', dbName: 'Mercedes-Benz' },
  { slug: 'skoda', displayName: 'Škoda', dbName: 'Škoda' },
  { slug: 'porsche', displayName: 'Porsche', dbName: 'Porsche' },
  { slug: 'tesla', displayName: 'Tesla', dbName: 'Tesla' },
  { slug: 'land-rover', displayName: 'Land Rover', dbName: 'Land Rover' },
  { slug: 'opel', displayName: 'Opel', dbName: 'Opel' },
] as const;

export const MODEL_SILOS: readonly ModelSiloRef[] = [
  {
    slug: 'bmw-x5',
    brandSlug: 'bmw',
    displayName: 'X5',
    brandDisplay: 'BMW',
    dbBrand: 'BMW',
    fullName: 'BMW X5',
    categoryAliases: MODEL_CATEGORY_ALIASES['bmw-x5'],
    aliases: ['X5', 'X5 xDrive30d', 'G05'],
  },
  {
    slug: 'bmw-x3',
    brandSlug: 'bmw',
    displayName: 'X3',
    brandDisplay: 'BMW',
    dbBrand: 'BMW',
    fullName: 'BMW X3',
    categoryAliases: MODEL_CATEGORY_ALIASES['bmw-x3'],
    aliases: ['X3'],
  },
  {
    slug: 'bmw-serija-5',
    brandSlug: 'bmw',
    displayName: 'Serija 5',
    brandDisplay: 'BMW',
    dbBrand: 'BMW',
    fullName: 'BMW Serija 5',
    categoryAliases: MODEL_CATEGORY_ALIASES['bmw-serija-5'],
    aliases: MODEL_CATEGORY_ALIASES['bmw-serija-5'],
  },
  {
    slug: 'audi-a6',
    brandSlug: 'audi',
    displayName: 'A6',
    brandDisplay: 'Audi',
    dbBrand: 'Audi',
    fullName: 'Audi A6',
    categoryAliases: MODEL_CATEGORY_ALIASES['audi-a6'],
    aliases: ['A6', 'A6 45 TFSI', 'C8'],
  },
  {
    slug: 'audi-a4',
    brandSlug: 'audi',
    displayName: 'A4',
    brandDisplay: 'Audi',
    dbBrand: 'Audi',
    fullName: 'Audi A4',
    categoryAliases: MODEL_CATEGORY_ALIASES['audi-a4'],
    aliases: ['A4'],
  },
  {
    slug: 'golf-8',
    brandSlug: 'volkswagen',
    displayName: 'Golf 8',
    brandDisplay: 'Volkswagen',
    dbBrand: 'Volkswagen',
    fullName: 'Volkswagen Golf 8',
    categoryAliases: MODEL_CATEGORY_ALIASES['golf-8'],
    aliases: ['Golf 8', 'Golf VIII', 'Golf GTI', 'Mk8'],
  },
  {
    slug: 'golf-7',
    brandSlug: 'volkswagen',
    displayName: 'Golf 7',
    brandDisplay: 'Volkswagen',
    dbBrand: 'Volkswagen',
    fullName: 'Volkswagen Golf 7',
    categoryAliases: MODEL_CATEGORY_ALIASES['golf-7'],
    aliases: ['Golf 7', 'Golf VII', 'Golf Mk7', 'Golf 7.5'],
  },
  {
    slug: 'golf-6',
    brandSlug: 'volkswagen',
    displayName: 'Golf 6',
    brandDisplay: 'Volkswagen',
    dbBrand: 'Volkswagen',
    fullName: 'Volkswagen Golf 6',
    categoryAliases: MODEL_CATEGORY_ALIASES['golf-6'],
    aliases: ['Golf 6', 'Golf VI', 'Golf Mk6'],
  },
  {
    slug: 'tiguan',
    brandSlug: 'volkswagen',
    displayName: 'Tiguan',
    brandDisplay: 'Volkswagen',
    dbBrand: 'Volkswagen',
    fullName: 'Volkswagen Tiguan',
    categoryAliases: MODEL_CATEGORY_ALIASES.tiguan,
    aliases: ['Tiguan'],
  },
  {
    slug: 'octavia',
    brandSlug: 'skoda',
    displayName: 'Octavia',
    brandDisplay: 'Škoda',
    dbBrand: 'Škoda',
    fullName: 'Škoda Octavia',
    categoryAliases: MODEL_CATEGORY_ALIASES.octavia,
    aliases: ['Octavia', 'Octavia RS', 'Mk4'],
  },
] as const;

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getBrandSiloBySlug(slug: string): BrandSiloRef | null {
  return BRAND_SILOS.find((b) => b.slug === slug) ?? null;
}

export function getModelsForBrand(
  brandSlug: BrandSiloSlug,
  activeModelSlugs?: ReadonlySet<ModelSiloSlug>,
): readonly ModelSiloRef[] {
  return MODEL_SILOS.filter(
    (m) => m.brandSlug === brandSlug && (!activeModelSlugs || activeModelSlugs.has(m.slug)),
  );
}

function isActiveCategoryStatus(status: string | undefined): boolean {
  if (status === undefined) return true;
  return status === 'AVAILABLE' || status === 'active';
}

/**
 * Mirrors `getVehiclesByBrand(def.dbName)` on `/sr/cars/[brand]`:
 * exact case-insensitive match on `Vehicle.brand`.
 */
export function doesVehicleMatchBrandCategory(
  vehicle: Pick<CategoryVehicleCandidate, 'brand' | 'status'>,
  brand: BrandSiloRef,
): boolean {
  if (!isActiveCategoryStatus(vehicle.status)) return false;
  return (vehicle.brand ?? '').toLowerCase() === brand.dbName.toLowerCase();
}

/**
 * Mirrors `getVehiclesByModel(def.dbBrand, def.modelAliases)` on `/sr/model/[slug]`:
 * exact case-insensitive match on `Vehicle.brand` + any `categoryAliases` entry on `Vehicle.model`.
 */
export function doesVehicleMatchModelCategory(
  vehicle: Pick<CategoryVehicleCandidate, 'brand' | 'model' | 'status'>,
  model: ModelSiloRef,
): boolean {
  if (!isActiveCategoryStatus(vehicle.status)) return false;
  if ((vehicle.brand ?? '').toLowerCase() !== model.dbBrand.toLowerCase()) return false;
  const candidateModel = (vehicle.model ?? '').toLowerCase();
  return model.categoryAliases.some((alias) => alias.toLowerCase() === candidateModel);
}

/**
 * Computes which registered brand and model categories currently have at least one
 * publicly available active vehicle (`AVAILABLE` / `'active'`), preserving registry order.
 * Sold, hidden, and draft/unpublished vehicles are excluded.
 */
export function computeActiveCategorySilos(
  vehicles: readonly CategoryVehicleCandidate[],
): ActiveCategorySilos {
  const brandSlugs = new Set<BrandSiloSlug>();
  const modelSlugs = new Set<ModelSiloSlug>();

  for (const vehicle of vehicles) {
    if (!isActiveCategoryStatus(vehicle.status)) continue;

    for (const brand of BRAND_SILOS) {
      if (!brandSlugs.has(brand.slug) && doesVehicleMatchBrandCategory(vehicle, brand)) {
        brandSlugs.add(brand.slug);
      }
    }

    for (const model of MODEL_SILOS) {
      if (!modelSlugs.has(model.slug) && doesVehicleMatchModelCategory(vehicle, model)) {
        modelSlugs.add(model.slug);
      }
    }
  }

  return {
    brandSlugs,
    modelSlugs,
    brands: BRAND_SILOS.filter((b) => brandSlugs.has(b.slug)),
    models: MODEL_SILOS.filter((m) => modelSlugs.has(m.slug)),
  };
}

/**
 * Fail-open fallback returning all registered brand and model silos.
 * Used only when reading active inventory fails, so transient query errors are never
 * mistaken for an empty inventory state.
 */
export function getAllRegisteredCategorySilos(): ActiveCategorySilos {
  return {
    brandSlugs: new Set<BrandSiloSlug>(BRAND_SILOS.map((b) => b.slug)),
    modelSlugs: new Set<ModelSiloSlug>(MODEL_SILOS.map((m) => m.slug)),
    brands: BRAND_SILOS,
    models: MODEL_SILOS,
  };
}

/**
 * Resolves an existing brand silo page for a vehicle, or null if no brand page exists
 * (never emit dead links for unregistered brands).
 */
export function resolveBrandSiloForVehicle(
  vehicle: Pick<Vehicle, 'brand'>,
): BrandSiloRef | null {
  const normalized = normalizeText(vehicle.brand);
  if (!normalized) return null;

  for (const brand of BRAND_SILOS) {
    if (
      normalizeText(brand.dbName) === normalized ||
      normalizeText(brand.displayName) === normalized ||
      (brand.slug === 'volkswagen' && normalized === 'vw') ||
      (brand.slug === 'mercedes-benz' && normalized === 'mercedes')
    ) {
      return brand;
    }
  }
  return null;
}

/**
 * Resolves an existing model silo page for a vehicle, or null if no model page exists.
 * Uses word-boundary matching on brand + model/title so unrelated models never false-match.
 */
export function resolveModelSiloForVehicle(
  vehicle: Pick<Vehicle, 'brand' | 'model' | 'title'>,
): ModelSiloRef | null {
  const brandSilo = resolveBrandSiloForVehicle(vehicle);
  if (!brandSilo) return null;

  const modelText = normalizeText(vehicle.model || '');
  const titleText = normalizeText(vehicle.title || '');
  const candidates = getModelsForBrand(brandSilo.slug);

  for (const candidate of candidates) {
    for (const alias of candidate.aliases) {
      const normalizedAlias = normalizeText(alias);
      const escaped = normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i');
      if (regex.test(modelText) || regex.test(titleText)) {
        return candidate;
      }
    }
  }
  return null;
}

export function getBreadcrumbLabels(locale: string): {
  readonly home: string;
  readonly inventory: string;
} {
  return locale === 'sq'
    ? { home: 'Kryefaqja', inventory: 'Oferta' }
    : { home: 'Početna', inventory: 'Ponuda' };
}

/**
 * Builds the canonical breadcrumb trail for a vehicle detail page:
 *   Početna > Ponuda > [Marka] > [Model] > Vozilo
 * Skips Marka and/or Model if no corresponding silo page exists.
 * Used identically by both visual breadcrumbs and BreadcrumbList JSON-LD.
 */
export function buildVehicleBreadcrumbs(
  vehicle: Pick<Vehicle, 'slug' | 'title' | 'brand' | 'model'>,
  locale: string,
  siteUrl: string = SITE_URL,
): readonly BreadcrumbEntry[] {
  const baseUrl = normalizeSiteUrl(siteUrl);
  const loc = locale === 'sq' ? 'sq' : 'sr';
  const labels = getBreadcrumbLabels(loc);
  const brandSilo = resolveBrandSiloForVehicle(vehicle);
  const modelSilo = resolveModelSiloForVehicle(vehicle);
  const encodedSlug = encodeURIComponent(vehicle.slug);

  const items: BreadcrumbEntry[] = [
    { name: labels.home, href: `/${loc}`, url: `${baseUrl}/${loc}` },
    { name: labels.inventory, href: `/${loc}/inventory`, url: `${baseUrl}/${loc}/inventory` },
  ];

  if (brandSilo) {
    const href = `/${loc}/cars/${brandSilo.slug}`;
    items.push({ name: brandSilo.displayName, href, url: `${baseUrl}${href}` });
  }

  if (modelSilo) {
    const href = `/${loc}/model/${modelSilo.slug}`;
    items.push({ name: modelSilo.displayName, href, url: `${baseUrl}${href}` });
  }

  const vehicleHref = `/${loc}/vehicle/${encodedSlug}`;
  items.push({ name: vehicle.title, href: vehicleHref, url: `${baseUrl}${vehicleHref}` });

  return items;
}

/**
 * Resolves relevant existing brand and model silo pages for a published blog article
 * based on its related vehicles, title, and excerpt.
 */
export function resolveSiloLinksForBlogPost(post: {
  readonly title: string;
  readonly excerpt: string;
  readonly relatedVehicles?: readonly Pick<Vehicle, 'brand' | 'model' | 'title'>[];
}): {
  readonly brands: readonly BrandSiloRef[];
  readonly models: readonly ModelSiloRef[];
} {
  const brandMap = new Map<BrandSiloSlug, BrandSiloRef>();
  const modelMap = new Map<ModelSiloSlug, ModelSiloRef>();

  for (const v of post.relatedVehicles ?? []) {
    const b = resolveBrandSiloForVehicle(v);
    if (b) brandMap.set(b.slug, b);
    const m = resolveModelSiloForVehicle(v);
    if (m) modelMap.set(m.slug, m);
  }

  const text = normalizeText(`${post.title} ${post.excerpt}`);
  for (const brand of BRAND_SILOS) {
    const key = normalizeText(brand.displayName);
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i');
    if (regex.test(text) || (brand.slug === 'volkswagen' && /\bvw\b/i.test(text))) {
      brandMap.set(brand.slug, brand);
    }
  }
  for (const model of MODEL_SILOS) {
    for (const alias of model.aliases) {
      const normalizedAlias = normalizeText(alias);
      const escaped = normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i');
      if (regex.test(text)) {
        modelMap.set(model.slug, model);
        const parentBrand = getBrandSiloBySlug(model.brandSlug);
        if (parentBrand) brandMap.set(parentBrand.slug, parentBrand);
      }
    }
  }

  return {
    brands: Array.from(brandMap.values()),
    models: Array.from(modelMap.values()),
  };
}
