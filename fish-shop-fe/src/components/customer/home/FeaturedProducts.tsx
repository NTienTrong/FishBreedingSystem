const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: "Koi Kohaku Ginrin",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHZYTftP2BbupjUVw7cyf2gMuGULHXxGxevFslvzTPYBf-r9mcI9ORwi0uz55XGgHdOvew5UPQQ5A3U2wxhR9Vq9S6CQJEgCWJ82lZ8f6ymBpVp6yy6D7gmfNk842cUDLhb_ZEx9kQC74GSvSGNKxgqYPD-PHHifHHMamQPUxBnCe9khdyl6NgwzchU2R7PJZMaUbp2ODqAHICbQwbyACJZ45zJmrMhTWi8ATX_1Cp1GgnyIkCis7XDw82cuKsbeoTGxzExiFY1YtW",
      tag: "Certified",
      desc: "Size: 35-40cm | Tuổi: 2 năm",
      price: "15.500.000đ",
    },
    {
      id: 2,
      name: "Huyết Long 24K",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYNxCUHYatePdlXshEwszTWeDHfmlP4HSBXfIZRYsJoYQstdru7njUtKBj7Lhpy93_vPG-MnagqeLDzMy10gMys5d8BUmCaonJgQ0FpDpbne4aTh07AUWXhKprQVL8qa6TBvcckr5KebHkd8Kd2dVP125lIcBlmBx88dB9Iiyaxa-1z8ml_8JrOckCWYBBvnptKLVSXDgDze4-sxV2Z1Xyiqs6zc3At1BLTIC9lH1OoGqy-Qd2mzeL6bIwF8-QCVsaRYPsAoZ5YtHJ",
      desc: "Nguồn gốc: Indonesia | Chip: 789xxx",
      price: "42.000.000đ",
    },
    {
      id: 3,
      name: "Showa Sanshoku",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMJLZciThqmTnMwWwwY3SrS2Im-AWUWNNTXn43ueHjbzfoms1GkAXKuZE_w2RfOmhniwYly0gGFHELlVwRwFJzmuu2EmQgkc9TlaGHCncpruj2wdIYLC9mVHMY7ewKDYvgW5EmwqyCB_P4t-OCpqdSFw3a5o8YuP1NDPLyd_8oXNzyFcxK8_L4obbyh-C7XDIa_QwrAJq8obURLkt3yeO7WDBAj4O-bjRHbAJ1xc3sf2ykx7OdTqiSvkBhSpXc3NWLgCpeRYt7jCV_",
      desc: "Trại: Dainichi | Body: Cực chuẩn",
      price: "28.900.000đ",
    },
    {
      id: 4,
      name: "Ranchu Japan Grade S",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuLoQLyZ06Bk-i5TOlVts-wd2o8zMK7o_gQyojHradivvGm8UEvq_7oPoUYB6JkH_mXyRQGPLeU_4rjC7hSwuc67XTBlURVbTbEqPXHFLpXTYwF1-vCV9JzB-QTOtrN37qqxMgkY63dB4FQlmB40OHsY3qc-pmdCVxxX-MK_KQ4hDS7Uxk7NVKGJ9iZsIcSK8WW1Bns87LyvrcLNXzJpFSluALx8kQlehRGgkscWikPU7B1cGL8mzg1-aF5fWX3rsHRdmj4wIZAGMI",
      desc: "Màu: Đỏ trắng | Hình dáng: Cân đối",
      price: "3.500.000đ",
    },
  ];

  return (
    <section className="bg-surface-container-low py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl font-black font-headline text-primary tracking-tight">
            Sản Phẩm Nổi Bật
          </h2>
          <div className="h-1 w-24 bg-tertiary-container mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-surface-container-lowest rounded-3xl overflow-hidden group transition-all duration-300 hover:shadow-[0_20px_40px_rgba(25,28,30,0.06)] flex flex-col h-full"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={product.img}
                />
                {product.tag && (
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase">
                    {product.tag}
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-primary font-headline">
                    {product.name}
                  </h3>
                  <span className="material-symbols-outlined text-outline cursor-pointer hover:text-red-500 transition-colors">
                    favorite
                  </span>
                </div>
                <p className="text-sm text-outline-variant mb-6">{product.desc}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-2xl font-black text-secondary">
                    {product.price}
                  </span>
                  <button className="p-3 bg-surface-container-high rounded-full hover:bg-primary hover:text-white transition-all">
                    <span className="material-symbols-outlined">
                      add_shopping_cart
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
