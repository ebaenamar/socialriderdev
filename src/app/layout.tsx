import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from '@/app/providers';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FeedFlip - Flip Your Social Feed Experience",
  description: "Turn your content discovery upside down. FeedFlip uses AI to curate diverse, meaningful content beyond the algorithm bubble. Experience short-form videos in a whole new way.",
  keywords: ["AI content curation", "YouTube shorts", "social media feed", "algorithm bubble", "content discovery", "diverse perspectives", "FeedFlip"],
  openGraph: {
    title: "FeedFlip - Flip Your Social Feed Experience",
    description: "Turn your content discovery upside down with AI-powered curation that breaks you free from the algorithm bubble.",
    type: "website",
  },
};



type RootLayoutProps = {
  children: any;
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
