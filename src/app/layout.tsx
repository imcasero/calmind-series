import type { Metadata, Viewport } from 'next';
import { Press_Start_2P } from 'next/font/google';
import { Footer } from '@/components/shared';
import './globals.css';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pokemon',
});

export const metadata: Metadata = {
  title: {
    default: 'Pokemon Calmind Series',
    template: '%s | Pokemon Calmind Series',
  },
  description: 'Competición Amateur de Pokemon Calmind Series',
  keywords: [
    'Pokemon',
    'Calmind',
    'Series',
    'Competición',
    'Amateur',
    'Gaming',
  ],
  authors: [{ name: 'Diego Casero Martín' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Pokemon Calmind Series',
    title: 'Pokemon Calmind Series',
    description:
      'Competición Amateur de Pokemon. Clasificaciones, participantes y enfrentamientos.',
  },
  twitter: {
    card: 'summary',
    title: 'Pokemon Calmind Series',
    description: 'Competición Amateur de Pokemon Calmind Series',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e0a3c',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className={pressStart2P.variable}>
        <div className="clouds-container">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
          <div className="cloud cloud-4" />
        </div>

        {children}
        <Footer />
      </body>
    </html>
  );
}
