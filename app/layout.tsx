import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/ThemeProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const numeral = IBM_Plex_Mono({
  variable: "--font-numeral",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Time Arena — Train your focus",
  description: "Enter the arena, pick a category, and train focus one round at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${numeral.variable} antialiased`}
      >

        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>

      </body>
    </html>
  );
}
