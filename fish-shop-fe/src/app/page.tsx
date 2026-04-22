import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import FilterBar from "@/components/home/FilterBar";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import BlogSection from "@/components/home/BlogSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FilterBar />
        <FeaturedProducts />
        <WhyChooseUs />
        <BlogSection />
      </main>
      <Footer />
    </>
  );
}
