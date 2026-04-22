import ProductForm from "@/components/admin/ProductForm";

export default function AdminProductsEditPage({ params }: { params: { id: string } }) {
  // Thực tế sẽ fetch dữ liệu theo params.id ở đây
  return <ProductForm isEdit={true} />;
}
