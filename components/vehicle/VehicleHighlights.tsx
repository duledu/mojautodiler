import type { Vehicle } from '@/types/vehicle';
import { getTranslations, type Locale } from '@/lib/i18n';

// ─── keyword → chip detection ────────────────────────────────────────────────

interface ChipDef {
  key: keyof ReturnType<typeof getTranslations>['vehicleHighlights']['equipmentChips'];
  keywords: string[];
}

const EQUIPMENT_CHIPS: ChipDef[] = [
  { key: 'nav',      keywords: ['navigaci', 'gps', 'navi'] },
  { key: 'panorama', keywords: ['panorama', 'moonroof', 'sunroof', 'krovni'] },
  { key: 'leather',  keywords: ['koža', 'kožna', 'kožne', 'leather', 'koze'] },
  { key: 'service',  keywords: ['servisna', 'service knjiga', 'service book'] },
  { key: 'camera',   keywords: ['kamera', 'camera', 'parking kam'] },
  { key: 'sensors',  keywords: ['senzori', 'park senz', 'parking senz', 'ultrasonic'] },
  { key: 'led',      keywords: ['xenon', 'led svetla', 'full led', 'bi-xenon', 'led faro'] },
  { key: 'heated',   keywords: ['grejanje', 'grejana', 'heated seat', 'zagrev'] },
  { key: 'ac',       keywords: ['klima', 'klimatiz', 'aircondition', 'climate control'] },
  { key: 'alloy',    keywords: ['alu felge', 'aluminijum', 'alloy wheel', '17"', '18"', '19"'] },
  { key: 'cruise',   keywords: ['tempomat', 'cruise control'] },
];

function matchesKeyword(text: string, keywords: string[]): boolean {
  const t = text.toLowerCase();
  return keywords.some((k) => t.includes(k));
}

function detectEquipmentChips(vehicle: Vehicle, locale: Locale, max: number): string[] {
  const all = [...vehicle.equipment, ...vehicle.features, ...vehicle.safetyFeatures];
  const labels = getTranslations(locale).vehicleHighlights.equipmentChips;
  const found: string[] = [];
  for (const chip of EQUIPMENT_CHIPS) {
    if (found.length >= max) break;
    if (all.some((item) => matchesKeyword(item, chip.keywords))) {
      found.push(labels[chip.key]);
    }
  }
  return found;
}

// ─── Fuel abbreviation ───────────────────────────────────────────────────────

function fuelAbbrev(fuelType: Vehicle['fuelType'], locale: Locale): string {
  return getTranslations(locale).vehicleHighlights.fuel[fuelType] ?? fuelType;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  readonly vehicle: Vehicle;
  readonly locale:  Locale;
}

/**
 * Compact horizontally-scrollable chip row that lets mobile visitors instantly
 * scan the vehicle's key attributes without reading the full spec table.
 * Only shows chips that can be derived from real vehicle data — no guesses.
 */
export default function VehicleHighlights({ vehicle, locale }: Props) {
  const chips: string[] = [];
  const copy = getTranslations(locale).vehicleHighlights;

  // Engine + fuel
  if (vehicle.engineSize) {
    const litres = (vehicle.engineSize / 1000).toFixed(1);
    chips.push(`${litres}L ${fuelAbbrev(vehicle.fuelType, locale)}`);
  } else {
    chips.push(fuelAbbrev(vehicle.fuelType, locale));
  }

  // Power
  if (vehicle.horsepower) {
    chips.push(`${vehicle.horsepower} KS`);
  }

  // Transmission
  chips.push(copy.transmission[vehicle.transmission]);

  // Import origin
  if (vehicle.origin && vehicle.origin.trim()) {
    chips.push(vehicle.origin.trim());
  }

  // Low mileage signal
  if (vehicle.mileage < 100000) {
    chips.push(copy.lowMileage);
  }

  // Gallery richness
  if (vehicle.images.length >= 10) {
    chips.push(copy.photoCount.replace('{count}', String(vehicle.images.length)));
  }

  // Top equipment (up to 4 detected from keywords)
  const eqChips = detectEquipmentChips(vehicle, locale, 4);
  chips.push(...eqChips);

  if (chips.length === 0) return null;

  return (
    <div className="scrollbar-none -mx-3 overflow-x-auto px-3 min-[390px]:-mx-4 min-[390px]:px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex shrink-0 items-center rounded-full border border-(--color-border) bg-white px-3 py-1.5 text-xs font-semibold text-(--color-text-2) shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
