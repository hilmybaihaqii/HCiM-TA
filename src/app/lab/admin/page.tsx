import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Langsung arahkan user ke halaman manajemen pengguna saat mengakses /lab/admin
  redirect('/lab/admin/users');
}