import Navbar from "@/components/navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <div className="flex-grow overflow-y-auto content-center justify-center py-4 w-full">
        {children}
      </div>
    </>
  );
}