"use client";
import DashboardLayout from '@/app/components/DashboardLayout';
import AnnouncementsClient from '@/app/components/AnnouncementsClient';

export default function AdminAnnouncementsPage() {
  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-4xl mx-auto pb-8">
        <AnnouncementsClient role="ADMIN" />
      </div>
    </DashboardLayout>
  );
}
