const fs = require('fs');
const path = require('path');

const roles = ['admin', 'ustoz', 'starssa'];

for (const role of roles) {
  // Read the base page to get the sidebar layout
  const basePagePath = path.join('app', role, 'page.tsx');
  let basePage = fs.readFileSync(basePagePath, 'utf8');

  // Extract the layout wrapper (everything before <div className="flex-1... ">)
  const layoutParts = basePage.split(/<div className="flex-1[^>]*>/);
  if (layoutParts.length < 2) continue;

  const sidebar = layoutParts[0];
  const mainWrapper = basePage.match(/<div className="flex-1[^>]*>/)[0];

  const targetDir = path.join('app', role, 'announcements');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Generate the new page content
  const newPageContent = `"use client";
import Link from 'next/link';
import AnnouncementsClient from '@/app/components/AnnouncementsClient';

export default function AnnouncementsPage() {
  return (
    ${sidebar.replace('export default function ' + (role === 'admin' ? 'AdminDashboard' : role === 'ustoz' ? 'UstozDashboard' : 'StarssaDashboard'), '')}
    ${mainWrapper}
      <AnnouncementsClient role="${role.toUpperCase()}" />
    </div>
    </div>
  );
}
`;

  // Fix up the export and the import in the generated code
  let finalContent = newPageContent.replace(/import Link from 'next\/link';(\s*import Link from 'next\/link';)+/g, "import Link from 'next/link';");
  
  // Actually, we just need to reconstruct the file properly
  const cleanSidebar = sidebar.replace(/export default function [a-zA-Z]+\(\) \{\s*return \(/, '');
  
  const finalCleanContent = `"use client";
import Link from 'next/link';
import AnnouncementsClient from '@/app/components/AnnouncementsClient';

export default function AnnouncementsPage() {
  return (
    ${cleanSidebar}
    ${mainWrapper}
      <AnnouncementsClient role="${role.toUpperCase()}" />
    </div>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(targetDir, 'page.tsx'), finalCleanContent);
  console.log('Created ' + role + ' announcements page');
}
