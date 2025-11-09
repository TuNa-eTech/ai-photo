import { motion } from 'framer-motion';
import { Star, Shield, TrendingUp } from 'lucide-react';
import Container from '../../components/common/Container';
import GlassCard from '../../components/common/GlassCard';
import Avatar from '../../components/common/Avatar';

interface Testimonial {
  text: string;
  author: string;
  role: string;
  location: string;
  rating: number;
  verified: boolean;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    text: 'App tuyệt vời! Ảnh đẹp, xử lý nhanh chóng, và giao diện rất dễ sử dụng. Tôi đã tạo được nhiều ảnh nghệ thuật tuyệt đẹp chỉ trong vài phút.',
    author: 'Minh Anh',
    role: 'Photographer',
    location: 'Hà Nội',
    rating: 5,
    verified: true,
    date: '2 ngày trước',
  },
  {
    text: 'Template đa dạng, chất lượng cao. Rất hài lòng với kết quả. Đặc biệt thích tính năng bảo mật - ảnh không bao giờ rời khỏi thiết bị của tôi.',
    author: 'Thu Hà',
    role: 'Content Creator',
    location: 'TP.HCM',
    rating: 5,
    verified: true,
    date: '1 tuần trước',
  },
  {
    text: 'Giao diện đẹp, xử lý nhanh. Đáng giá mọi đồng! Premium subscription hoàn toàn xứng đáng với không giới hạn ảnh và templates.',
    author: 'Quốc Bảo',
    role: 'Designer',
    location: 'Đà Nẵng',
    rating: 5,
    verified: true,
    date: '3 tuần trước',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 relative" aria-label="Testimonials section">
      <Container maxWidth="constrained">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4"
          >
            Người dùng yêu thích
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-secondary max-w-2xl mx-auto"
          >
            Hàng nghìn người dùng đã tin tưởng và yêu thích
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 xl:gap-10 mb-8 sm:mb-12 xl:mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col group hover-lift" padding="lg">
                {/* Rating */}
                <div className="flex mb-4 gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-secondary mb-6 lg:mb-8 leading-relaxed flex-grow text-sm sm:text-base lg:text-lg">
                  "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <Avatar name={testimonial.author} size="md" verified={testimonial.verified} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-semibold text-sm sm:text-base">
                        {testimonial.author}
                      </p>
                      {testimonial.verified && (
                        <Shield className="w-4 h-4 text-success" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-secondary">
                      {testimonial.role} • {testimonial.location}
                    </p>
                    <p className="text-xs text-secondary opacity-70 mt-1">
                      {testimonial.date}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <GlassCard padding="lg" className="hover-lift">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 xl:gap-12 text-center">
              <div>
                <div className="flex justify-center mb-3 lg:mb-4">
                  <Star className="w-12 h-12 lg:w-16 lg:h-16 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-2">4.8/5.0</div>
                <p className="text-sm sm:text-base lg:text-lg text-secondary">Average Rating</p>
              </div>
              <div>
                <div className="flex justify-center mb-3 lg:mb-4">
                  <TrendingUp className="w-12 h-12 lg:w-16 lg:h-16 text-success" strokeWidth={2} />
                </div>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-2">1,000+</div>
                <p className="text-sm sm:text-base lg:text-lg text-secondary">Reviews</p>
              </div>
              <div>
                <div className="flex justify-center mb-3 lg:mb-4">
                  <Shield className="w-12 h-12 lg:w-16 lg:h-16 text-primary" strokeWidth={2} />
                </div>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-2">10K+</div>
                <p className="text-sm sm:text-base lg:text-lg text-secondary">Active Users</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </Container>
    </section>
  );
}


