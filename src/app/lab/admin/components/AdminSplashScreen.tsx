'use client';

import React from 'react';
import ViewSplash from '../../components/ViewSplash';

/**
 * Sambutan "Welcome, Admin." setiap kali panel admin dibuka (penanda area khusus admin).
 * Hanya dirender untuk akun admin; status berubah jadi "verified" setelah backend memastikan role-nya.
 * Desainnya sama dengan sambutan saat kembali ke user view (ViewSplash).
 */
export default function AdminSplashScreen({ isVisible, verified }: { isVisible: boolean; verified: boolean }) {
  return (
    <ViewSplash
      isVisible={isVisible}
      title="Welcome, Admin."
      status={verified ? 'Admin access verified' : 'Verifying admin access'}
    />
  );
}
