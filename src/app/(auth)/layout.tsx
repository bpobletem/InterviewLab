import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <div className="flex-grow overflow-y-auto content-center justify-center py-4 bg-radial from-white from-40% to-gray-100">
        {children}
      </div>
      <Footer />
    </>
  );
}