import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';

export default async function UstozLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await verifyAuth();
  
  if (!user || user.role !== 'USTOZ') {
    redirect('/login');
  }

  return <>{children}</>;
}
