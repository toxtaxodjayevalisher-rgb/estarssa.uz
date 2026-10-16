"use client";
import DashboardLayout from '@/app/components/DashboardLayout';
import AnnouncementsClient from '@/app/components/AnnouncementsClient';

export default function UstozAnnouncementsPage() {
  return (
    <DashboardLayout role="USTOZ">
      <div className="max-w-4xl mx-auto pb-8">
        <AnnouncementsClient role="USTOZ" />
      </div>
    </DashboardLayout>
  );
}
