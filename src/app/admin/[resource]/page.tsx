'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { RESOURCES } from '@/features/admin/config';
import { ResourceManager } from '@/features/admin/ResourceManager';

export default function AdminResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = use(params);
  const cfg = RESOURCES[resource];
  if (!cfg) notFound();
  return <ResourceManager cfg={cfg} />;
}
