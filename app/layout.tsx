import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pokemon",
});

export const metadata: Metadata = {
  title: "Pokemon Calmind Series",
  description: "Competición Amateur de Pokemon Calmind Series",
  keywords: ["Pokemon", "Calmind", "Series", "Competición", "Amateur", "Gaming"],
  authors: [{ name: "Diego Casero Martín" }],
  robots: "index, follow",
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
        {/* Pixel Art Clouds Animation */}
        <div className="clouds-container">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
          <div className="cloud cloud-4"></div>
        </div>

        <Navbar />

        <div className="max-w-4xl mx-auto px-4">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
