import Header from "@/components/customer/layout/Header";
import Footer from "@/components/customer/layout/Footer";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background font-body selection:bg-secondary-container">
      <Header />
      <div className="flex-grow pt-24">
        {children}
      </div>
      <Footer />
    </div>
  );
}
