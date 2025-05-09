import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <div className="flex-grow overflow-y-auto content-center justify-center py-4 bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100">
        {children}
      </div>
      <Footer />
    </>
  );
}