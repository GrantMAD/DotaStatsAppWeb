'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSkeleton } from '@/components/ui/AdminSkeleton';
import { useUser } from '@/hooks/useUser';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: profile, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && profile?.role !== 'admin') {
      router.push('/');
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminSkeleton />
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
