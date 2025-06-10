'use client';

import "../globals.css";
import Navbar from "@/components/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex-grow overflow-y-auto content-center justify-center py-4 min-h-screen">
        {children}
      </div>
    </>
  );
}