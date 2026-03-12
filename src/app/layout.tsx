import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Watchful Eye — Real-Time Satellite Tracker",
  description:
    "Real-time 3D satellite tracking dashboard with live telemetry, orbital visualization, satellite history, and mission control aesthetics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
