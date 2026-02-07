import type { Metadata } from 'next';
import './globals.css';
import MakeAdminScript from '@/components/MakeAdminScript';
import GlobalHeader from '@/components/GlobalHeader';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

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
        <GlobalHeader />
        {children}
        <Footer />
        <WhatsAppButton />
        <MakeAdminScript />
      </body>
    </html>
  );
}