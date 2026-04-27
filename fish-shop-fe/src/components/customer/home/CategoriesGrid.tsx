import Link from "next/link";

const CategoriesGrid = () => {
  const categories = [
    {
      id: 1,
      name: "Cá Koi",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuANoQD9s0k--a9zCz__2F6OcK0HvxpqEMad8ENRAcLiAZeE7rYzO7FHHRvg_HvtBnKl0JYFSNEKehCcoRspK1-YiOUq07Xs4KwpYvYhpQsaLqocOT7BLZG23T8PikV35qaEGymFoUmtk42BME11sPAT1TgMtnWNTxN6rstncIZUt1KTpNOavipKQ1AvTLDJnHjVaHrvKwppVj592kpPszXJgl-z3picDQgiHLVkDKEXl_LF4ldQboTOYRoj1ohAZxbXivcVtJmd_c0J",
    },
    {
      id: 2,
      name: "Cá Rồng",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhKQ0v3RIqeJBf6i-Mm-snlaivO-rxxBXH82HRGf6-OcF4AY-4EBFRaLSyoOjasNd8CYXeWQC7AJnk_e3QRjuLzUuXrLD5llOWyBzXTO-Fdo1r6ln3kLzIkKhksw8ACvWvTjaZgL1FR-SAwh_7KQM70ItWfRxzTox-22SulRQ2d0OQ7JoUxg3w_MxgeRjttxssZMtlkyPquTsO0fHhgT4nUvHc58HBZZymhdU9A1gVvFnQfWGPSxLLevvdiaSwAd3ppX_9ox-ZvGNh",
    },
    {
      id: 3,
      name: "Cá Vàng",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhYZRqV8pLCnfvA-GE-JrtOehUN0WYu7GCTSEEw33m8auVjqsdwIaQ0_vIbOw4xi_Gw__lgA99fYHAKvYttXbOTjmao-08SrN8UK3Pr4IrNxPGiwZGcNt926e7XAaR4lU0yHA4Jpqcvm9cUfYgzmCPdrViQRKI96Dbsg3zL00Y89_ogOoCgxUKSV1evHdN4oTlgxDCf9y2ShzVxnYbZO53qa6sr49ZnvCJhYyB1vTKfefXqqOK0zk4GlgSk7SDXA21nCFtaOoJ1L-C",
    },
    {
      id: 4,
      name: "Cá Betta",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrqE8JI9H8s5WusyvmrSxfJETaAH9DpN2hl8VFZ5Txy7ciq14NKNj_fKPGSXhf8Z0_UPYl2wnllGCfOoy-xK8tLY_g53jsuiG0wUBZyNGAzClr7RcX3Rs8B4RdyHAnAP_orsoJoaq4yMpgFaRLlcfbhPQf0aRibQosLHAPST4Gv5RtL_vgNBVOvwcvb2vml1RDaso9T79RpLmCcK3AYFv5za8Zxba2hGXO4QOBJdEOacxngaGn8gRM-8WWkkRLp9XhtvFfM3pZBjtD",
    },
    {
      id: 5,
      name: "Cá Đĩa",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf0mCUo0ILcgZCcI1VsRlrxN0VcZgCBt9iCr-9IbporHVNx61zKNagJTEyJdrJLO1cIQTs8wfvegUKBaHTkOMIu2YWcY6S8vPS1VMCPCNwkcscCZ0_NZYayhUM6KqoQ-dVY1p0Y6KVASzKmc1a8uxs0HcHNMbR4DwiB2P3AtXMpKRUW37j9FuJYdqUXtlnvNHUK5Z5bduKmPek-x_QtGIY9K9b0OEqvTguKN5BPZ2Boque0UnnoQh0Tt-utUDzzY4blt6GTJ7LOVil",
    },
    {
      id: 6,
      name: "Cá Bảy Màu",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNN_fVVk-xm-PwDbCKPJSVpTZeyqE9ZTEEoMeJ7AMeg-Vt4yDbzJOeryEgTwLeGQRw0vWn5z3Y0OC35PDZBNv0J4Rh3WrEURZXbFddj-0xwVIQk9SRNwOjIDvRgWqhWQME_9k0b8EG9lX2dMG_VWWn436IgyKRGGHxMc4banQJXysh5qaXZhi4Aq73fRpeyjquz4XqwRDSYwpp4hnb0vLcoMbOvRR5LKlxzCa8Tveyns06qwj15l4eP9SX-8sJc2chcQiCTZELEh-7",
    },
    {
      id: 7,
      name: "Cá Sam",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNHNnooapZd2586SLQVbiKip61XUrkqK68MPsCLegPDvIjbO17LC33THlNnrRVr_QFAne4vudAkl-XbALyCuS7DXsgal-Z1QGri12KN7xLbu7E9tG5JBfnBZZGgHk2db5L-3rqv0uq1rSNQ1o9PU95n_8voefct0X7dF9egCI58KWiHwD4A8W-9IQJ3AdTM2PzLMRCbf1xCrcQf9EDNnnRsf8eb7HyWyRMFwFT72rXgwXeTKLeiyEPhFwp3fyDP9N31pgacxvqbXif",
    },
    {
      id: 8,
      name: "Cá Cichlid",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWdBL1OTzAqUuc9O4vCP5X6jvf9cxFFdsdZYoxSBJIGW0toP6De_VJa42Rs7m_G-4jN6OkSyegZfcrSagt8njxOZdGrRyUkf_9nz24YEo6HjSMdqe7rm-iq9g_1xokKJLc90otJAwt5_5MvR4zfcc8FpGUj8T7ocitTjF2S1KsjP3BaS4fj7voJBBJNuqZqFhSkMnpqLip0jfiI6EdpA_Iqsr67LMgF9Vi0dnLZ0-F1UH6zRPlsa1vp64J1PYF83f95vz2_VnpE1k5",
    },
    {
      id: 9,
      name: "Cá Pleco",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBX_8vVcs1TSOIDmaodJQGeJ9bf9r6bsVp3XGmzf-6UM7egHwePdbjxi6qs8LZajulYVYCtR499MjIexEk-FUV86vZftoPnbHKhZhqDkSRr9awQ9_bYaaDY8UTM_08iDh2w9pM6_eWSfG8yyWTEMT5vp3kF_NCBv__EkKSTgErXilplXOZlLHTGzFbmVgCuRG0cZLO8rPhTH6FOEpgemlQciUB_P3R1mXjlH2E6OYhsQzQjb981zwZKXiITyvcnhVEuWOLkcWNEAiob",
    },
    {
      id: 10,
      name: "Cá Biển",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAb4-B3IsxrsY_vV4q9wO8hI1oxzRJ1z5lnSVs1bvGqJVIJy4dI7GP6nSv0qTD9e87o5Nb4Tpvdw4PGbhIR466qG4FSFGmtp9VzWLbRmultwzkLGurw3sS-UiRk2_1h8eoXe1mqUaQzUFVQS-AjI9wpM3F6sX4xQnca11PK5v2hQZDy0evxz-eitAmnErKyiDe_mV07MFfYgS31I1NorFevtut89rP-drxaHSl6f8GW2_yCgtBEAZ3cg3TJi-nyQ7O3Ql3fSAEhhmAG",
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black font-headline text-primary">Danh Mục Loài</h2>
          <p className="text-outline mt-2">Phân loại theo tiêu chuẩn thủy sinh học hiện đại</p>
        </div>
        <button className="text-primary font-bold hover:underline flex items-center gap-1">
          Xem tất cả <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="group cursor-pointer">
            <div className="aspect-square bg-surface-container-highest rounded-[2rem] overflow-hidden mb-4 transition-all group-hover:shadow-xl">
              <img
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src={cat.img}
              />
            </div>
            <h3 className="text-center font-bold text-primary">{cat.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesGrid;
