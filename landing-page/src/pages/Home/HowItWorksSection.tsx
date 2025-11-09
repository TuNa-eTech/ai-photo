import { motion } from 'framer-motion';
import { Download, Layout, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Container from '../../components/common/Container';
import GlassCard from '../../components/common/GlassCard';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
}

const steps: Step[] = [
  {
    icon: Download,
    title: 'Tải app',
    description: 'Tải về iOS App từ App Store',
    detail: 'Miễn phí, không cần thẻ tín dụng',
  },
  {
    icon: Layout,
    title: 'Chọn template',
    description: 'Browse và chọn template yêu thích',
    detail: '100+ templates đa dạng',
  },
  {
    icon: Upload,
    title: 'Upload ảnh',
    description: 'Chọn ảnh từ Photos library',
    detail: 'Hỗ trợ nhiều định dạng',
  },
  {
    icon: CheckCircle,
    title: 'Nhận kết quả',
    description: 'Lưu và chia sẻ ảnh đã xử lý',
    detail: 'Chất lượng cao, không watermark',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-32 relative" aria-label="How it works section">
      <Container maxWidth="constrained">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4"
          >
            Cách sử dụng đơn giản
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-secondary max-w-2xl mx-auto"
          >
            Chỉ 4 bước đơn giản để có ảnh nghệ thuật AI tuyệt đẹp
          </motion.p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative mb-12 xl:mb-16">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-1 via-primary-2 to-primary-1 -translate-y-1/2 rounded-full" />
          
          <div className="grid grid-cols-4 gap-6 xl:gap-10 relative">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Step Number Circle */}
                  <div className="flex justify-center mb-6 xl:mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent-1 rounded-full blur-xl opacity-50" />
                      <div className="relative w-16 h-16 xl:w-20 xl:h-20 rounded-full bg-primary-2 flex items-center justify-center shadow-glass-lg">
                        <span className="text-2xl xl:text-3xl font-bold text-primary">{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  <GlassCard hover className="h-full text-center group hover-lift" padding="lg">
                    <div className="inline-flex items-center justify-center w-14 h-14 xl:w-16 xl:h-16 rounded-xl glass-card mb-4 xl:mb-6 group-hover:shadow-glass-lg transition-shadow">
                      <IconComponent className="w-7 h-7 xl:w-8 xl:h-8 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl xl:text-2xl font-semibold text-primary mb-2 xl:mb-3">
                      {step.title}
                    </h3>
                    <p className="text-secondary leading-relaxed text-sm xl:text-base mb-2 xl:mb-3">
                      {step.description}
                    </p>
                    <p className="text-xs xl:text-sm text-secondary opacity-80">
                      {step.detail}
                    </p>
                  </GlassCard>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-8 xl:top-10 -right-3 xl:-right-5 z-10">
                      <ArrowRight className="w-6 h-6 xl:w-8 xl:h-8 text-primary-2" strokeWidth={3} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet Vertical Layout */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <GlassCard className="flex gap-4 items-start" padding="md">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent-1 rounded-full blur-lg opacity-40" />
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-2 flex items-center justify-center shadow-glass">
                        <span className="text-lg sm:text-xl font-bold text-primary">{index + 1}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="glass-card p-2 rounded-lg">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-primary">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-secondary leading-relaxed text-sm sm:text-base mb-2">
                      {step.description}
                    </p>
                    <p className="text-xs text-secondary opacity-80">
                      {step.detail}
                    </p>
                  </div>
                </GlassCard>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-3">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-primary-2 to-transparent" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}


