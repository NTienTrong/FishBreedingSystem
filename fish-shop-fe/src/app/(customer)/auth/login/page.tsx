import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Layer with Blur */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover blur-md scale-105 opacity-60"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG8uzkDMPRJesL0CTg3X7sa1xwnUOWkhSdkOghCKMUdnIprjOK9ExuS3xwbjUyLJQiAmGQHHC2C6XJ3mIFjUkJpfcsCdrTtUbzinfP8MGpcCapHeS5yu7AOQhwZDLKf1GCvLn3HoV8Wza1aD6Mof-r-woN5HEusHmLLbqCwdRDqsltEwRJiwq7Naa62Smn4tOEONHBkhKn5dnB1BcJHwTzmNpnx-jBicPr4N9Puvrk4jwSO6JA_KGfVEj5OEKZ21sirWzBkIDe6bSA"
          alt="Koi pond background"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
      </div>

      {/* Main Content Shell */}
      <main className="relative z-10 w-full max-w-md my-12">
        <div className="bg-white/70 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] shadow-[0_20px_40px_rgba(25,28,30,0.08)] border border-white/30 transition-all duration-300">
          {/* Brand Anchor */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="mb-4 bg-primary p-3 rounded-full shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl">
                water_drop
              </span>
            </div>
            <h1 className="font-headline font-black text-4xl tracking-tighter text-primary mb-2">
              FishSync
            </h1>
            <p className="text-on-surface-variant font-medium text-sm">
              Quản lý nuôi trồng thủy sản chính xác
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6">
            {/* Username/Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="identifier">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  person
                </span>
                <input
                  className="w-full bg-surface-container-highest/50 border-none rounded-full py-4 pl-12 pr-6 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60"
                  id="identifier"
                  name="identifier"
                  placeholder="example@fishsync.com"
                  type="text"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  className="w-full bg-surface-container-highest/50 border-none rounded-full py-4 pl-12 pr-12 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    className="peer h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-highest transition-all"
                    type="checkbox"
                  />
                </div>
                <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Ghi nhớ tôi
                </span>
              </label>
              <Link
                className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                href="/auth/forgot-password"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Primary CTA */}
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-headline font-bold py-4 rounded-full shadow-lg transition-all transform active:scale-95 text-lg"
              type="submit"
            >
              Đăng nhập
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10 flex items-center">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="mx-4 text-xs font-bold uppercase tracking-widest text-outline">
              Hoặc tiếp tục với
            </span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-white/50 border border-white/20 rounded-full hover:bg-white transition-all group">
              <img
                alt="Google"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsqlMZNjUOl6m8aQSQVOeR5Op0dKy_Bb-lKMrmXtFvcv8OotbN3qGLJh2zPozlREOfxKycFAb8Cbxrr_ZRVKbR8g51oXPooCJ8m_RtNEU2FfyfbWHXSc07XNuOlddNkz0g1WdKTacNHnNDjkaM8roaFh5iKY1pwFfN-r5MQdZkakM4vjLaAYxYjAqdm_wbHuulry8xz8YHvFeNsJzgOCjzui10eymqdYqKGsSC8HX62sjX-it82bfzyu3Hljdw95WI8TA65ecDLZ-z"
              />
              <span className="text-sm font-semibold text-on-surface">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-white/50 border border-white/20 rounded-full hover:bg-white transition-all group">
              <img
                alt="Facebook"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6EHv_TzU08G8FmGJK3MKCQ_l1JKudqJ704Ehf4vultz0szCz8e8viT6qsdquPdc1ApS1O5K8sYxNjdhVZ_d9NZ0Fhe5Ie4G1EbfEyUVktDbSflEKY3Hw0Sr5dZlc13DLqtc3xxujbP7LqpdMl72FiHtCDaQdOIhISk_9Vq6-exJZt5GR4YdEdWJSMgNdp5kJu8nz6Q3d_KxS6gxebN9OBoO4qyy9MB1X0TQIcdbXB_d8Frh35gMSFs9oban01jrM_HpE8L2GNDvhn"
              />
              <span className="text-sm font-semibold text-on-surface">Facebook</span>
            </button>
          </div>

          {/* Registration Link */}
          <div className="mt-10 text-center">
            <p className="text-on-surface-variant">
              Chưa có tài khoản?
              <Link
                className="text-primary font-bold ml-1 hover:underline decoration-2 underline-offset-4"
                href="/auth/register"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Technical Footer Decoration */}
        <div className="mt-8 flex justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[12px]">
              verified_user
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Mã hóa AES-256
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[12px]">
              cloud_sync
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Phục hồi dữ liệu 24/7
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
