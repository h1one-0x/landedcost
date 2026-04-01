import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LandedCost - Know Your True Import Cost",
  description: "Calculate the complete landed cost of any shipment from China to USA — duties, tariffs, freight, and fees — in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
