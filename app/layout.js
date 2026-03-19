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
          data-tracker-id="93edf309-7f8f-4066-9bb5-aef26765dffc"
          data-domain="www.cramai"
          strategy="afterInteractive" 
          data-allow-localhost="true"
          data-debug="true"
        />
      </body>
    </html>
  );
}
