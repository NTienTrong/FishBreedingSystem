export default function AdminBlogPage() {
  return (
    <div className="p-8 min-h-[calc(100vh-72px)]">
      {/* Page Header Section */}
      <section className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Bài viết hệ thống</h1>
          <p className="text-on-surface-variant max-w-xl">Quản lý nội dung tin tức, hướng dẫn kỹ thuật nuôi trồng và thông tin vận hành từ trung tâm dữ liệu Hatchery.</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <span className="material-symbols-outlined">post_add</span>
          Thêm bài viết mới
        </button>
      </section>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="col-span-1 bg-surface-container-low p-6 rounded-2xl">
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">Tổng bài viết</p>
          <h3 className="text-3xl font-extrabold text-primary">124</h3>
          <div className="mt-4 flex items-center text-xs text-secondary font-semibold">
            <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
            +12% so với tháng trước
          </div>
        </div>
        <div className="col-span-1 bg-surface-container-low p-6 rounded-2xl border-l-4 border-secondary">
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">Đã xuất bản</p>
          <h3 className="text-3xl font-extrabold text-primary">108</h3>
          <p className="text-xs text-on-surface-variant mt-4">87% tỷ lệ nội dung sống</p>
        </div>
        <div className="col-span-1 bg-surface-container-low p-6 rounded-2xl">
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">Lượt xem tháng</p>
          <h3 className="text-3xl font-extrabold text-primary">14.2K</h3>
          <div className="mt-4 flex items-center text-xs text-tertiary font-semibold">
            <span className="material-symbols-outlined text-sm mr-1">visibility</span>
            Trung bình 450 lượt/ngày
          </div>
        </div>
        <div className="col-span-1 bg-surface-container-low p-6 rounded-2xl">
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">Bản nháp</p>
          <h3 className="text-3xl font-extrabold text-primary">16</h3>
          <p className="text-xs text-on-surface-variant mt-4">Cần duyệt: 4 bài mới</p>
        </div>
      </div>

      {/* Filters Tray */}
      <div className="bg-surface-container-high p-4 rounded-xl flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container-lowest px-4 py-2 rounded-lg gap-2 text-sm font-medium border border-outline-variant/15">
            <span className="text-on-surface-variant">Danh mục:</span>
            <select className="bg-transparent border-none outline-none focus:ring-0 text-primary font-bold pr-8 cursor-pointer">
              <option>Tất cả danh mục</option>
              <option>Kỹ thuật nuôi</option>
              <option>Dịch bệnh</option>
              <option>Thị trường</option>
              <option>Vận hành</option>
            </select>
          </div>
          <div className="flex items-center bg-surface-container-lowest px-4 py-2 rounded-lg gap-2 text-sm font-medium border border-outline-variant/15">
            <span className="text-on-surface-variant">Trạng thái:</span>
            <select className="bg-transparent border-none outline-none focus:ring-0 text-primary font-bold pr-8 cursor-pointer">
              <option>Mọi trạng thái</option>
              <option>Đã xuất bản</option>
              <option>Bản nháp</option>
              <option>Đã lên lịch</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-outline">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-outline">
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>

      {/* Content Table Area */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Bài viết</th>
              <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Tác giả</th>
              <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Ngày đăng</th>
              <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Danh mục</th>
              <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {/* Table Row 1 */}
            <tr className="hover:bg-surface-container-low/50 transition-colors">
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <img className="w-16 h-12 rounded-lg object-cover flex-shrink-0" alt="News Image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1_qnizlqc1xTjZCx9m-wLSDi-hTsddlMdXf8enXHSuW5e7Odfz3iGYb-bLm3KUSnlO7NhX9oV_6fXHOkIZT_eBrv6-52vS7gf-Oe_L2IIJ94k9ZM3p1GxKJ_1lIKK0JLQqjI0YPIGoD_NWQKiVXnuULYARedMOHd90ULTuYbIqbpBXpYcTKrJJ7hnwaJ4L9BScTSmKjlbmGp-fk6Ltuw7iiaFuhk6WPfvXaOTAI5-iGeAVNmWacgsrIvK3PYNuTC_aZmTsvaRk3J0" />
                  <div>
                    <h4 className="font-bold text-primary leading-tight mb-1">Tối ưu hóa nồng độ Oxy hòa tan trong bể ương dưỡng</h4>
                    <p className="text-xs text-on-surface-variant flex items-center">
                      <span className="material-symbols-outlined text-[14px] mr-1">visibility</span> 1,240 views
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">NL</div>
                  <span className="text-sm font-medium">Nguyễn Lâm</span>
                </div>
              </td>
              <td className="px-6 py-5 text-sm text-on-surface-variant">12/10/2023</td>
              <td className="px-6 py-5">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-md uppercase tracking-wider">Kỹ thuật</span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-secondary">
                  <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,105,114,0.4)]"></div>
                  <span className="text-xs font-bold">Đã xuất bản</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button className="p-2 hover:bg-error/10 rounded-lg text-error transition-colors">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </td>
            </tr>
            {/* Table Row 2 */}
            <tr className="hover:bg-surface-container-low/50 transition-colors">
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <img className="w-16 h-12 rounded-lg object-cover flex-shrink-0" alt="News Image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8thNVwZ9Ydk6oEbBHUEte6QmDqXl8AqSqtEDzieSr65AtA5jN5cfkPwhSz0JFbyxkWRiyAfOscZBefH_2KzQ8dHHJFgSVyyHAwBeo-5WUnnONDgCjsAyuLhDIfM32ewgmxFSiBzZWMqqEBfW49n0f8-0lhQNTAZm0-5EhpdUjHmz4awbPz1ym1NBh9dUGsKmUYGNe_Zds3J4Efq3U-7XLIn8tYfpaDumYzZ1ZNYSagqaiVnavXP6P2nnySHCSLjmz4ha0dq_YEpMf" />
                  <div>
                    <h4 className="font-bold text-primary leading-tight mb-1">Kiểm soát khuẩn Vibrio trong giai đoạn tôm giống</h4>
                    <p className="text-xs text-on-surface-variant flex items-center">
                      <span className="material-symbols-outlined text-[14px] mr-1">visibility</span> 856 views
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed-dim flex items-center justify-center text-on-tertiary-fixed font-bold text-xs">TH</div>
                  <span className="text-sm font-medium">Trần Hoàng</span>
                </div>
              </td>
              <td className="px-6 py-5 text-sm text-on-surface-variant">08/10/2023</td>
              <td className="px-6 py-5">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-md uppercase tracking-wider">Dịch bệnh</span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-outline">
                  <div className="w-2 h-2 rounded-full bg-outline"></div>
                  <span className="text-xs font-bold">Bản nháp</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button className="p-2 hover:bg-error/10 rounded-lg text-error transition-colors">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </td>
            </tr>
            {/* Table Row 3 */}
            <tr className="hover:bg-surface-container-low/50 transition-colors">
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <img className="w-16 h-12 rounded-lg object-cover flex-shrink-0" alt="News Image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKvI4lkd9xsqiATOardob9cF2RiRDstCLX_8ohREDWy3hFEGu-3p8rnlMxrwRzWj72UozoHnnrfdogL8OEoapLu7-xLUUZBQrIr_CbGDxGUhf3NCLPPz1SVYiG0ZenFu3fFXN9FjgeFQmWPGhSLhuQvmyorPeyzi7SVhvO0eDIobKK3_Kgv5U8hQ4yilj_rkNql_blQFB2497cXsDCbmQUztNUyOi9-_SFlcVJJ2n3-9uP7_TYPRIaYc6BxtNKxE1cgNhV8U4BmdhJ" />
                  <div>
                    <h4 className="font-bold text-primary leading-tight mb-1">Quy trình vận hành hệ thống lọc RAS thế hệ mới</h4>
                    <p className="text-xs text-on-surface-variant flex items-center">
                      <span className="material-symbols-outlined text-[14px] mr-1">visibility</span> 3,412 views
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-xs">Admin</div>
                  <span className="text-sm font-medium">Hệ thống</span>
                </div>
              </td>
              <td className="px-6 py-5 text-sm text-on-surface-variant">01/10/2023</td>
              <td className="px-6 py-5">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-md uppercase tracking-wider">Vận hành</span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-secondary">
                  <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,105,114,0.4)]"></div>
                  <span className="text-xs font-bold">Đã xuất bản</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button className="p-2 hover:bg-error/10 rounded-lg text-error transition-colors">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </td>
            </tr>
            {/* Table Row 4 */}
            <tr className="hover:bg-surface-container-low/50 transition-colors">
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <img className="w-16 h-12 rounded-lg object-cover flex-shrink-0" alt="News Image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfvYEBYQvu26R6bWVbTqhynryaZRXY2gu8QiunOCtjJQ_HAgqV-affQjNuJFw31GaoO49MeQHcCbGFif2lKy_VtBGV8XPpZjCRR65Syu2gK4uG53KWqQO2aLGh-LTjcSM4F72944hIWba1qlEyCgLQzPu4sCMIOsImRiEFSA9-sMpzUXxA8wq7zPSeC70jijTsKoQgPPkJRjG3YyVh04dfmgfz067wS7I-Xch-fX0A99V3KJv5Qu9IjbumfdVGeJpJrlgefawP32Cq" />
                  <div>
                    <h4 className="font-bold text-primary leading-tight mb-1">Xu hướng giá thức ăn thủy sản quý 4/2023</h4>
                    <p className="text-xs text-on-surface-variant flex items-center">
                      <span className="material-symbols-outlined text-[14px] mr-1">visibility</span> 2,105 views
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed-dim flex items-center justify-center text-on-secondary-fixed font-bold text-xs">PV</div>
                  <span className="text-sm font-medium">Phạm Văn</span>
                </div>
              </td>
              <td className="px-6 py-5 text-sm text-on-surface-variant">28/09/2023</td>
              <td className="px-6 py-5">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-md uppercase tracking-wider">Thị trường</span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-secondary">
                  <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,105,114,0.4)]"></div>
                  <span className="text-xs font-bold">Đã xuất bản</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button className="p-2 hover:bg-error/10 rounded-lg text-error transition-colors">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-6 bg-surface-container-low/30 border-t border-surface-container flex items-center justify-between">
          <p className="text-xs text-on-surface-variant font-medium">Hiển thị 1 - 4 trong tổng số 124 bài viết</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors text-outline">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-xs font-medium text-on-surface-variant">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-xs font-medium text-on-surface-variant">3</button>
            <span className="px-2 text-outline">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-xs font-medium text-on-surface-variant">31</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors text-outline">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
