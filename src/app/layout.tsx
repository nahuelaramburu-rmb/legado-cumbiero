import type { Metadata } from "next";
import "./globals.css";
import { BottomTabBar } from "@/components/BottomTabBar";

export const metadata: Metadata = {
  title: "Legado Cumbiero",
  description: "La plataforma multi-tenant para boliches: entradas, listas y line-ups en un solo lugar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cumbia-glow min-h-screen pb-16 md:pb-0">
        {children}
        <BottomTabBar />
      </body>
    </html>
  );
}
