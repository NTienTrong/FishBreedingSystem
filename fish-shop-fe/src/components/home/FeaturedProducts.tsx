import React from "react";
import Link from "next/link";

const featuredProducts = [
  {
    sku: "HP-K001",
    name: "Koi Kohaku Ginrin F1",
    temp: "22-28°C",
    ph: "7.0-7.5",
    price: "1.250.000đ",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJdEEM9Hk2JOoROLCfypPw6dqP-HinGQcRPGIeUjwjGz_H4jFjr09Ewri3wJ3zBsbpDl2gnUVsho6JN-BhdqLk2YFmhHM5I19DG4KHMFHBJIWZx2OcCayNlEx4jYhNPRCIkII6jvjVohCrDixSkjqYnxN453Ilfs3AgABmPirV2ncGJTGHZYZymc3QEZWICF9f0viTP79zSGhxgOg5z16bcOr8mut9SOvS_GJFg4ztpOTjBTHCO3JCYHHA5dS-81PaqGMvaMs7fKuS",
    badge: "SẮP HẾT HÀNG",
    badgeColor: "bg-tertiary text-white",
  },
  {
    sku: "HP-R042",
    name: "Kim Long Quá Bối 24K",
    temp: "26-30°C",
    ph: "6.5-7.0",
    price: "8.900.000đ",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm41ffcGhSHRKzWELOLu1B-sH-Q6e0ZUOiBpuMYNT1Aq_IyEQlG1FHATQop_rcf-No6PsOl3D4jTMvjk3lJpT_Y-MrzFg_Jo6lP7EdAKbW0QXSUghOgGriQL9C80mk4trSLTLg88dP11pNN4wLDEFoCwE0zGlIcufJmMuxVRpCfu23BaS2_h0f-_91rcpcaw56vm8zsgCEZfph4ln6o8zmj4S3X9PdL-7fYQxN4pknAlLUswZ6QrWVnYEXUG-Ve0S5JNoZVEs6gqLX",
  },
  {
    sku: "HP-G015",
    name: "Oranda Ngũ Sắc Thái",
    temp: "18-24°C",
    ph: "7.0-8.0",
    price: "450.000đ",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7PNVGl_zjQuUAaiByXfmc9BdgqVRTDg0BAkJxgKkn7OAYxR0f9ddbdL3jdx-e0iZ-L6nmXA5fGsaN9wl79u_juo2owVvzEyzDshrBbhiUI55OaQVeS3wI4E-DS97lPjVWJfox-4jKxQjSf4UBT-0zMUxp_qTjtciW0tRsyY6sk2C20x1fcLaa3cKZCKw_oZJQCeqnzEPNe9puHHXGyz1GNUz8VYr2tP4nrM-XCX_QfSlfnHhwo9tgKWG_rXxoWzR5-iWiCvcGDoi4",
  },
  {
    sku: "HP-B009",
    name: "Betta Blue Rim AAA+",
    temp: "25-28°C",
    ph: "6.8-7.2",
    price: "750.000đ",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdMRCf28tTW4UOw79jYSa4BBejh3avj8nfMA4Ki3xzD1JyvsNhKhm0toI8rOuIDH6h59jnpv6WZ_GnsJrB-eSv6zZgyZIMT90owfxTccefO6FazSKs-ajXQri2Xw7mbiK5sJa9e1BEfW1i0t9vZQJL_tGiXsFAaA-ygEznkPKXC-9_obudFwyQnzkQvQXN14174CJ126BdBAwaBGecrYGNvaSyA9bpkCIBWJcb3UEBzr7mMyibDkWO-CZICLvC_NBvScyTfU3dj77q",
    badge: "MỚI VỀ",
    badgeColor: "bg-secondary text-white",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-20">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="font-headline text-3xl font-black text-primary">Sản phẩm tiêu biểu</h2>
          <p className="text-on-surface-variant mt-2">Dòng giống F1 thuần chủng, đã qua kiểm định y tế</p>
        </div>
        <Link href="#" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline underline-offset-4">
          Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product, idx) => (
          <div key={idx} className="group bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container-highest transition-all">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={product.image} />
              {product.badge && (
                <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded ${product.badgeColor}`}>
                  {product.badge}
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col h-full">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">SKU: {product.sku}</span>
              <h3 className="font-headline font-extrabold text-on-surface text-lg mt-1 group-hover:text-primary transition-colors flex-1">
                {product.name}
              </h3>
              
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-secondary">
                  <span className="material-symbols-outlined text-sm" style={{ fontSize: "14px" }}>thermostat</span> {product.temp}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-secondary">
                  <span className="material-symbols-outlined text-sm" style={{ fontSize: "14px" }}>water_ph</span> {product.ph}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-5">
                <span className="text-xl font-black text-primary">{product.price}</span>
                <button className="size-10 flex items-center justify-center bg-primary text-on-primary rounded-full hover:cta-gradient shadow-md transition-all">
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
