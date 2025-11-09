import { Helmet } from 'react-helmet-async';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import ShowcaseSection from './ShowcaseSection';
import HowItWorksSection from './HowItWorksSection';
import TestimonialsSection from './TestimonialsSection';
import FinalCTASection from './FinalCTASection';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>AI Image Stylist - Biến ảnh của bạn thành tác phẩm nghệ thuật AI</title>
        <meta
          name="description"
          content="Hàng trăm style template, xử lý trong vài giây với công nghệ Gemini AI. Không cần kỹ năng chỉnh sửa, chỉ cần chọn template và upload ảnh."
        />
        <meta property="og:title" content="AI Image Stylist - Biến ảnh của bạn thành tác phẩm nghệ thuật AI" />
        <meta
          property="og:description"
          content="Hàng trăm style template, xử lý trong vài giây với công nghệ Gemini AI."
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <article>
        <HeroSection />
        <div className="section-divider" />
        <FeaturesSection />
        <div className="section-divider" />
        <ShowcaseSection />
        <div className="section-divider" />
        <HowItWorksSection />
        <div className="section-divider" />
        <TestimonialsSection />
        <div className="section-divider" />
        <FinalCTASection />
      </article>
    </>
  );
}

