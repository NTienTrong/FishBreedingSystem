import React from "react";
import Link from "next/link";

const blogPosts = [
  {
    category: "Kỹ thuật cơ bản",
    title: "Cách dưỡng cá mới về: Quy trình 5 bước chống sốc nước",
    description: "Việc thả cá ngay vào bể có thể gây ra hiện tượng sốc nhiệt hoặc pH. Tìm hiểu quy trình thích nghi chuyên sâu từ chuyên gia.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6GcqCKhAc3BTRAYJFqkdFcZ6hw5Sto6D7Y_Yu6lYO2zo5VuGRveCafYmMvr6-GmV1oIGLO60T5YjdnKMkzomLFIO2Df11K12GOqUFvZgF7a-ffxrz-X8wy9e3j4QCrJ2ljz3bzqbJcSfirAmL4_7i-FocmmE46njEDjwLHjnCDVphW_G52n_mDkuqi_3ZsrMY7rholXz0UF88EwwO-IjSJEO9dMi3qtfGeBxVD_rPqX4N9xRYqnEnPP-E-oEmzqTw2DQ4ozGKiEC5"
  },
  {
    category: "Môi trường nước",
    title: "Tầm quan trọng của pH: Tại sao cá Koi cần pH 7.5?",
    description: "Độ pH ảnh hưởng trực tiếp đến khả năng trao đổi chất và màu sắc của cá. Làm thế nào để duy trì pH ổn định?",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ2qBEfUqj2XajDnoBcvKG9RkxViEJzEKFmjWEW66Sa1wCW8-AMy7JGUJidoIAMADUv2-fXlfJOFLY-0_WJ30l-QH7yOURVwngEXTxEvyI9_SPRomq1ViX-XcnfIShf0rKiICHCCDf2yY6sP4yKq51C4lu1CVTG4D0KXq2NmLMUDbbExcusIv_6GVHwdeo2ECqq4KQstQE0ogDc_utsxkr9BAruk3WXphg8_GjqcbmrT9vthDRKq8MuhKX9Yk5tbpYTceasGO59GRM"
  },
  {
    category: "Dinh dưỡng",
    title: "Chế độ ăn tăng trưởng và tăng màu cho cá Rồng mùa đông",
    description: "Nhiệt độ thấp làm chậm quá trình tiêu hóa. Hãy điều chỉnh lượng đạm phù hợp để tránh bệnh đường ruột.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA_UDgPg7-TKFpdnETBNFwyySkPc7FHRITQzizM1cwggbiA32PAjAW8ROEjZkfXDWHXzbIdcx52erc8JXYzi9CcdNN1BCyoX94I4nMDie8BALahq2Ij29mbYvfCDvVpQ_jg56v9IZ_9eUEwuIgOoXr8QUM6FzV7DW4b3M0VeyUvDR1aPBCG0vmacvmYDt6IUBlRoQ-zeYWKlnl49YWzI8UQ1FI_1PElNNjg_SXFxggZpVlBdIV1Ikk7A6njV2s4JxsVwwT7ImfD95D"
  }
];

export default function BlogSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-20">
      <div className="flex items-center justify-between mb-12">
        <h2 className="font-headline text-3xl font-black text-primary">Cẩm nang Kỹ thuật</h2>
        <Link href="#" className="text-primary font-bold hover:underline">Tất cả bài viết</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogPosts.map((post, idx) => (
          <article key={idx} className="flex flex-col group cursor-pointer">
            <div className="aspect-video rounded-xl overflow-hidden mb-5">
              <img alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={post.image} />
            </div>
            <div className="space-y-3">
              <span className="text-tertiary font-bold text-xs uppercase tracking-widest">{post.category}</span>
              <h3 className="font-headline text-xl font-extrabold text-on-surface group-hover:text-primary transition-colors leading-tight">
                {post.title}
              </h3>
              <p className="text-on-surface-variant text-sm line-clamp-2">
                {post.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
