import { motion } from 'framer-motion';
import { Download, Play } from 'lucide-react';
import Container from '../../components/common/Container';
import GlassButton from '../../components/common/GlassButton';
import TrustBadges from '../../components/common/TrustBadges';

export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 min-h-[85vh] lg:min-h-[90vh] flex items-center" aria-label="Hero section">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 lg:w-48 lg:h-48 xl:w-64 xl:h-64 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #F4E4C1, #E8D5D0)' }} />
      <div className="absolute bottom-20 right-10 w-40 h-40 lg:w-56 lg:h-56 xl:w-72 xl:h-72 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #D4C4B0, #F5E6D3)' }} />
      
      <Container maxWidth="constrained">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4 sm:mb-6"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-1 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-1"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-primary">Mới ra mắt trên iOS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8 leading-[1.1]"
            >
              Biến ảnh của bạn thành{' '}
              <span className="bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
                tác phẩm nghệ thuật AI
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl xl:text-2xl text-secondary mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Hàng trăm style template, xử lý trong <strong className="text-primary">vài giây</strong> với công nghệ Gemini AI.
              Không cần kỹ năng chỉnh sửa - chỉ cần chọn template và upload ảnh.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8"
            >
              <GlassButton size="lg" variant="primary" className="w-full sm:w-auto shadow-glass-lg group">
                <Download className="w-5 h-5 mr-2 inline-block group-hover:animate-bounce" />
                Tải về iOS App
              </GlassButton>
              <GlassButton size="lg" variant="secondary" className="w-full sm:w-auto">
                <Play className="w-5 h-5 mr-2 inline-block" />
                Xem Demo
              </GlassButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xs sm:text-sm text-secondary mb-6 sm:mb-8"
            >
              ✨ Miễn phí • Không cần thẻ tín dụng • 50 ảnh/tháng
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <TrustBadges />
            </motion.div>
          </div>
          
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative order-1 lg:order-2"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 lg:-inset-8 bg-gradient-to-br from-accent-1/30 to-accent-2/30 rounded-3xl blur-3xl opacity-60" />
            
            <div className="relative glass-card p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-hidden">
              <motion.img
                src="/image_mock.png"
                alt="AI Image Stylist App Preview - Transform your photos into AI art"
                className="w-full h-auto rounded-lg shadow-glass-lg"
                loading="eager"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 lg:-top-8 lg:-right-8 glass-card px-4 sm:px-5 lg:px-6 py-2 sm:py-3 shadow-glass-lg"
            >
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm sm:text-base lg:text-lg">⭐</span>
                  ))}
                </div>
                <span className="text-xs sm:text-sm lg:text-base font-bold text-primary">4.8</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}


