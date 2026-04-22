import React from "react";

export default function FilterBar() {
  return (
    <section className="relative z-30 -mt-12 max-w-7xl mx-auto px-4 sm:px-10 w-full pb-8">
      <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-6 lg:p-8 border border-outline-variant/10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="shrink-0 w-full lg:w-auto text-center lg:text-left">
            <h3 className="font-headline text-xl font-extrabold text-primary justify-center lg:justify-start flex items-center gap-2">
              <span className="material-symbols-outlined">science</span>
              Bộ lọc Bio-Search
            </h3>
            <p className="text-on-surface-variant text-sm mt-1">Tìm giống cá phù hợp theo chỉ số nước</p>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* pH Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-on-surface">Độ pH lý tưởng</span>
                <span className="text-sm font-black text-primary bg-primary-fixed px-3 py-1 rounded">6.5 - 8.0</span>
              </div>
              <div className="relative h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="absolute h-full left-[20%] right-[30%] bg-primary rounded-full"></div>
              </div>
            </div>
            {/* Temp Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-on-surface">Nhiệt độ (°C)</span>
                <span className="text-sm font-black text-primary bg-primary-fixed px-3 py-1 rounded">20°C - 30°C</span>
              </div>
              <div className="relative h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="absolute h-full left-[30%] right-[20%] bg-secondary rounded-full"></div>
              </div>
            </div>
          </div>
          <button className="w-full lg:w-auto shrink-0 bg-primary text-on-primary px-8 py-4 rounded-lg font-headline font-bold hover:bg-primary-container transition-colors shadow-lg">
            Tìm cá phù hợp
          </button>
        </div>
      </div>
    </section>
  );
}
