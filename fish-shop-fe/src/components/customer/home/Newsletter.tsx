const Newsletter = () => {
  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-high h-64 rounded-3xl overflow-hidden">
              <img
                alt="Lab"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1UUUwAhbv51sfAdya90dddZCrHMXwgyexoMvTAlj7MnTNMFDTXyoEcwQLnrqCjcuymqbwRt17A2Sv7wepsqBXg-MlMILgviXXUGPEEwb27FpVoj4umi3Xfa_SnvZY_EsxyfpVqRgfpG9I8C_T9aVZ7PjEZAIHup3E3RMvzLHZB8q3-IDJfne83XqEzcKzGbKEVXD_ian9U7L2UKaaTRBGqMTlRUKTzW0tQsVhellCGWKkCtXJb67i75T8DZXn5ImixzH5CU2LYGlj"
              />
            </div>
            <div className="bg-surface-container-high h-64 rounded-3xl overflow-hidden translate-y-8">
              <img
                alt="Feeding"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMOI8fK5gRCamOhBvwvjOxf6WmizUCB7aM32yKgX-pdI9jT81V4OlV0hvJ_LO_l4FBAWDVv_eIL9fRPeQZI5U40YhGY7ryeRkKqH0PkijAplRCsiD9wB3SUSKnEzhnj9pVe35P_Xq4VTl5j1HjOeW8X5Rag6SuJ7_CfTL141JcPGe3B1Ya54p-L6i4m-4LLBPBir0PkuIr9oGfZdy8J8olqAZ5iQrHB31Eoya2WyXUXbPZpZIqdPsB1sresOOozIRK4Yx5oz5RyyUs"
              />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-black font-headline text-primary mb-6">
            Cam kết độ chính xác sinh học
          </h2>
          <p className="text-on-surface-variant mb-8 text-lg leading-relaxed">
            Tại FishSync, chúng tôi không chỉ bán cá. Chúng tôi cung cấp giải
            pháp nuôi trồng thủy hải sản tích hợp công nghệ. Mỗi cá thể xuất
            xưởng đều đi kèm hồ sơ sinh học điện tử và chứng nhận sức khỏe Labs.
          </p>
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-3xl">
                verified_user
              </span>
              <span className="font-bold">100% Thuần Chủng</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-3xl">
                biotech
              </span>
              <span className="font-bold">Kiểm Định Labs</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-3xl">
                local_shipping
              </span>
              <span className="font-bold">Vận Chuyển An Toàn</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-3xl">
                support_agent
              </span>
              <span className="font-bold">Hỗ Trợ Kỹ Thuật 24/7</span>
            </div>
          </div>
          <div className="flex gap-4 p-2 bg-surface-container-high rounded-full focus-within:ring-2 ring-primary transition-all">
            <input
              className="bg-transparent border-none focus:ring-0 px-6 flex-grow font-medium"
              placeholder="Nhận bản tin chuyên môn..."
              type="email"
            />
            <button className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-container transition-all">
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
