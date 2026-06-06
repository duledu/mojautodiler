import { NextRequest, NextResponse } from 'next/server';
import { createLead, findRecentDuplicateLead } from '@/lib/db/leads';
import { addLead } from '@/data/leads';
import { sendLeadNotification } from '@/lib/mail';
import type { LeadIntent, LeadType, PreferredContactChannel } from '@/types/lead';

const VALID_TYPES = new Set<LeadType>(['inquiry', 'contact', 'test_drive', 'financing']);
const VALID_INTENTS = new Set<LeadIntent>([
  'phone_call',
  'viber_click',
  'whatsapp_click',
  'request_video',
  'reservation_request',
  'schedule_viewing',
  'general_inquiry',
]);
const VALID_CHANNELS = new Set<PreferredContactChannel>([
  'phone',
  'viber',
  'whatsapp',
  'email',
  'web',
  'instagram',
  'facebook',
]);
const VALID_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Fast first-layer guard for hot repeat posts in the same serverless instance.
// The DB lookup in POST is the production guard across cold starts/instances.
const recentLeads = new Map<string, number>();
const MEMORY_DEDUP_WINDOW_MS = 30_000;
const DB_DEDUP_WINDOW_MS = 60_000;

function dedupKey(vehicleId: string, intent: string, ipAddress?: string, userAgent?: string): string {
  return `${vehicleId}:${intent}:${ipAddress || 'no-ip'}:${userAgent || 'no-ua'}`;
}

function isMemoryDuplicate(vehicleId: string, intent: string, ipAddress?: string, userAgent?: string): boolean {
  const last = recentLeads.get(dedupKey(vehicleId, intent, ipAddress, userAgent));
  return last !== undefined && Date.now() - last < MEMORY_DEDUP_WINDOW_MS;
}

function recordMemoryDedup(vehicleId: string, intent: string, ipAddress?: string, userAgent?: string): void {
  recentLeads.set(dedupKey(vehicleId, intent, ipAddress, userAgent), Date.now());

  if (recentLeads.size > 2000) {
    const cutoff = Date.now() - MEMORY_DEDUP_WINDOW_MS;
    for (const [key, timestamp] of recentLeads.entries()) {
      if (timestamp < cutoff) recentLeads.delete(key);
    }
  }
}

function getClientIp(request: NextRequest): string | undefined {
  const raw =
    request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? undefined;

  return raw && raw !== 'unknown' ? raw.slice(0, 120) : undefined;
}

function getUserAgent(request: NextRequest): string | undefined {
  const raw = request.headers.get('user-agent')?.trim();
  return raw ? raw.slice(0, 500) : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const ct = request.headers.get('content-type') ?? '';
    let fields: Record<string, unknown>;
    let attachment: { filename: string; buffer: Buffer; contentType: string } | undefined;

    if (ct.includes('multipart/form-data')) {
      const fd = await request.formData();
      const text: Record<string, string> = {};
      for (const [key, value] of fd.entries()) {
        if (typeof value === 'string') text[key] = value;
      }
      fields = text;

      const file = fd.get('image');
      if (file instanceof File && file.size > 0) {
        if (!VALID_IMAGE_MIMES.has(file.type)) {
          return NextResponse.json(
            { success: false, error: 'Nevalidan tip slike. Dozvoljeni formati: JPG, PNG, WEBP.' },
            { status: 400 },
          );
        }
        if (file.size > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { success: false, error: 'Slika je prevelika. Maksimalna velicina je 5 MB.' },
            { status: 400 },
          );
        }
        attachment = {
          filename: file.name || 'prilog.jpg',
          buffer: Buffer.from(await file.arrayBuffer()),
          contentType: file.type,
        };
      }
    } else {
      fields = await request.json();
    }

    const name = String(fields.name ?? '').trim();
    const phone = String(fields.phone ?? '').trim();
    const intentValue = String(fields.intent ?? 'general_inquiry').trim();
    const channelValue = String(fields.preferredContactChannel ?? fields.source ?? 'web').trim();

    const intent: LeadIntent = VALID_INTENTS.has(intentValue as LeadIntent)
      ? intentValue as LeadIntent
      : 'general_inquiry';
    const preferredContactChannel: PreferredContactChannel = VALID_CHANNELS.has(channelValue as PreferredContactChannel)
      ? channelValue as PreferredContactChannel
      : 'web';

    const message = String(fields.message ?? intentMessage(intent, fields.vehicleTitle)).trim();
    const type = String(fields.type ?? 'contact').trim();

    if (!name || !phone || !message || !type) {
      return NextResponse.json(
        { success: false, error: 'Nedostaju obavezna polja (name, phone, message, type)' },
        { status: 400 },
      );
    }
    if (message.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Poruka je prekratka' },
        { status: 400 },
      );
    }

    const leadType: LeadType = VALID_TYPES.has(type as LeadType) ? type as LeadType : 'contact';
    const vehicleId = String(fields.vehicleId ?? '').trim() || undefined;
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    if (vehicleId && isMemoryDuplicate(vehicleId, intent, ipAddress, userAgent)) {
      console.log(
        `[leads] duplicate_suppressed_memory vehicleId=${vehicleId} intent=${intent} ip=${ipAddress ?? 'unknown'}`,
      );
      return NextResponse.json({ success: true, deduplicated: true }, { status: 200 });
    }

    if (vehicleId) {
      const duplicate = await findRecentDuplicateLead({
        vehicleId,
        intent,
        ipAddress,
        userAgent,
        since: new Date(Date.now() - DB_DEDUP_WINDOW_MS),
      });

      if (duplicate) {
        recordMemoryDedup(vehicleId, intent, ipAddress, userAgent);
        console.log(
          `[leads] duplicate_suppressed_db vehicleId=${vehicleId} intent=${intent} leadId=${duplicate.id} ip=${ipAddress ?? 'unknown'}`,
        );
        return NextResponse.json({ success: true, deduplicated: true }, { status: 200 });
      }
    }

    // Attribution: UTM + referrer JSON sent by the client.
    // Must be a string (the client sends JSON.stringify output).
    // Cap at 2 KB to prevent oversized payloads from filling the column.
    const attributionRaw = typeof fields.attribution === 'string'
      ? fields.attribution.trim()
      : undefined;
    const attribution = attributionRaw && attributionRaw.length <= 2048
      ? attributionRaw
      : undefined;

    const dbInput = {
      type: leadType,
      name,
      phone,
      email: String(fields.email ?? '').trim() || undefined,
      message,
      intent,
      preferredContactChannel,
      vehicleId,
      vehicleTitle: String(fields.vehicleTitle ?? '').trim() || undefined,
      dealerId: String(fields.dealerId ?? '').trim() || undefined,
      dealerName: String(fields.dealerName ?? '').trim() || undefined,
      source: preferredContactChannel,
      ipAddress,
      userAgent,
      attribution,
    };

    const dealerPhone = String(fields.dealerPhone ?? '').trim() || undefined;

    const emailPayload = {
      name: dbInput.name,
      phone: dbInput.phone,
      email: dbInput.email,
      message: dbInput.message,
      intent: dbInput.intent,
      vehicleTitle: dbInput.vehicleTitle,
      dealerName: dbInput.dealerName,
      dealerPhone,
      attachment,
    };

    console.log(`[leads] inquiry_received name="${name}" phone="${phone}" intent=${intent} vehicleId=${vehicleId ?? 'none'} ip=${ipAddress ?? 'unknown'}`);

    try {
      const lead = await createLead(dbInput);
      if (vehicleId) recordMemoryDedup(vehicleId, intent, ipAddress, userAgent);
      console.log(`[leads] lead_saved id=${lead.id} vehicleId=${vehicleId ?? 'none'} intent=${intent}`);
      console.log(`[leads] email_attempted leadId=${lead.id} hasAttachment=${!!attachment}`);
      sendLeadNotification(emailPayload)
        .then(() => console.log(`[leads] email_success leadId=${lead.id}`))
        .catch((err) => console.error(`[leads] email_failed leadId=${lead.id}`, err));
      return NextResponse.json({ success: true, lead }, { status: 201 });
    } catch (dbErr) {
      console.error('[leads] db_failed — falling back to in-memory store', dbErr);
      const lead = addLead({ ...dbInput, source: 'web' as const });
      if (vehicleId) recordMemoryDedup(vehicleId, intent, ipAddress, userAgent);
      console.log(`[leads] lead_saved_fallback id=${lead.id} vehicleId=${vehicleId ?? 'none'} intent=${intent}`);
      console.log(`[leads] email_attempted leadId=${lead.id} hasAttachment=${!!attachment}`);
      sendLeadNotification(emailPayload)
        .then(() => console.log(`[leads] email_success leadId=${lead.id}`))
        .catch((err) => console.error(`[leads] email_failed leadId=${lead.id}`, err));
      return NextResponse.json({ success: true, lead }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Interna greska servera' },
      { status: 500 },
    );
  }
}

function intentMessage(intent: LeadIntent, vehicleTitle?: unknown): string {
  const title = typeof vehicleTitle === 'string' && vehicleTitle.trim() ? `: ${vehicleTitle.trim()}` : '';
  const labels: Record<LeadIntent, string> = {
    phone_call: 'Klik na poziv',
    viber_click: 'Klik na Viber',
    whatsapp_click: 'Klik na WhatsApp',
    request_video: 'Zahtev za video',
    reservation_request: 'Zahtev za rezervaciju',
    schedule_viewing: 'Zakazivanje gledanja',
    general_inquiry: 'Opsti upit',
  };
  return `${labels[intent]}${title}`;
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
