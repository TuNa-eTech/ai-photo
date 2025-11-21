import React from 'react';
import CompareSlider from '../components/ui/CompareSlider';
import GradientButton from '../components/ui/GradientButton';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
          Biến ảnh thường thành <br />
          <span className="text-gradient">kiệt tác</span> chỉ với 1 cú chạm.
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Sử dụng sức mạnh của AI để chỉnh sửa, phục hồi và biến hóa hình ảnh của bạn trong tích tắc. Không cần kỹ năng, chỉ cần ý tưởng.
        </p>

        <div className="flex justify-center gap-4 mb-16">
          <GradientButton icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}>
            Tải ngay trên iOS
          </GradientButton>
        </div>

        {/* Demo Slider */}
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-accent-gradient rounded-2xl opacity-20 blur group-hover:opacity-40 transition duration-500" />
          <div className="relative bg-dark rounded-2xl p-2 border border-glass-border">
            <CompareSlider
              beforeImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
              afterImage="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
              beforeLabel="Ảnh gốc"
              afterLabel="AI Studio"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
