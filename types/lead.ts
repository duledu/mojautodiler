export type LeadType = 'inquiry' | 'contact' | 'test_drive' | 'financing';
export type LeadIntent =
  | 'phone_call'
  | 'viber_click'
  | 'whatsapp_click'
  | 'request_video'
  | 'reservation_request'
  | 'schedule_viewing'
  | 'general_inquiry';
export type PreferredContactChannel = 'phone' | 'viber' | 'whatsapp' | 'email' | 'web' | 'instagram' | 'facebook';
export type LeadStatus = 'novo' | 'kontaktiran' | 'zakazano' | 'rezervisano' | 'prodato' | 'izgubljeno';

export interface Lead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  vehicleId?: string;
  vehicleTitle?: string;
  dealerId?: string;
  dealerName?: string;
  intent: LeadIntent;
  preferredContactChannel: PreferredContactChannel;
  name: string;
  phone: string;
  email?: string;
  message: string;
  source?: 'web' | 'viber' | 'whatsapp' | 'instagram' | 'facebook' | 'phone' | 'email';
  /** JSON string: UTM params + referrer + landing page. Parse with parseAttribution() from lib/utm. */
  attribution?: string;
  createdAt: string;
}
