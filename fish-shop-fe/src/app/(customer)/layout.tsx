import CustomerShell from "@/components/customer/layout/CustomerShell";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CustomerShell>{children}</CustomerShell>
  );
}
