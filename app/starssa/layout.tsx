import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';

export default async function StarssaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await verifyAuth();
  
  if (!user || user.role !== 'STARSSA') {
    redirect('/login');
  }

  return <>{children}</>;
}
