import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import AdminNavbar from "@/components/AdminNavbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InterviewLab Admin - Dashboard",
  description: "Panel de administración para instituciones en InterviewLab",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <AdminNavbar />
        <div className="flex-grow"> {/* Añadimos margen superior para compensar el navbar fijo */}
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}