import { motion } from 'framer-motion';
import { Download, ArrowRight, Sparkles } from 'lucide-react';
import Container from '../../components/common/Container';
import GlassButton from '../../components/common/GlassButton';
import GlassCard from '../../components/common/GlassCard';

export default function FinalCTASection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden" aria-label="Final CTA section">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-1/30 to-transparent" />
      
          <Container maxWidth="constrained">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <GlassCard padding="lg" className="max-w-5xl mx-auto text-center hover-lift">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              className="inline-block mb-6 lg:mb-8"
            >
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-accent-1" strokeWidth={2} />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8">
              Sẵn sàng bắt đầu?
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-secondary mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed">
              Tải về iOS App ngay bây giờ và bắt đầu tạo những tác phẩm nghệ thuật AI
              tuyệt đẹp chỉ trong vài giây!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center mb-6 lg:mb-8">
              <GlassButton size="lg" variant="primary" className="w-full sm:w-auto shadow-glass-xl group text-lg lg:text-xl px-10 lg:px-12 py-5 lg:py-6">
                <Download className="w-5 h-5 lg:w-6 lg:h-6 mr-2 inline-block group-hover:animate-bounce" />
                Tải về miễn phí
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </GlassButton>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm lg:text-base text-secondary">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Miễn phí</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Không cần thẻ tín dụng</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>50 ảnh/tháng</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </Container>
    </section>
  );
}


