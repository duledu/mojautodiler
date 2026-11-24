import type { Vehicle, VehicleStatus } from '@/types/vehicle';

export const CARVERTICAL_BASE_URL =
  'https://www.carvertical.deal/4FCPMH4/JRZRQN/' as const;

export const CARVERTICAL_SOURCE_ID = 'AFF' as const;
export const CARVERTICAL_PARTNER_SUB1 = 'mojautodiler' as const;
export const CARVERTICAL_PRECHECK_UID = '594' as const;

export const CARVERTICAL_DISCOUNT_PERCENT = 20 as const;

export const CARVERTICAL_AFFILIATE_REL =
  'nofollow sponsored noopener noreferrer' as const;
export const CARVERTICAL_AFFILIATE_TARGET = '_blank' as const;

export const CARVERTICAL_ASSETS = {
  logoPrimary: '/carvertical/carvertical-logo-primary.svg',
  logoBlack: '/carvertical/carvertical-logo-black.svg',
  logoWhite: '/carvertical/carvertical-logo-white.svg',
  homepageBannerRs: '/carVertical asset/RS_728x180-4.png',
  footerBannerRs: '/carVertical asset/RS_728x180.png',
  listingBannerRs: '/carVertical asset/RS_336x280-5.png',
  dealersBannerRs: '/carVertical asset/RS/RS_300x250-4.png',
  dealersLeaderboardRs: '/carVertical asset/RS/RS_728x90.png',
  reportOverviewMockup: '/carvertical/carvertical-report-overview-mockup.webp',
  reportPhotosMockup: '/carvertical/carvertical-report-photos-mockup.webp',
  mileageCardRs: '/carvertical/carvertical-provera-kilometraze-card.webp',
  wideBannerRs: '/carvertical/carvertical-istorija-vozila-banner.webp',
} as const;

export type CarVerticalPlacement = 'homepage' | 'footer' | 'listing' | 'dealers';

export const CARVERTICAL_DEALERS_SLUG = 'carvertical-za-dilere' as const;

export function getCarVerticalDealersPagePath(locale: string = 'sr'): string {
  const safeLocale = locale === 'sq' ? 'sq' : 'sr';
  return `/${safeLocale}/${CARVERTICAL_DEALERS_SLUG}`;
}

/**
 * Standard ISO 3779 17-character VIN pattern:
 * Uppercase alphanumeric characters A-Z and 0-9, excluding I, O, and Q.
 */
const ISO_VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

/**
 * Rejects repeated single-character placeholders like "XXXXXXXXXXXXXXXXX" or "00000000000000000"
 * as well as obvious test/placeholder tokens.
 */
const REPEATED_CHAR_VIN_REGEX = /^([A-HJ-NPR-Z0-9])\1{16}$/;
const PLACEHOLDER_SUBSTRINGS = ['XXXXXXXX', 'PLACEHOLDER', 'TESTVIN', 'SAMPLEVIN'];

/**
 * Validates and normalizes a raw VIN value.
 * Returns the uppercase 17-character VIN if valid, or `null` otherwise.
 */
export function normalizeAndValidateVin(
  rawVin: string | null | undefined,
): string | null {
  if (typeof rawVin !== 'string') return null;

  const normalized = rawVin.trim().toUpperCase();
  if (normalized.length !== 17) return null;
  if (!ISO_VIN_REGEX.test(normalized)) return null;
  if (REPEATED_CHAR_VIN_REGEX.test(normalized)) return null;

  for (const token of PLACEHOLDER_SUBSTRINGS) {
    if (normalized.includes(token)) return null;
  }

  return normalized;
}

/**
 * Checks whether a vehicle status is publicly accessible on MojAutoDiler.
 * Prevents exposing VINs from draft ('draft' / RESERVED) or hidden ('hidden' / HIDDEN) records.
 */
export function canExposeVehicleVinInAffiliateLink(
  status?: VehicleStatus | null,
): boolean {
  if (!status) return true;
  return status === 'active' || status === 'sold';
}

/**
 * Safely constructs a carVertical affiliate URL with deterministic, deduplicated query parameters.
 */
function buildCarVerticalUrlWithParams(
  entries: ReadonlyArray<readonly [string, string]>,
): string {
  const url = new URL(CARVERTICAL_BASE_URL);
  const seenKeys = new Set<string>();

  for (const [key, value] of entries) {
    if (seenKeys.has(key)) {
      url.searchParams.set(key, value);
    } else {
      seenKeys.add(key);
      url.searchParams.append(key, value);
    }
  }

  return url.toString();
}

/**
 * Official Homepage affiliate URL:
 * https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=homepage
 */
export function getCarVerticalHomepageUrl(): string {
  return buildCarVerticalUrlWithParams([
    ['source_id', CARVERTICAL_SOURCE_ID],
    ['sub1', CARVERTICAL_PARTNER_SUB1],
    ['sub2', 'homepage'],
  ]);
}

/**
 * Official Footer affiliate URL:
 * https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=footer
 */
export function getCarVerticalFooterUrl(): string {
  return buildCarVerticalUrlWithParams([
    ['source_id', CARVERTICAL_SOURCE_ID],
    ['sub1', CARVERTICAL_PARTNER_SUB1],
    ['sub2', 'footer'],
  ]);
}

/**
 * Official Vehicle Listing WITHOUT VIN affiliate URL:
 * https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing
 */
export function getCarVerticalListingNoVinUrl(): string {
  return buildCarVerticalUrlWithParams([
    ['source_id', CARVERTICAL_SOURCE_ID],
    ['sub1', CARVERTICAL_PARTNER_SUB1],
    ['sub2', 'listing'],
  ]);
}

/**
 * Official Sellers & Dealerships affiliate URL:
 * https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=dealers
 */
export function getCarVerticalDealersUrl(): string {
  return buildCarVerticalUrlWithParams([
    ['source_id', CARVERTICAL_SOURCE_ID],
    ['sub1', CARVERTICAL_PARTNER_SUB1],
    ['sub2', 'dealers'],
  ]);
}

/**
 * Resolves the Vehicle Listing affiliate URL based on VIN validity and vehicle visibility:
 * - Valid 17-char VIN (on a publicly visible vehicle):
 *   https://www.carvertical.deal/4FCPMH4/JRZRQN/?uid=594&source_id=AFF&sub1=mojautodiler&sub2=listing&sub3=<VIN>
 * - Missing, invalid, or restricted VIN:
 *   https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing
 */
export function getCarVerticalListingUrl(
  rawVin?: string | null,
  options?: {
    readonly status?: VehicleStatus | null;
    readonly carVerticalVinMode?: 'WITH_VIN' | 'NO_VIN' | null;
  },
): {
  readonly url: string;
  readonly hasValidVin: boolean;
  readonly normalizedVin: string | null;
} {
  // If the admin has set carVerticalVinMode to 'NO_VIN', or hasn't explicitly set 'WITH_VIN',
  // we must never transmit the VIN, ensuring safe default and strict toggle enforcement.
  if (options?.carVerticalVinMode !== 'WITH_VIN') {
    return {
      url: getCarVerticalListingNoVinUrl(),
      hasValidVin: false,
      normalizedVin: null,
    };
  }

  if (!canExposeVehicleVinInAffiliateLink(options?.status)) {
    return {
      url: getCarVerticalListingNoVinUrl(),
      hasValidVin: false,
      normalizedVin: null,
    };
  }

  const validVin = normalizeAndValidateVin(rawVin);
  if (!validVin) {
    return {
      url: getCarVerticalListingNoVinUrl(),
      hasValidVin: false,
      normalizedVin: null,
    };
  }

  const url = buildCarVerticalUrlWithParams([
    ['uid', CARVERTICAL_PRECHECK_UID],
    ['source_id', CARVERTICAL_SOURCE_ID],
    ['sub1', CARVERTICAL_PARTNER_SUB1],
    ['sub2', 'listing'],
    ['sub3', validVin],
  ]);

  return {
    url,
    hasValidVin: true,
    normalizedVin: validVin,
  };
}

/**
 * Convenience helper accepting a partial Vehicle object.
 */
export function getCarVerticalVehicleListingLink(
  vehicle: Pick<Vehicle, 'vin'> & {
    readonly status?: VehicleStatus | null;
    readonly carVerticalVinMode?: Vehicle['carVerticalVinMode'];
  },
): {
  readonly url: string;
  readonly hasValidVin: boolean;
  readonly normalizedVin: string | null;
} {
  return getCarVerticalListingUrl(vehicle.vin, {
    status: vehicle.status,
    carVerticalVinMode: vehicle.carVerticalVinMode,
  });
}

export const CARVERTICAL_URLS = {
  homepage: getCarVerticalHomepageUrl(),
  footer: getCarVerticalFooterUrl(),
  listingNoVin: getCarVerticalListingNoVinUrl(),
  dealers: getCarVerticalDealersUrl(),
} as const;
