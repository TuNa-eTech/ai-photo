import { motion } from 'framer-motion';
import { Zap, Palette, Sparkles, Lock, DollarSign, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Container from '../../components/common/Container';
import GlassCard from '../../components/common/GlassCard';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: 'Nhanh chóng',
    description: 'Xử lý ảnh trong vài giây với công nghệ AI Gemini 2.5 Flash. Không cần chờ đợi lâu, kết quả ngay lập tức.',
    stat: '< 30s',
    statLabel: 'Thời gian xử lý',
  },
  {
    icon: Palette,
    title: 'Đa dạng',
    description: 'Hàng trăm style template cho mọi phong cách - từ artistic, vintage đến modern. Cập nhật template mới hàng tuần.',
    stat: '100+',
    statLabel: 'Templates',
  },
  {
    icon: Sparkles,
    title: 'Chất lượng cao',
    description: 'Kết quả đẹp mắt, độ phân giải cao với AI Gemini 2.5 Flash Image. Giữ nguyên chất lượng ảnh gốc.',
    stat: '4K',
    statLabel: 'Resolution',
  },
  {
    icon: Lock,
    title: 'Riêng tư 100%',
    description: 'Không lưu ảnh trên server, chỉ lưu local trên thiết bị của bạn. Ảnh được mã hóa với iOS FileProtection.',
    stat: '0%',
    statLabel: 'Data stored',
  },
  {
    icon: DollarSign,
    title: 'Miễn phí',
    description: '50 ảnh/tháng miễn phí với gói Free. Nâng cấp Premium để không giới hạn số lượng ảnh và templates.',
    stat: '50',
    statLabel: 'Ảnh miễn phí/tháng',
  },
  {
    icon: Target,
    title: 'Dễ sử dụng',
    description: 'Giao diện đơn giản, trực quan. Không cần kỹ năng chỉnh sửa - chỉ 3 bước đơn giản để có ảnh đẹp.',
    stat: '3',
    statLabel: 'Bước đơn giản',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 relative" aria-label="Features section">
      <Container maxWidth="constrained">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4"
          >
            Tại sao chọn AI Image Stylist?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-secondary max-w-3xl mx-auto"
          >
            Công nghệ AI tiên tiến, bảo mật tuyệt đối, và trải nghiệm người dùng tuyệt vời
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 xl:gap-10">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassCard hover className="h-full group hover-lift" padding="lg">
                  <div className="flex items-start gap-4 mb-4 xl:mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-accent-1 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
                      <div className="relative glass-card p-3 lg:p-4 rounded-xl">
                        <IconComponent 
                          className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" 
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl xl:text-3xl font-semibold text-primary mb-2 lg:mb-3">
                        {feature.title}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{feature.stat}</span>
                        <span className="text-xs sm:text-sm lg:text-base text-secondary">{feature.statLabel}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-secondary leading-relaxed text-sm md:text-base xl:text-lg">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}


