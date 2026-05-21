import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/db/leads';
import { addLead } from '@/data/leads';
import { sendLeadNotification } from '@/lib/mail';
import type { LeadIntent, LeadType, PreferredContactChannel } from '@/types/lead';

const VALID_TYPES    = new Set<LeadType>(['inquiry', 'contact', 'test_drive', 'financing']);
const VALID_INTENTS  = new Set<LeadIntent>([
  'phone_call', 'viber_click', 'request_video',
  'reservation_request', 'schedule_viewing', 'general_inquiry',
]);
const VALID_CHANNELS = new Set<PreferredContactChannel>(['phone', 'viber', 'email', 'web', 'instagram', 'facebook']);
const VALID_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    // ── Parse body — supports both JSON (quick-action clicks) and
    //   multipart/form-data (contact form with optional image attachment) ──────
    const ct = request.headers.get('content-type') ?? '';
    let fields: Record<string, unknown>;
    let attachment: { filename: string; buffer: Buffer; contentType: string } | undefined;

    if (ct.includes('multipart/form-data')) {
      const fd = await request.formData();

      // Collect text fields
      const text: Record<string, string> = {};
      for (const [key, value] of fd.entries()) {
        if (typeof value === 'string') text[key] = value;
      }
      fields = text;

      // Extract and validate image
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
            { success: false, error: 'Slika je prevelika. Maksimalna veličina je 5 MB.' },
            { status: 400 },
          );
        }
        attachment = {
          filename:    file.name || 'prilog.jpg',
          buffer:      Buffer.from(await file.arrayBuffer()),
          contentType: file.type,
        };
      }
    } else {
      fields = await request.json();
    }

    // ── Field extraction & validation ─────────────────────────────────────────
    const name         = String(fields.name    ?? '').trim();
    const phone        = String(fields.phone   ?? '').trim();
    const intentValue  = String(fields.intent  ?? 'general_inquiry').trim();
    const channelValue = String(fields.preferredContactChannel ?? fields.source ?? 'web').trim();

    const intent: LeadIntent = VALID_INTENTS.has(intentValue as LeadIntent)
      ? intentValue as LeadIntent : 'general_inquiry';
    const preferredContactChannel: PreferredContactChannel = VALID_CHANNELS.has(channelValue as PreferredContactChannel)
      ? channelValue as PreferredContactChannel : 'web';

    const message = String(fields.message ?? intentMessage(intent, fields.vehicleTitle)).trim();
    const type    = String(fields.type    ?? 'contact').trim();

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

    const dbInput = {
      type:         leadType,
      name,
      phone,
      email:        String(fields.email        ?? '').trim() || undefined,
      message,
      intent,
      preferredContactChannel,
      vehicleId:    String(fields.vehicleId    ?? '').trim() || undefined,
      vehicleTitle: String(fields.vehicleTitle ?? '').trim() || undefined,
      dealerId:     String(fields.dealerId     ?? '').trim() || undefined,
      dealerName:   String(fields.dealerName   ?? '').trim() || undefined,
      source:       preferredContactChannel,
    };

    const emailPayload = {
      name:         dbInput.name,
      phone:        dbInput.phone,
      email:        dbInput.email,
      message:      dbInput.message,
      intent:       dbInput.intent,
      vehicleTitle: dbInput.vehicleTitle,
      attachment,
    };

    // ── Persist lead; fall back to in-memory store so the form never 500s ────
    try {
      const lead = await createLead(dbInput);
      sendLeadNotification(emailPayload).catch((err) => console.error('[mail] send error:', err));
      return NextResponse.json({ success: true, lead }, { status: 201 });
    } catch {
      const lead = addLead({ ...dbInput, source: 'web' as const });
      sendLeadNotification(emailPayload).catch((err) => console.error('[mail] send error:', err));
      return NextResponse.json({ success: true, lead }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Interna greška servera' },
      { status: 500 },
    );
  }
}

function intentMessage(intent: LeadIntent, vehicleTitle?: unknown): string {
  const title = typeof vehicleTitle === 'string' && vehicleTitle.trim() ? `: ${vehicleTitle.trim()}` : '';
  const labels: Record<LeadIntent, string> = {
    phone_call:          'Klik na poziv',
    viber_click:         'Klik na Viber',
    request_video:       'Zahtev za video',
    reservation_request: 'Zahtev za rezervaciju',
    schedule_viewing:    'Zakazivanje gledanja',
    general_inquiry:     'Opsti upit',
  };
  return `${labels[intent]}${title}`;
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
