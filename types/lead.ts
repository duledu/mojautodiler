export type LeadType = 'inquiry' | 'contact' | 'test_drive' | 'financing';
export type LeadStatus = 'new' | 'read' | 'replied' | 'closed' | 'spam';

export interface Lead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  vehicleId?: string;
  vehicleTitle?: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  source?: 'web' | 'viber' | 'instagram' | 'facebook';
  createdAt: string;
}
