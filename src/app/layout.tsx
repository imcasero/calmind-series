import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import { Footer, Navbar } from '@/components/shared';
import './globals.css';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pokemon',
});

export const metadata: Metadata = {
  title: 'Pokemon Calmind Series',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={pressStart2P.variable}>
        <div className="clouds-container">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
          <div className="cloud cloud-4" />
        </div>

        <Navbar />
        <div className="max-w-4xl mx-auto px-4">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
