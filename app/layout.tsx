import type { Metadata } from "next";
import "./globals.css";
import NavBar from "../components/navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactQueryClientProvider } from "../components/react-query-client-provider";
import CreateProfileOnSignIn from "@/components/create-profile";

export const metadata: Metadata = {
  title: "AI investment Plans | Investment AI",
  description: "Generate personalized investment plans with proprietary AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-purple-50 text-gray-900">
        <ReactQueryClientProvider>
          <ClerkProvider>
            <CreateProfileOnSignIn />
            <NavBar />
            {/* Main container spanning full width */}
            <main className="w-full pt-16 p-4 min-h-screen">
              {children}
            </main>
            <footer className="bg-gray-800 text-white py-4 text-center">
                    <p style={{ margin: 0 }}>Not Investment Advice. Trade at your own risk.</p>
        </footer>
          </ClerkProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
    
  );
}