import Hero from "@/components/customer/home/Hero";
import CategoriesGrid from "@/components/customer/home/CategoriesGrid";
import FeaturedProducts from "@/components/customer/home/FeaturedProducts";
import Newsletter from "@/components/customer/home/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoriesGrid />
      <FeaturedProducts />
      <Newsletter />
    </>
  );
}
