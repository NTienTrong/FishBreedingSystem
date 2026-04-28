import Link from "next/link";
import { API_URL } from "@/app/config/api";
import { CategoryResponse } from "@/types/category";

const FALLBACK_CATEGORY_IMAGE = "https://via.placeholder.com/300?text=No+Image";

const CategoriesGrid = async () => {
  let categories: CategoryResponse[] = [];

  try {
    const res = await fetch(`${API_URL}/api/public/categories`, {
      cache: "no-store", // Fetch fresh data on every request
    });
    if (res.ok) {
      categories = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black font-headline text-primary">Danh Mục Loài</h2>
          <p className="text-outline mt-2">Phân loại theo tiêu chuẩn thủy sinh học hiện đại</p>
        </div>
        <Link href="/products" className="text-primary font-bold hover:underline flex items-center gap-1">
          Xem tất cả <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      </div>
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories
            .filter((cat) => cat.parentId === null)
            .slice(0, 10)
            .map((cat) => (
            <Link href={`/products?category=${cat.slug}`} key={cat.id} className="group cursor-pointer">
              <div className="aspect-square bg-surface-container-highest rounded-4xl overflow-hidden mb-4 transition-all group-hover:shadow-xl">
                <img
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={cat.imageUrl || FALLBACK_CATEGORY_IMAGE}
                />
              </div>
              <h3 className="text-center font-bold text-primary">{cat.name}</h3>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-outline">Chưa có danh mục nào.</div>
      )}
    </section>
  );
};

export default CategoriesGrid;
