'use client';

import "../globals.css";
import AdminNavbar from "@/components/AdminNavbar";
import Footer from "@/components/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminNavbar />
      <div className="flex-grow overflow-y-auto content-center justify-center bg-radial from-white from-40% to-gray-100 py-4">
        {children}
      </div>
      <Footer />
    </>
  );
}