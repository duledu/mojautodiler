/**
 * AI Marketing Creative Direction Provider
 *
 * Architecture: AI = art director, Canvas = production render engine.
 *
 * The AI outputs creative direction only — it never generates layout code.
 * Handcrafted compositions in MarketingCanvas.tsx interpret the direction
 * and render the final output at 1080×1920px.
 *
 * Phase 1 crop intelligence: AI outputs cropStrategy + overlayStrength
 * which map to objectPosition and vignette opacity in the canvas.
 * No ML segmentation required — heuristics + AI judgment handles it.
 */

// ─── Public types ─────────────────────────────────────────────────────────────

export type MarketingTheme     = 'dark' | 'light';
export type CompositionStyle   = 'cinematic_full_bleed' | 'editorial_split' | 'luxury_catalog' | 'social_feed_bold';
export type TypographyMode     = 'editorial_large' | 'sport_bold' | 'refined_minimal';
export type ImageTreatment     = 'cinematic_contrast' | 'clean_editorial' | 'warm_luxury' | 'premium_showroom';
export type InformationDensity = 'minimal' | 'balanced' | 'detailed';
export type PanelStyle         = 'glass_dark' | 'cream_editorial' | 'floating_luxury' | 'no_panel_editorial';
export type LightingMood       = 'dramatic' | 'warm' | 'clean' | 'studio';
export type FocalStrategy      = 'vehicle_first' | 'price_anchor' | 'brand_editorial';
export type CtaStyle           = 'prominent' | 'subtle' | 'minimal';
/** Drives objectPosition: which part of the vehicle photo to show */
export type CropStrategy       = 'center' | 'center_low' | 'center_high' | 'establish_wide';

export interface CreativeDirection {
  compositionStyle:   CompositionStyle;
  typographyMode:     TypographyMode;
  imageTreatment:     ImageTreatment;
  informationDensity: InformationDensity;
  panelStyle:         PanelStyle;
  lightingMood:       LightingMood;
  focalStrategy:      FocalStrategy;
  ctaStyle:           CtaStyle;
  /** 0.10–0.48: how opaque the vignette/dark overlay sits over the vehicle */
  overlayStrength:    number;
  /** Which part of the photo frame to prioritise */
  cropStrategy:       CropStrategy;
}

export interface MarketingStyle {
  theme:       MarketingTheme;
  accentColor: string;
  tagline:     string;
  creative:    CreativeDirection;
  aiUsed:      boolean;
}

export interface VehicleStyleInput {
  brand:        string;
  model:        string;
  year:         number;
  color:        string;
  price:        number;
  currency:     string;
  fuelType:     string;
  transmission: string;
  mileage:      number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND_GOLD   = '#C9A84C';
const FALLBACK_TAG = 'Proverena vrednost. Vaša odluka.';
const HEX_RE       = /^#[0-9a-fA-F]{6}$/;

// ─── Default creative presets ─────────────────────────────────────────────────

const DARK_CREATIVE_DEFAULT: CreativeDirection = {
  compositionStyle:   'cinematic_full_bleed',
  typographyMode:     'editorial_large',
  imageTreatment:     'cinematic_contrast',
  informationDensity: 'balanced',
  panelStyle:         'glass_dark',
  lightingMood:       'dramatic',
  focalStrategy:      'vehicle_first',
  ctaStyle:           'prominent',
  overlayStrength:    0.22,
  cropStrategy:       'center',
};

const LIGHT_CREATIVE_DEFAULT: CreativeDirection = {
  compositionStyle:   'editorial_split',
  typographyMode:     'editorial_large',
  imageTreatment:     'clean_editorial',
  informationDensity: 'balanced',
  panelStyle:         'cream_editorial',
  lightingMood:       'clean',
  focalStrategy:      'vehicle_first',
  ctaStyle:           'prominent',
  overlayStrength:    0.12,
  cropStrategy:       'center',
};

// ─── Validation ───────────────────────────────────────────────────────────────

const V_COMPOSITION: Set<string> = new Set(['cinematic_full_bleed', 'editorial_split', 'luxury_catalog', 'social_feed_bold']);
const V_TYPOGRAPHY:  Set<string> = new Set(['editorial_large', 'sport_bold', 'refined_minimal']);
const V_IMAGE:       Set<string> = new Set(['cinematic_contrast', 'clean_editorial', 'warm_luxury', 'premium_showroom']);
const V_DENSITY:     Set<string> = new Set(['minimal', 'balanced', 'detailed']);
const V_PANEL:       Set<string> = new Set(['glass_dark', 'cream_editorial', 'floating_luxury', 'no_panel_editorial']);
const V_LIGHTING:    Set<string> = new Set(['dramatic', 'warm', 'clean', 'studio']);
const V_FOCAL:       Set<string> = new Set(['vehicle_first', 'price_anchor', 'brand_editorial']);
const V_CTA:         Set<string> = new Set(['prominent', 'subtle', 'minimal']);
const V_CROP:        Set<string> = new Set(['center', 'center_low', 'center_high', 'establish_wide']);

function str(v: unknown): string { return typeof v === 'string' ? v : ''; }

const OVERLAY_MIN = 0.1;
const OVERLAY_MAX = 0.48;
const OVERLAY_DEFAULT = 0.22;

function clampOverlay(v: unknown): number {
  const n = typeof v === 'number' ? v : Number.parseFloat(str(v));
  if (Number.isNaN(n)) return OVERLAY_DEFAULT;
  return Math.max(OVERLAY_MIN, Math.min(OVERLAY_MAX, n));
}

function validateCreative(raw: Record<string, unknown>, base: CreativeDirection): CreativeDirection {
  return {
    compositionStyle:   (V_COMPOSITION.has(str(raw.compositionStyle))   ? raw.compositionStyle   : base.compositionStyle)   as CompositionStyle,
    typographyMode:     (V_TYPOGRAPHY.has(str(raw.typographyMode))       ? raw.typographyMode     : base.typographyMode)     as TypographyMode,
    imageTreatment:     (V_IMAGE.has(str(raw.imageTreatment))            ? raw.imageTreatment     : base.imageTreatment)     as ImageTreatment,
    informationDensity: (V_DENSITY.has(str(raw.informationDensity))      ? raw.informationDensity : base.informationDensity) as InformationDensity,
    panelStyle:         (V_PANEL.has(str(raw.panelStyle))                ? raw.panelStyle         : base.panelStyle)         as PanelStyle,
    lightingMood:       (V_LIGHTING.has(str(raw.lightingMood))           ? raw.lightingMood       : base.lightingMood)       as LightingMood,
    focalStrategy:      (V_FOCAL.has(str(raw.focalStrategy))             ? raw.focalStrategy      : base.focalStrategy)      as FocalStrategy,
    ctaStyle:           (V_CTA.has(str(raw.ctaStyle))                    ? raw.ctaStyle           : base.ctaStyle)           as CtaStyle,
    overlayStrength:    clampOverlay(raw.overlayStrength ?? base.overlayStrength),
    cropStrategy:       (V_CROP.has(str(raw.cropStrategy))               ? raw.cropStrategy       : base.cropStrategy)       as CropStrategy,
  };
}

// ─── Deterministic fallback ───────────────────────────────────────────────────

const DARK_BRANDS  = new Set(['BMW', 'Mercedes', 'Mercedes-Benz', 'Porsche', 'Audi', 'Lexus', 'Jaguar', 'Land Rover', 'Maserati', 'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce', 'Alfa Romeo', 'Genesis']);
const SPORT_BRANDS = new Set(['BMW', 'Porsche', 'Alfa Romeo', 'Ferrari', 'Lamborghini', 'Maserati']);
const ELECTRIC_FUELS = new Set(['elektricni', 'hibrid']);

const BRAND_TAGLINES: Record<string, string> = {
  BMW:             'Pažljivo odabrano. Spremno za proveru.',
  'Mercedes-Benz': 'Premium izbor za sigurnu kupovinu.',
  Porsche:         'Provereno vozilo. Jasna odluka.',
  Audi:            'Napredno inženjerstvo, vaša prednost.',
  Volkswagen:      'Kvalitet koji traje.',
  Ford:            'Proverena snaga. Jasna vrednost.',
  Toyota:          'Pouzdanost na svakom kilometru.',
  Renault:         'Pouzdan izbor za svaki put.',
  Opel:            'Nemački kvalitet, proverena vrednost.',
  Škoda:           'Provereno vozilo, proverena odluka.',
  Peugeot:         'Elegancija i sigurnost u jednom oglasu.',
  Hyundai:         'Novi standard premium vrednosti.',
  Kia:             'Proverena vrednost. Vaša odluka.',
  Seat:            'Strast u svakom detalju.',
  Nissan:          'Proverena vrednost, svaki put.',
  Mazda:           'Radost vožnje, svaki dan.',
  Genesis:         'Luksuz koji se vidi. Vrednost koja traje.',
  Lexus:           'Preciznost i elegancija. Provereno.',
};

function darkCreative(isSport: boolean): CreativeDirection {
  return {
    ...DARK_CREATIVE_DEFAULT,
    typographyMode:  isSport ? 'sport_bold' : 'editorial_large',
    imageTreatment:  isSport ? 'cinematic_contrast' : 'warm_luxury',
    lightingMood:    isSport ? 'dramatic' : 'warm',
    overlayStrength: isSport ? 0.2 : 0.24,
    cropStrategy:    'center',
  };
}

function lightCreative(isElec: boolean): CreativeDirection {
  return {
    ...LIGHT_CREATIVE_DEFAULT,
    compositionStyle: isElec ? 'luxury_catalog' : 'editorial_split',
    imageTreatment:   isElec ? 'premium_showroom' : 'clean_editorial',
    lightingMood:     isElec ? 'studio' : 'clean',
    overlayStrength:  0.12,
    cropStrategy:     'center',
  };
}

function fallbackStyle(input: VehicleStyleInput): MarketingStyle {
  const brandKey = Object.keys(BRAND_TAGLINES).find((b) =>
    input.brand.toLowerCase().includes(b.toLowerCase()),
  );
  const isDark  = DARK_BRANDS.has(input.brand) || ELECTRIC_FUELS.has(input.fuelType) || input.price > 40_000;
  const isSport = SPORT_BRANDS.has(input.brand) || input.price > 80_000;
  const isElec  = ELECTRIC_FUELS.has(input.fuelType);

  return {
    theme:       isDark ? 'dark' : 'light',
    accentColor: BRAND_GOLD,
    tagline:     brandKey ? BRAND_TAGLINES[brandKey] : FALLBACK_TAG,
    creative:    isDark ? darkCreative(isSport) : lightCreative(isElec),
    aiUsed:      false,
  };
}

// ─── OpenAI provider ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the AI art director for MOJ AUTO DILER — a premium Serbian used-car dealership. The brand accent is gold (#C9A84C).

Your role: decide creative direction only. Handcrafted production templates handle the actual rendering. You never write layout code.

Think like: Porsche Approved campaign director / BMW Premium Selection art director / Polestar social team.

━━━ RETURN FORMAT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY compact JSON with exactly these 13 fields:

theme               "dark" | "light"
accentColor         "#RRGGBB"
tagline             Serbian, ≤ 7 words, no exclamation marks
compositionStyle    "cinematic_full_bleed" | "editorial_split" | "luxury_catalog" | "social_feed_bold"
typographyMode      "editorial_large" | "sport_bold" | "refined_minimal"
imageTreatment      "cinematic_contrast" | "clean_editorial" | "warm_luxury" | "premium_showroom"
informationDensity  "minimal" | "balanced" | "detailed"
panelStyle          "glass_dark" | "cream_editorial" | "floating_luxury" | "no_panel_editorial"
lightingMood        "dramatic" | "warm" | "clean" | "studio"
focalStrategy       "vehicle_first" | "price_anchor" | "brand_editorial"
ctaStyle            "prominent" | "subtle" | "minimal"
cropStrategy        "center" | "center_low" | "center_high" | "establish_wide"
overlayStrength     number 0.10–0.48

━━━ COMPOSITION IDENTITIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cinematic_full_bleed → DARK ONLY. Vehicle dominates the full frame. All typography lives in the BOTTOM THIRD — car gets the top 60% clean. Think: BMW M Series poster, Porsche 911 campaign. overlayStrength 0.18–0.28.

editorial_split → LIGHT. Premium photo top half, luxury editorial info below. Think: Porsche Approved catalog, AutoTrader Premium. overlayStrength 0.10–0.16.

luxury_catalog → LIGHT. Vehicle fills 65% of frame, title overlaid at bottom of photo, minimal info strip. Think: Polestar launch page, Genesis digital campaign. overlayStrength 0.12–0.20.

social_feed_bold → EITHER THEME. Aggressive composition. Bold vehicle crop, large price badge, instant-read at thumbnail size. Think: AMG Instagram story, dealer paid social.

━━━ CROP STRATEGY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

center       → Standard center crop, suits most vehicles
center_low   → Show more of the lower body / wheels / road (SUVs, sportscars)
center_high  → Show more of the upper body / roof / sky (luxury sedans, convertibles)
establish_wide → Maximum field of view, environmental storytelling

━━━ OVERLAY STRENGTH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

0.10–0.15 → almost invisible overlay, vehicle fully visible (use for clean/studio)
0.16–0.25 → subtle atmospheric vignette (standard for most premium campaigns)
0.26–0.35 → noticeable cinematic grade (sport, dramatic, aggressive social)
0.36–0.48 → heavy mood treatment (AMG, track shots, extreme sport)
The vehicle must ALWAYS remain the strongest visual element. Never use overlay > 0.48.

━━━ THEME + COLOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

dark  → luxury, sport, performance, premium brands (BMW/Mercedes/Porsche/Audi/Lexus/Alfa/Genesis), price >25000 EUR, hybrid/EV
light → family, economy, practical, city car, entry-level

Brand default: #C9A84C (gold). Sport red: #C0392B. EV teal: #0ABFBC. Copper: #B87333.
AVOID blues as default. Never pick colors darker than #555 or lighter than #BBB.

━━━ TAGLINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Serbian only. Max 7 words. Confident, honest, editorial. No exclamation marks. No fake claims.
✓ "Pažljivo odabrano. Spremno za proveru."  ✓ "Provereno vozilo. Jasna odluka."
✗ "Neverovatna ponuda!"  ✗ "Kupite odmah!"

Return ONLY the JSON. No markdown. No explanation.`;

interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>;
}

async function openAIStyle(input: VehicleStyleInput, apiKey: string): Promise<MarketingStyle> {
  const isDarkCandidate = DARK_BRANDS.has(input.brand) || ELECTRIC_FUELS.has(input.fuelType) || input.price > 25_000;
  const isSUV = ['SUV', 'crossover', 'off-road'].some((t) => input.model.toLowerCase().includes(t));

  const userPrompt = [
    `Brand: ${input.brand}`,
    `Model: ${input.model}`,
    `Year: ${input.year}`,
    `Exterior color: ${input.color}`,
    `Price: ${input.price.toLocaleString('de-DE')} ${input.currency}`,
    `Fuel: ${input.fuelType}`,
    `Transmission: ${input.transmission}`,
    `Mileage: ${input.mileage.toLocaleString('de-DE')} km`,
    `Suggested theme: ${isDarkCandidate ? 'dark' : 'light'}`,
    isSUV ? 'Body type: SUV/crossover — consider center_low crop for wheel/stance presence.' : '',
  ].filter(Boolean).join('\n');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:           'gpt-4o-mini',
      response_format: { type: 'json_object' },
      max_tokens:      260,
      temperature:     0.38,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) throw new Error(`OpenAI API ${res.status}`);

  const json = (await res.json()) as OpenAIResponse;
  const raw  = json.choices[0]?.message?.content ?? '{}';

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error('OpenAI returned invalid JSON');
  }

  const theme = parsed.theme === 'light' ? 'light' : 'dark';
  const base  = theme === 'dark' ? DARK_CREATIVE_DEFAULT : LIGHT_CREATIVE_DEFAULT;

  const rawColor    = str(parsed.accentColor).trim();
  const accentColor = HEX_RE.test(rawColor) ? rawColor : BRAND_GOLD;
  const rawTag      = str(parsed.tagline).trim();
  const tagline     = rawTag.length > 0 && rawTag.length <= 80 ? rawTag : FALLBACK_TAG;
  const creative    = validateCreative(parsed, base);

  return { theme, accentColor, tagline, creative, aiUsed: true };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateMarketingStyle(input: VehicleStyleInput): Promise<MarketingStyle> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return fallbackStyle(input);

  try {
    return await openAIStyle(input, apiKey);
  } catch (err) {
    console.warn('[AI Marketing] OpenAI failed, using fallback:', err instanceof Error ? err.message : err);
    return fallbackStyle(input);
  }
}
