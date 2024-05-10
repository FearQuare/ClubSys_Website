import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import SessionProvider from "../../SessionProvider";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { SearchProvider } from '@/contexts/SearchContext';
import 'leaflet/dist/leaflet.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClubSys",
  description: "ClubSys Home Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SearchProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="mt-20 ml-5 flex-1 overflow-auto">
                <SessionProvider>
                  {children}
                </SessionProvider>
              </main>
            </div>
          </div>
        </SearchProvider>
      </body>
    </html>
  );
}
