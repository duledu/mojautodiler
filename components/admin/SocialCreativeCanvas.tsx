import { forwardRef } from 'react';
import { Vehicle } from '@/types/vehicle';
import { formatPrice, formatMileage } from '@/lib/utils';
import { VehiclePhotoLayer } from '@/components/admin/VehiclePhotoLayer';

// ── Premium inline location pin ───────────────────────────────────────────────
// Thin-stroke teardrop with inner dot — no emoji, no generic Google Maps pin.
// Inline SVG so html-to-image captures it perfectly at any canvas resolution.
function LocationPinIcon({ size, color }: { readonly size: number; readonly color: string }) {
  const w = Math.round(size * 0.67);
  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 8 12"
      fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M4 0.75C1.93 0.75 0.25 2.43 0.25 4.5C0.25 7.62 4 11.25 4 11.25C4 11.25 7.75 7.62 7.75 4.5C7.75 2.43 6.07 0.75 4 0.75Z"
        stroke={color}
        strokeWidth="0.85"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="4" cy="4.5" r="1.25" fill={color} />
    </svg>
  );
}

export type CreativeFormat = 'story' | 'square' | 'portrait';

export const CREATIVE_DIMS: Record<CreativeFormat, { w: number; h: number }> = {
  story:    { w: 1080, h: 1920 },
  square:   { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
};

const GOLD_LIGHT = '#F2D57A';
const INK = '#08090D';
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const FUEL_LABELS: Record<string, string> = {
  benzin: 'Benzin',
  dizel: 'Dizel',
  hibrid: 'Hibrid',
  elektricni: 'Elektricni',
  lpg: 'LPG',
  cng: 'CNG',
};

const GEAR_LABELS: Record<string, string> = {
  manuelni: 'Manuelni',
  automatski: 'Automatik',
  poluautomatski: 'Poluautomat',
};

function sc(format: CreativeFormat) {
  const h = CREATIVE_DIMS[format].h;
  const r = h / 1920;
  const min = Math.max(r, 0.62);

  return {
    topPad:      Math.round(56 * Math.max(r, 0.72)),
    sideH:       Math.round(64 * Math.max(r, 0.8)),
    bottomPad:   Math.round(62 * min),
    gap:         Math.round(24 * min),
    badge:       Math.round(13 * Math.max(r, 0.78)),
    badgePadV:   Math.round(11 * Math.max(r, 0.78)),
    badgePadH:   Math.round(22 * Math.max(r, 0.78)),
    title:       Math.round(76 * Math.max(r, 0.58)),
    titleSub:    Math.round(48 * Math.max(r, 0.58)),
    price:       Math.round(92 * Math.max(r, 0.56)),
    priceLabel:  Math.round(17 * Math.max(r, 0.68)),
    spec:        Math.round(26 * min),
    specPadV:    Math.round(10 * min),
    specPadH:    Math.round(20 * min),
    dealer:      Math.round(28 * min),
    url:         Math.round(21 * min),
    cta:         Math.round(22 * min),
    line:        Math.max(2, Math.round(3 * r)),
    qr:          Math.round(148 * Math.max(r, 0.68)),
    panelPad:    Math.round(28 * min),
  };
}

function splitTitle(title: string) {
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 2) return { headline: title, subline: '' };

  return {
    headline: parts.slice(0, 2).join(' '),
    subline: parts.slice(2).join(' '),
  };
}

export interface SocialCreativeCanvasProps {
  vehicle: Vehicle;
  format: CreativeFormat;
  imageDataUrl: string;
  qrDataUrl: string;
  dealerName: string;
  dealerPhone: string;
  dealerLocation?: string;
  listingUrl: string;
  /** Optional brand logo data URL — renders as circular icon beside "MOJ AUTO DILER" badge.
   *  Pass as a pre-loaded data URL so html-to-image never needs to fetch it. */
  brandLogoUrl?: string;
}

export const SocialCreativeCanvas = forwardRef<HTMLDivElement, SocialCreativeCanvasProps>(
  function SocialCreativeCanvas(
    { vehicle, format, imageDataUrl, qrDataUrl, dealerName, dealerPhone, dealerLocation, listingUrl, brandLogoUrl },
    ref,
  ) {
    const { w, h } = CREATIVE_DIMS[format];
    const s = sc(format);
    const title = splitTitle(vehicle.title);
    const isCompact = format === 'square';

    const specs = [
      `${vehicle.year}.`,
      formatMileage(vehicle.mileage),
      FUEL_LABELS[vehicle.fuelType] ?? vehicle.fuelType,
      GEAR_LABELS[vehicle.transmission] ?? vehicle.transmission,
    ];

    return (
      <div
        ref={ref}
        style={{
          position: 'relative',
          width: w,
          height: h,
          overflow: 'hidden',
          backgroundColor: INK,
          fontFamily: FONT,
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {imageDataUrl && (
          <VehiclePhotoLayer
            src={imageDataUrl}
            width={w}
            height={h}
            posY={0.36}
            filter="saturate(1.08) contrast(1.08) brightness(0.92)"
          />
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: [
              'linear-gradient(to bottom, rgba(8,9,13,0.34) 0%, rgba(255,255,255,0.08) 13%, rgba(8,9,13,0.00) 34%, rgba(8,9,13,0.28) 52%, rgba(8,9,13,0.86) 73%, rgba(8,9,13,0.98) 100%)',
              'radial-gradient(ellipse at 50% 36%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 22%, rgba(255,255,255,0.00) 48%)',
              'radial-gradient(ellipse at 50% 57%, rgba(201,168,76,0.20) 0%, rgba(201,168,76,0.06) 24%, rgba(201,168,76,0.00) 52%)',
              'radial-gradient(circle at 6% 78%, rgba(242,213,122,0.20), rgba(242,213,122,0.00) 28%)',
              'radial-gradient(circle at 93% 18%, rgba(255,255,255,0.12), rgba(255,255,255,0.00) 23%)',
            ].join(','),
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: [
              'linear-gradient(116deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.10) 28%, rgba(255,255,255,0.00) 39%)',
              'linear-gradient(292deg, rgba(201,168,76,0.00) 0%, rgba(201,168,76,0.12) 23%, rgba(201,168,76,0.00) 34%)',
              'radial-gradient(ellipse at 50% 103%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.00) 40%)',
            ].join(','),
            opacity: 0.78,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 150px rgba(0,0,0,0.62), inset 0 -220px 190px rgba(0,0,0,0.58)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            backgroundImage: [
              'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.34) 0 1px, transparent 1.5px)',
              'radial-gradient(circle at 72% 42%, rgba(255,255,255,0.22) 0 1px, transparent 1.5px)',
              'radial-gradient(circle at 35% 78%, rgba(0,0,0,0.34) 0 1px, transparent 1.5px)',
            ].join(','),
            backgroundSize: '19px 23px, 29px 31px, 17px 19px',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: s.topPad,
            left: s.sideH,
            right: s.sideH,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: Math.round(s.gap * 0.8),
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: brandLogoUrl ? Math.round(s.badgePadH * 0.7) : 0,
              // No backdropFilter — html-to-image cannot render it and produces glitched
              // rasterisation. Higher-opacity solid gradient gives the same frosted look.
              background: 'linear-gradient(135deg, rgba(8,9,13,0.72), rgba(255,255,255,0.08) 42%, rgba(201,168,76,0.10))',
              border: '1.5px solid rgba(242,213,122,0.45)',
              borderRadius: 100,
              padding: `${s.badgePadV}px ${s.badgePadH}px`,
              boxShadow: '0 14px 44px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.20)',
            }}
          >
            {brandLogoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandLogoUrl}
                alt=""
                style={{
                  width:        Math.round(s.badge * 2.4),
                  height:       Math.round(s.badge * 2.4),
                  borderRadius: '50%',
                  display:      'block',
                  flexShrink:   0,
                  objectFit:    'cover',
                }}
              />
            )}
            <span
              style={{
                color: GOLD_LIGHT,
                fontSize: s.badge,
                fontWeight: 900,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                fontFamily: FONT,
                textShadow: '0 1px 0 rgba(255,255,255,0.16), 0 10px 22px rgba(0,0,0,0.38)',
              }}
            >
              MOJ AUTO DILER
            </span>
          </div>

          {vehicle.featured && (
            <div
              style={{
                background: 'linear-gradient(135deg, #F2D57A, #B89132)',
                borderRadius: 100,
                padding: `${s.badgePadV}px ${s.badgePadH}px`,
                color: '#11100C',
                fontSize: s.badge,
                fontWeight: 900,
                letterSpacing: '0.17em',
                textTransform: 'uppercase',
                fontFamily: FONT,
                boxShadow: '0 18px 42px rgba(0,0,0,0.30), 0 0 30px rgba(201,168,76,0.20)',
              }}
            >
              IZDVOJENO
            </div>
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingLeft: s.sideH,
            paddingRight: s.sideH,
            paddingBottom: s.bottomPad,
            display: 'flex',
            flexDirection: 'column',
            gap: Math.round(s.gap * 0.85),
          }}
        >
          <div
            style={{
              width: Math.round(88 * Math.max(h / 1920, 0.72)),
              height: s.line,
              background: 'linear-gradient(90deg, #F2D57A, #B89132, rgba(201,168,76,0.00))',
              borderRadius: 2,
              boxShadow: '0 0 24px rgba(201,168,76,0.36)',
            }}
          />

          <div>
            <div
              style={{
                fontSize: s.title,
                fontWeight: 900,
                color: 'rgba(255,255,255,0.95)',
                lineHeight: 0.98,
                letterSpacing: '0.015em',
                fontFamily: FONT,
                wordBreak: 'break-word',
                textTransform: 'uppercase',
                textShadow: '0 18px 46px rgba(0,0,0,0.56)',
              }}
            >
              {title.headline}
            </div>
            {title.subline && (
              <div
                style={{
                  marginTop: Math.round(s.gap * 0.22),
                  fontSize: s.titleSub,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.05,
                  letterSpacing: '0.08em',
                  fontFamily: FONT,
                  textTransform: 'uppercase',
                  textShadow: '0 14px 38px rgba(0,0,0,0.54)',
                }}
              >
                {title.subline}
              </div>
            )}
            {vehicle.generation && (
              <div
                style={{
                  marginTop: Math.round(s.gap * 0.34),
                  fontSize: Math.round(s.spec * 1.05),
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.54)',
                  letterSpacing: '0.16em',
                  fontFamily: FONT,
                  textTransform: 'uppercase',
                }}
              >
                {vehicle.generation}
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                marginBottom: Math.round(s.gap * 0.18),
                fontSize: s.priceLabel,
                fontWeight: 900,
                color: 'rgba(242,213,122,0.78)',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                fontFamily: FONT,
              }}
            >
              Premium ponuda
            </div>
            <div
              style={{
                fontSize: s.price,
                fontWeight: 900,
                color: GOLD_LIGHT,
                letterSpacing: '-0.015em',
                lineHeight: 0.96,
                fontFamily: FONT,
                textShadow: '0 0 18px rgba(201,168,76,0.32), 0 18px 46px rgba(0,0,0,0.58)',
              }}
            >
              {formatPrice(vehicle.price, vehicle.currency)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: Math.round(10 * Math.max(h / 1920, 0.72)), flexWrap: 'wrap' }}>
            {specs.map((spec) => (
              <div
                key={spec}
                style={{
                  // No backdropFilter — causes glitched rasterisation in html-to-image.
                  // Slightly higher background opacity achieves the same frosted-pill look.
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.10))',
                  border: '1px solid rgba(255,255,255,0.28)',
                  borderRadius: 999,
                  padding: `${s.specPadV}px ${s.specPadH}px`,
                  fontSize: s.spec,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.92)',
                  fontFamily: FONT,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.035em',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)',
                }}
              >
                {spec}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: Math.round(24 * Math.max(h / 1920, 0.68)),
              padding: s.panelPad,
              borderRadius: isCompact ? 24 : 34,
              // No backdropFilter — html-to-image cannot render it (causes blurred/glitched export).
              // Solid dark base at high opacity replaces the frosted-glass look without artifacts.
              background: 'linear-gradient(135deg, rgba(8,9,13,0.88), rgba(18,20,26,0.86) 52%, rgba(22,18,6,0.84))',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 22px 70px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.14)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: Math.round(s.gap * 0.42),
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: Math.round(w * 0.48),
                  height: 1,
                  background: 'linear-gradient(90deg, rgba(242,213,122,0.72), rgba(255,255,255,0.16), rgba(255,255,255,0))',
                }}
              />
              <div
                style={{
                  fontSize: s.dealer,
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.92)',
                  fontFamily: FONT,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: '0.035em',
                  textTransform: 'uppercase',
                }}
              >
                {dealerName}
              </div>

              {/* Dealer location — dynamic city, hidden when absent */}
              {dealerLocation && (
                <div
                  style={{
                    display:     'flex',
                    alignItems:  'center',
                    gap:         Math.round(s.url * 0.32),
                    marginTop:   Math.round(s.gap * -0.1), // tighten gap slightly — location belongs with name
                  }}
                >
                  <LocationPinIcon
                    size={Math.round(s.url * 0.88)}
                    color="rgba(242,213,122,0.58)"
                  />
                  <span
                    style={{
                      fontSize:       Math.round(s.url * 0.86),
                      fontWeight:     600,
                      color:          'rgba(242,213,122,0.60)',
                      fontFamily:     FONT,
                      letterSpacing:  '0.06em',
                      textTransform:  'uppercase',
                      overflow:       'hidden',
                      textOverflow:   'ellipsis',
                      whiteSpace:     'nowrap',
                    }}
                  >
                    {dealerLocation}
                  </span>
                </div>
              )}

              {dealerPhone && (
                <div
                  style={{
                    fontSize: Math.round(s.dealer * 0.9),
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.64)',
                    fontFamily: FONT,
                  }}
                >
                  {dealerPhone}
                </div>
              )}
              <div
                style={{
                  fontSize: s.url,
                  fontWeight: 700,
                  color: 'rgba(242,213,122,0.72)',
                  letterSpacing: '0.03em',
                  fontFamily: FONT,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {listingUrl}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: Math.round(s.cta * 0.45),
                  width: 'fit-content',
                  marginTop: Math.round(s.gap * 0.08),
                  padding: `${Math.round(s.cta * 0.45)}px ${Math.round(s.cta * 0.9)}px`,
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, rgba(242,213,122,0.96), rgba(184,145,50,0.96))',
                  color: '#11100C',
                  fontSize: s.cta,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: FONT,
                  boxShadow: '0 14px 38px rgba(0,0,0,0.28)',
                }}
              >
                Pogledaj vozilo
                <span style={{ fontSize: Math.round(s.cta * 1.1), lineHeight: 1 }}>{'>'}</span>
              </div>
            </div>

            {qrDataUrl && (
              <div
                style={{
                  // Solid white — no semi-transparency so QR modules are always
                  // maximum contrast against a clean white background.
                  background: '#FFFFFF',
                  // Generous quiet zone: QR spec requires ≥4 modules; padding
                  // of 14 % of display size gives ~20 px at story resolution.
                  padding: Math.round(s.qr * 0.14),
                  borderRadius: 18,
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.72)',
                  boxShadow: '0 18px 42px rgba(0,0,0,0.34), 0 0 0 1px rgba(201,168,76,0.18)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="QR"
                  style={{ width: s.qr, height: s.qr, display: 'block' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
