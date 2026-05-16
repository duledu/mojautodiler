import AdminDealersClient from '@/components/admin/AdminDealersClient';
import { getAllDealers } from '@/lib/db/dealers';

export const dynamic = 'force-dynamic';

export default async function AdminDealersPage() {
  const dealers = await getAllDealers();
  return <AdminDealersClient dealers={dealers} />;
}
