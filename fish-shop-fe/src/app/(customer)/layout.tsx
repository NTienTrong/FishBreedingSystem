import Providers from "@/app/providers";
import CustomerShell from "@/components/customer/layout/CustomerShell";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <CustomerShell>{children}</CustomerShell>
    </Providers>
  );
}
