const fs = require('fs');

const roles = ['admin', 'ustoz', 'starssa'];

for (const role of roles) {
  const basePage = fs.readFileSync(`app/${role}/page.tsx`, 'utf8');
  
  // Find the exact sidebar div
  const startIndex = basePage.indexOf('<div className="w-full md:w-64');
  // Find the end of the sidebar div (it ends right before <div className="flex-1)
  const endIndex = basePage.indexOf('<div className="flex-1');
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find sidebar in ' + role);
    continue;
  }
  
  let sidebar = basePage.substring(startIndex, endIndex);

  // We need to fix the active link state for the announcements link
  // First, demote Asosiy
  sidebar = sidebar.replace(
    `href="/${role}" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]"`,
    `href="/${role}" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1"`
  );
  // Promote Announcements
  sidebar = sidebar.replace(
    `href="/${role}/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1"`,
    `href="/${role}/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02] text-white"`
  );

  const newCode = `"use client";
import Link from 'next/link';
import AnnouncementsClient from '@/app/components/AnnouncementsClient';

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      ${sidebar}
      <div className="flex-1 p-8 overflow-y-auto text-black">
        <AnnouncementsClient role="${role.toUpperCase()}" />
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(`app/${role}/announcements/page.tsx`, newCode);
  console.log('Fixed ' + role);
}
