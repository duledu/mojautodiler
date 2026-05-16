import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/db/leads';
import { addLead } from '@/data/leads';
import type { LeadIntent, LeadType, PreferredContactChannel } from '@/types/lead';

const VALID_TYPES = new Set<LeadType>(['inquiry', 'contact', 'test_drive', 'financing']);
const VALID_INTENTS = new Set<LeadIntent>([
  'phone_call',
  'viber_click',
  'request_video',
  'reservation_request',
  'schedule_viewing',
  'general_inquiry',
]);
const VALID_CHANNELS = new Set<PreferredContactChannel>(['phone', 'viber', 'email', 'web', 'instagram', 'facebook']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    const name    = String(body.name    ?? '').trim();
    const phone   = String(body.phone   ?? '').trim();
    const intentValue = String(body.intent ?? 'general_inquiry').trim();
    const channelValue = String(body.preferredContactChannel ?? body.source ?? 'web').trim();
    const intent: LeadIntent = VALID_INTENTS.has(intentValue as LeadIntent) ? intentValue as LeadIntent : 'general_inquiry';
    const preferredContactChannel: PreferredContactChannel = VALID_CHANNELS.has(channelValue as PreferredContactChannel)
      ? channelValue as PreferredContactChannel
      : 'web';
    const message = String(body.message ?? intentMessage(intent, body.vehicleTitle)).trim();
    const type    = String(body.type    ?? 'contact').trim();

    if (!name || !phone || !message || !type) {
      return NextResponse.json(
        { success: false, error: 'Nedostaju obavezna polja (name, phone, message, type)' },
        { status: 400 }
      );
    }

    if (message.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Poruka je prekratka' },
        { status: 400 }
      );
    }

    const leadType: LeadType = VALID_TYPES.has(type as LeadType) ? type as LeadType : 'contact';

    const dbInput = {
      type:         leadType,
      name,
      phone,
      email:        body.email?.trim()        || undefined,
      message,
      intent,
      preferredContactChannel,
      vehicleId:    body.vehicleId            || undefined,
      vehicleTitle: body.vehicleTitle?.trim() || undefined,
      dealerId:     body.dealerId             || undefined,
      dealerName:   body.dealerName?.trim()   || undefined,
      source:       preferredContactChannel,
    };

    // Try DB first; fall back to in-memory mock store so the form never 500s
    try {
      const lead = await createLead(dbInput);
      return NextResponse.json({ success: true, lead }, { status: 201 });
    } catch {
      const lead = addLead({ ...dbInput, source: 'web' as const });
      return NextResponse.json({ success: true, lead }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Interna greška servera' },
      { status: 500 }
    );
  }
}

function intentMessage(intent: LeadIntent, vehicleTitle?: unknown): string {
  const title = typeof vehicleTitle === 'string' && vehicleTitle.trim() ? `: ${vehicleTitle.trim()}` : '';
  const labels: Record<LeadIntent, string> = {
    phone_call: 'Klik na poziv',
    viber_click: 'Klik na Viber',
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
