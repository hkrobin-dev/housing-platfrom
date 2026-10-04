import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Housing & Roommate Platform",
  description: "Find rooms, match with roommates, manage your tenancy — all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ChatWidget />
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
