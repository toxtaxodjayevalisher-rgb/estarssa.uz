"use client";
import DashboardLayout from '@/app/components/DashboardLayout';
import AnnouncementsClient from '@/app/components/AnnouncementsClient';

export default function StarssaAnnouncementsPage() {
  return (
    <DashboardLayout role="STARSSA">
      <div className="max-w-4xl mx-auto pb-8">
        <AnnouncementsClient role="STARSSA" />
      </div>
    </DashboardLayout>
  );
}
