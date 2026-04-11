import { Inter } from "next/font/google";
import "./globals.css";
import TrackerIdentify from "@/components/authTracker/supabaseAuth";
import Script from "next/script";
import "flag-icons/css/flag-icons.min.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "TwoSeven",
  description: "Get High Quality Analytics for Your Website",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
    <script
  data-tracker-id="f53c5ee8-7afd-4cda-8782-4a606b722e7b"
  data-domain="twoseven.sakshamjain.dev"
  strategy="afterInteractive" 
  data-allow-localhost="true" 
  data-debug="true" 
  src="https://twoseven.sakshamjain.dev/tracker.js">
</script>
        <TrackerIdentify />
        {children}
      </body>
    </html>
  );
}
