import { Lead } from '@/types/lead';

export const mockLeads: Lead[] = [
  {
    id: '1',
    type: 'inquiry',
    status: 'novo',
    intent: 'schedule_viewing',
    preferredContactChannel: 'web',
    vehicleId: '1',
    vehicleTitle: 'BMW X5 xDrive30d',
    name: 'Marko Petrović',
    phone: '+381 64 555 1234',
    email: 'marko@example.com',
    message: 'Zanima me test vožnja. Da li je vozilo dostupno ovog vikenda?',
    source: 'web',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    type: 'inquiry',
    status: 'kontaktiran',
    intent: 'general_inquiry',
    preferredContactChannel: 'web',
    vehicleId: '5',
    vehicleTitle: 'Porsche Cayenne Coupé',
    name: 'Ana Jovanović',
    phone: '+381 65 555 5678',
    email: 'ana@example.com',
    message: 'Molim vas za više informacija o istoriji servisa i da li se može finansiranje.',
    source: 'web',
    createdAt: '2024-01-19T09:15:00Z',
  },
  {
    id: '3',
    type: 'contact',
    status: 'kontaktiran',
    intent: 'schedule_viewing',
    preferredContactChannel: 'web',
    name: 'Stefan Nikolić',
    phone: '+381 63 555 9012',
    message: 'Imam interesse u kupovini automobila. Mogu li doći u subotu?',
    source: 'web',
    createdAt: '2024-01-18T16:45:00Z',
  },
  {
    id: '4',
    type: 'inquiry',
    status: 'novo',
    intent: 'general_inquiry',
    preferredContactChannel: 'viber',
    vehicleId: '3',
    vehicleTitle: 'Audi A6 45 TFSI S-Line',
    name: 'Milan Stanković',
    phone: '+381 60 555 3456',
    message: 'Da li se može zamena za moj Golf 7? Interesuje me i vaša procena.',
    source: 'viber',
    createdAt: '2024-01-20T11:00:00Z',
  },
];

export function addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
  const newLead: Lead = {
    ...lead,
    id: String(mockLeads.length + 1),
    status: 'novo',
    intent: lead.intent ?? 'general_inquiry',
    preferredContactChannel: lead.preferredContactChannel ?? 'web',
    createdAt: new Date().toISOString(),
  };
  mockLeads.push(newLead);
  return newLead;
}
