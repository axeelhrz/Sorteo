import type { Metadata } from 'next';
import './globals.css';
import MakeAdminScript from '@/components/MakeAdminScript';

export const metadata: Metadata = {
  title: 'TIKETEA ONLINE',
  description: 'Plataforma de sorteos online - TIKETEA ONLINE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <MakeAdminScript />
      </body>
    </html>
  );
}