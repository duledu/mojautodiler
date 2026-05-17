/* eslint-disable @next/next/no-img-element */
/**
 * MarketingCanvas — 1080 × 1920 px Story format.
 *
 * ARCHITECTURE: one premium editorial composition, two palette modes.
 *
 * Light = cream/editorial luxury.  Dark = gunmetal/ink luxury.
 * Both share IDENTICAL layout proportions, hierarchy, and rhythm.
 * Only color palette, photo treatment, and overlay intensity differ.
 *
 * Composition:
 *   Photo zone   top 56 % (1080 px)  — vehicle dominates, minimal overlay
 *   Accent line  3 px separator       — accentColor, full width
 *   Info strip   1083–1840 px         — solid bg, clean editorial hierarchy
 *   Footer       1840–1920 px         — trust strip, always ink
 *
 * Typography hierarchy (single reading path):
 *   1. Brand name    — 38 px, weight 600, muted  (quiet identity marker)
 *   2. Model name    — 88–98 px, weight 900, ink/white  (the visual hero)
 *   3. Spec line     — 16 px, muted  (supporting context)
 *   4. Tagline       — 22 px italic, muted  (editorial voice)
 *   5. Price         — 100 px, weight 900, ACCENT  (conversion anchor)
 *   6. Dealer / QR   — secondary, bottom of strip
 *
 * Design rules:
 *   • No heavy overlays over the vehicle.
 *   • Accent color used ONCE — on the price only.
 *   • No glow, no multi-layer shadows, no fake "cinematic" effects.
 *   • Vehicle must be the strongest visual element.
 *   • Layout adapts to long brand names and long prices via word-break.
 *
 * luxury_catalog variant: photo expands to 63 %, info strip compresses.
 * All <img> tags are intentional — html-to-image requires native img.
 */

import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { formatPrice, formatMileage } from '@/lib/utils';
import type { MarketingTheme, CreativeDirection, CropStrategy } from '@/lib/ai/marketing';

export const MARKETING_W = 1080;
export const MARKETING_H = 1920;

const INK   = '#09090D';
const CREAM = '#F7F5F0';
const FONT  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const FUEL: Record<string, string> = {
  benzin: 'Benzin', dizel: 'Dizel', hibrid: 'Hibrid',
  elektricni: 'Električni', lpg: 'LPG', cng: 'CNG',
};
const GEAR: Record<string, string> = {
  manuelni: 'Manuelni', automatski: 'Automatik', poluautomatski: 'Poluautomat',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarketingVehicleData {
  id:           string;
  slug:         string;
  title:        string;
  brand:        string;
  model:        string;
  generation:   string;
  year:         number;
  mileage:      number;
  price:        number;
  currency:     string;
  fuelType:     string;
  transmission: string;
  color:        string;
  featured:     boolean;
  dealerName:   string;
  dealerPhone:  string;
}

export interface MarketingCanvasProps {
  vehicle:      MarketingVehicleData;
  theme:        MarketingTheme;
  accentColor:  string;
  tagline:      string;
  imageDataUrl: string;
  qrDataUrl:    string;
  listingUrl:   string;
  aiUsed:       boolean;
  creative:     CreativeDirection;
}

// ─── Inline icons ─────────────────────────────────────────────────────────────

const IC = { strokeWidth: '1.5' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
function Ico({ children, sz, c }: { children: React.ReactNode; sz: number; c: string }) {
  return <svg width={sz} height={sz} viewBox="0 0 24 24" stroke={c} {...IC}>{children}</svg>;
}
function IcoGauge({ sz, c }: { sz: number; c: string }) {
  return <Ico sz={sz} c={c}><circle cx="12" cy="12" r="10"/><path d="M12 12L9 7"/><circle cx="12" cy="12" r="1.5" fill={c} stroke="none"/><path d="M6.5 16.5a7 7 0 0 1 11 0"/></Ico>;
}
function IcoFuel({ sz, c }: { sz: number; c: string }) {
  return <Ico sz={sz} c={c}><path d="M3 22V7l5.5-4 5.5 4v15"/><path d="M3 11h11"/><rect x="5" y="14" width="7" height="6" rx="1"/><path d="M14 7h2a2 2 0 0 1 2 2v7.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V8l-4-4"/></Ico>;
}
function IcoGear({ sz, c }: { sz: number; c: string }) {
  return <Ico sz={sz} c={c}><circle cx="12" cy="12" r="3"/><path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32 2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12m11.32-11.32 2.12-2.12"/></Ico>;
}
function IcoCal({ sz, c }: { sz: number; c: string }) {
  return <Ico sz={sz} c={c}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="15" r="1" fill={c} stroke="none"/><circle cx="12" cy="15" r="1" fill={c} stroke="none"/><circle cx="16" cy="15" r="1" fill={c} stroke="none"/></Ico>;
}

// ─── Brand badge ──────────────────────────────────────────────────────────────

function BrandBadge({ ac, dark }: { ac: string; dark: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* Logo square — increased ~22 % for better social readability */}
      <div style={{ width: 40, height: 40, borderRadius: 9, background: ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 900, fontFamily: FONT, lineHeight: 1 }}>M</span>
      </div>
      <div>
        <div style={{ color: dark ? 'rgba(255,255,255,0.88)' : 'rgba(9,9,13,0.82)', fontSize: 13.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: FONT, lineHeight: 1 }}>
          MOJ AUTO DILER
        </div>
        <div style={{ color: dark ? `${ac}A8` : `${ac}C0`, fontSize: 9, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: FONT, marginTop: 4, lineHeight: 1 }}>
          PREMIUM AUTOMARKET
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cropPos(c: CropStrategy): string {
  return { center: 'center 50%', center_low: 'center 60%', center_high: 'center 38%', establish_wide: 'center 50%' }[c] ?? 'center 50%';
}

function photoFilter(t: CreativeDirection['imageTreatment'], dark: boolean): string {
  if (dark) {
    return {
      cinematic_contrast: 'saturate(0.94) contrast(1.08) brightness(0.90)',
      warm_luxury:        'saturate(0.98) contrast(1.05) brightness(0.91) sepia(0.04)',
      clean_editorial:    'saturate(0.96) contrast(1.04) brightness(0.93)',
      premium_showroom:   'saturate(1.00) contrast(1.02) brightness(0.94)',
    }[t] ?? 'saturate(0.94) contrast(1.08) brightness(0.90)';
  }
  return {
    clean_editorial:    'saturate(1.02) contrast(1.03) brightness(1.00)',
    warm_luxury:        'saturate(1.06) contrast(1.02) brightness(1.01) sepia(0.03)',
    premium_showroom:   'saturate(1.04) contrast(1.00) brightness(1.05)',
    cinematic_contrast: 'saturate(0.96) contrast(1.06) brightness(0.96)',
  }[t] ?? 'saturate(1.02) contrast(1.03) brightness(1.00)';
}

function modelFontSize(m: CreativeDirection['typographyMode']): number {
  return { sport_bold: 98, editorial_large: 90, refined_minimal: 80 }[m] ?? 90;
}

// ─── Placeholder (when no image loaded) ──────────────────────────────────────

function PhotoPlaceholder({ ac, dark }: { ac: string; dark: boolean }): CSSProperties {
  return dark
    ? { background: `linear-gradient(145deg, #14151C 0%, #1C1E2A 50%, #14151C 100%)` }
    : { background: `linear-gradient(150deg, ${ac}12 0%, ${CREAM} 55%, ${ac}0A 100%)` };
}

// ─── PREMIUM CANVAS — unified layout ─────────────────────────────────────────

function PremiumCanvas({ vehicle, accentColor: ac, tagline, imageDataUrl, qrDataUrl, listingUrl, aiUsed, creative, dark }: Omit<MarketingCanvasProps, 'theme'> & { dark: boolean }) {
  const W = MARKETING_W;
  const H = MARKETING_H;

  const fuel    = FUEL[vehicle.fuelType]     ?? vehicle.fuelType;
  const gear    = GEAR[vehicle.transmission] ?? vehicle.transmission;
  const bg      = dark ? INK   : CREAM;
  const txtHero = dark ? 'rgba(255,255,255,0.96)' : INK;
  const txtBrand = dark ? 'rgba(255,255,255,0.50)' : 'rgba(9,9,13,0.52)';
  const txtMuted = dark ? 'rgba(255,255,255,0.36)' : 'rgba(9,9,13,0.38)';
  const txtItalic = dark ? 'rgba(255,255,255,0.44)' : 'rgba(9,9,13,0.44)';

  const isLuxCat  = creative.compositionStyle === 'luxury_catalog';
  // Reduced ~11 % from previous heights — more info strip breathing room
  const photoH    = isLuxCat ? 1080 : 960;
  const ACCENT_Y  = photoH;
  const INFO_Y    = photoH + 3;
  const FOOTER_H  = 80;
  const SIDE      = 52;
  const msz       = modelFontSize(creative.typographyMode);
  const filt      = photoFilter(creative.imageTreatment, dark);
  const pos       = cropPos(creative.cropStrategy);

  // Fixed Y anchors within the info strip — consistent editorial rhythm
  const Y_BRAND    = INFO_Y + 36;
  const Y_MODEL    = Y_BRAND + 50;            // 38 px brand + 12 gap
  const Y_SPEC     = Y_MODEL + Math.round(msz * 0.90) + 14; // model visual height + gap
  const Y_TAGLINE  = Y_SPEC + 16 + 12;        // spec line + gap
  const Y_RULE     = Y_TAGLINE + 38;           // tagline slot (renders if exists)
  const Y_PRICE    = Y_RULE + 32;             // rule + gap
  const Y_DEALER   = Y_PRICE + 108 + 44;      // price + gap (100px font ~108px visual)

  const specLine = [vehicle.generation, String(vehicle.year), fuel, gear].filter(Boolean).join('  ·  ');

  const specs = [
    { icon: <IcoGauge sz={28} c={ac} />, v: formatMileage(vehicle.mileage), l: 'Kilometraža' },
    { icon: <IcoFuel  sz={28} c={ac} />, v: fuel,                           l: 'Gorivo'      },
    { icon: <IcoGear  sz={28} c={ac} />, v: gear,                           l: 'Menjač'      },
    { icon: <IcoCal   sz={28} c={ac} />, v: `${vehicle.year}.`,             l: 'Godište'     },
  ];

  return (
    <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden', backgroundColor: bg, fontFamily: FONT, WebkitFontSmoothing: 'antialiased' }}>

      {/* ════ PHOTO ZONE ══════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: photoH,
        overflow: 'hidden',
        // Light: rounded card bottom. Dark: seamless into ink strip.
        borderRadius: dark ? 0 : '0 0 44px 44px',
        boxShadow: dark ? 'none' : '0 24px 64px rgba(9,9,13,0.18)',
      }}>
        {imageDataUrl
          ? <img src={imageDataUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: filt }} />
          : <div style={{ position: 'absolute', inset: 0, ...PhotoPlaceholder({ ac, dark }) }} />
        }

        {/*
          Overlays are MINIMAL. The vehicle must stay visible.
          Top: just enough for badge legibility.
          Bottom: subtle blend toward info strip background.
          NO side vignettes — car body must breathe edge to edge.
        */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 160,
          background: `linear-gradient(to bottom, rgba(0,0,0,${dark ? '0.38' : '0.26'}) 0%, rgba(0,0,0,0) 100%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: dark
            ? 'linear-gradient(to bottom, rgba(9,9,13,0) 0%, rgba(9,9,13,0.22) 100%)'
            : 'linear-gradient(to bottom, rgba(247,245,240,0) 0%, rgba(247,245,240,0.18) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Brand badge — top-left, within safe area */}
        <div style={{ position: 'absolute', top: 72, left: SIDE, right: SIDE, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandBadge ac={ac} dark />
          {aiUsed && (
            <div style={{ background: 'rgba(0,0,0,0.40)', borderRadius: 100, padding: '5px 12px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <span style={{ color: 'rgba(255,255,255,0.68)', fontSize: 8, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase' }}>AI</span>
            </div>
          )}
        </div>

        {/* Featured pill — bottom-left, inside safe area */}
        {vehicle.featured && (
          <div style={{ position: 'absolute', bottom: dark ? 36 : 52, left: SIDE, background: ac, borderRadius: 100, padding: '10px 22px' }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>IZDVOJENO</span>
          </div>
        )}
      </div>

      {/* ════ ACCENT SEPARATOR ════════════════════════════════════════════════ */}
      {/* 3 px full-width line — clean visual break between photo and info */}
      <div style={{ position: 'absolute', top: ACCENT_Y, left: 0, right: 0, height: 3, background: ac, opacity: 0.80 }} />

      {/* ════ INFO STRIP ══════════════════════════════════════════════════════ */}
      {/* Solid color — no gradient. The photo does the work above the line. */}
      <div style={{ position: 'absolute', top: INFO_Y, left: 0, right: 0, bottom: FOOTER_H, background: bg }} />

      {/* — Brand (small, quiet) — sets identity without competing with model */}
      <div style={{ position: 'absolute', top: Y_BRAND, left: SIDE, right: SIDE }}>
        <div style={{ fontSize: 36, fontWeight: 600, color: txtBrand, letterSpacing: '0.20em', textTransform: 'uppercase', lineHeight: 1 }}>
          {vehicle.brand.toUpperCase()}
        </div>
      </div>

      {/* — Model (large, ink/white) — the info zone's visual hero */}
      <div style={{ position: 'absolute', top: Y_MODEL, left: SIDE, right: SIDE }}>
        <div style={{ fontSize: msz, fontWeight: 900, color: txtHero, lineHeight: 0.88, letterSpacing: '-0.018em', textTransform: 'uppercase', wordBreak: 'break-word' }}>
          {vehicle.model.toUpperCase()}
        </div>
      </div>

      {/* — Spec line — slightly larger for Instagram Story readability */}
      <div style={{ position: 'absolute', top: Y_SPEC, left: SIDE, right: SIDE }}>
        <div style={{ fontSize: 19, fontWeight: 500, color: txtMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {specLine}
        </div>
      </div>

      {/* — Tagline (optional, italic, editorial voice) */}
      {tagline && (
        <div style={{ position: 'absolute', top: Y_TAGLINE, left: SIDE, right: SIDE }}>
          <div style={{ fontSize: 25, fontWeight: 300, fontStyle: 'italic', color: txtItalic, lineHeight: 1.34 }}>
            {tagline}
          </div>
        </div>
      )}

      {/* — Short accent rule — marks the section break before price */}
      <div style={{ position: 'absolute', top: Y_RULE, left: SIDE, width: 52, height: 2, background: ac, borderRadius: 1 }} />

      {/* — Price (accent color ONLY — this is its one use) */}
      <div style={{ position: 'absolute', top: Y_PRICE, left: SIDE }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: `${ac}C0`, letterSpacing: '0.30em', textTransform: 'uppercase', marginBottom: 8 }}>
          CENA
        </div>
        <div style={{ fontSize: 100, fontWeight: 900, color: ac, letterSpacing: '-0.020em', lineHeight: 1 }}>
          {formatPrice(vehicle.price, vehicle.currency)}
        </div>
      </div>

      {/* — Dealer + QR — anchored just below price */}
      <div style={{ position: 'absolute', top: Y_DEALER, left: SIDE, right: SIDE, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: txtHero, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {vehicle.dealerName}
          </div>
          {/* Phone — conversion element, increased to 26px for readability */}
          {vehicle.dealerPhone && (
            <div style={{ fontSize: 26, fontWeight: 500, color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(9,9,13,0.68)', letterSpacing: '0.02em' }}>
              {vehicle.dealerPhone}
            </div>
          )}
          <div style={{ fontSize: 13, fontWeight: 400, color: `${ac}80`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
            {listingUrl}
          </div>
        </div>
        {qrDataUrl && (
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: '#fff', padding: 11, borderRadius: 11,
              boxShadow: `0 6px 20px rgba(0,0,0,${dark ? '0.32' : '0.12'}), 0 0 0 1px ${ac}28`,
            }}>
              <img src={qrDataUrl} alt="QR" style={{ width: 148, height: 148, display: 'block' }} />
            </div>
            <div style={{ color: txtMuted, fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center' }}>
              SKENIRAJ
            </div>
          </div>
        )}
      </div>

      {/* ════ SPECS ROW — rendered inside info strip only for luxury_catalog ══ */}
      {isLuxCat && (
        <div style={{
          position: 'absolute', top: Y_DEALER + 200, left: SIDE, right: SIDE,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(9,9,13,0.07)'}`,
          paddingTop: 24,
        }}>
          {specs.map((s, i) => (
            <div key={s.l} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingRight: i < 3 ? 12 : 0, borderRight: i < 3 ? `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(9,9,13,0.07)'}` : 'none' }}>
              {s.icon}
              <div style={{ color: txtHero, fontSize: 20, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1.1 }}>{s.v}</div>
              <div style={{ color: txtMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* ════ FOOTER ══════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: FOOTER_H,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
        background: INK,
        borderTop: `1px solid ${ac}16`,
      }}>
        {['PROVERENA VOZILA', 'PROFESIONALNA PROVERA', 'SIGURNA KUPOVINA', 'PODRŠKA KUPCU'].map((item, i) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {i > 0 && <span style={{ display: 'inline-block', width: 1, height: 10, background: `${ac}32` }} />}
            <span style={{ color: 'rgba(255,255,255,0.34)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const MarketingCanvas = forwardRef<HTMLDivElement, MarketingCanvasProps>(
  function MarketingCanvas(props, ref) {
    return (
      <div ref={ref}>
        <PremiumCanvas {...props} dark={props.theme === 'dark'} />
      </div>
    );
  },
);
