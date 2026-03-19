import { Inter } from "next/font/google";
import "./globals.css";
import TrackerIdentify from "@/components/authTracker/supabaseAuth";
import Script from "next/script";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "TwoSeven",
  description: "Get High Quality Analytics for Your Website",
  icon: '/icon.png'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
          <link rel="icon" href="/icon.png" />
          
      </head>
      <body className={`${inter.className} antialiased`}>
        <TrackerIdentify />
        {children}
        <Script
          src="/tracker.js"
          data-tracker-id="f53c5ee8-7afd-4cda-8782-4a606b722e7b"
          data-domain="www.cramai"
          strategy="afterInteractive" 
          data-allow-localhost="true"
          data-debug="true"
        />
      </body>
    </html>
  );
}
