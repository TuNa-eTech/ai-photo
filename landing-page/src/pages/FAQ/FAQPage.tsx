import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'Làm thế nào để bắt đầu?',
    answer: 'Tải app từ App Store, đăng nhập bằng Google/Apple, chọn template và upload ảnh. App sẽ xử lý ảnh trong vài giây và bạn sẽ nhận được kết quả ngay.',
  },
  {
    category: 'Getting Started',
    question: 'App có miễn phí không?',
    answer: 'Có. App có gói miễn phí với 50 ảnh/tháng. Bạn có thể nâng cấp lên Premium để không giới hạn số lượng ảnh.',
  },
  {
    category: 'Getting Started',
    question: 'Cần tài khoản không?',
    answer: 'Có. Bạn cần đăng nhập bằng Google hoặc Apple (Firebase Auth) để sử dụng app.',
  },
  {
    category: 'Usage',
    question: 'Làm thế nào để sử dụng templates?',
    answer: 'Browse templates trong app, chọn một template yêu thích, upload ảnh, và app sẽ xử lý ảnh với style template đó.',
  },
  {
    category: 'Usage',
    question: 'Xử lý ảnh mất bao lâu?',
    answer: 'Thường mất vài giây đến 30 giây, tùy thuộc vào kích thước ảnh và độ phức tạp của template.',
  },
  {
    category: 'Usage',
    question: 'Có thể xử lý bao nhiêu ảnh?',
    answer: 'Gói miễn phí: 50 ảnh/tháng. Gói Premium: không giới hạn.',
  },
  {
    category: 'Privacy',
    question: 'Ảnh của tôi có được lưu trên server không?',
    answer: 'Không. Ảnh chỉ được lưu local trên thiết bị của bạn. Chúng tôi không lưu ảnh trên server.',
  },
  {
    category: 'Privacy',
    question: 'Dữ liệu nào được thu thập?',
    answer: 'Chúng tôi chỉ thu thập thông tin đăng nhập (Firebase Auth) và analytics (tùy chọn). Chúng tôi không thu thập ảnh của bạn.',
  },
  {
    category: 'Technical',
    question: 'App hỗ trợ iOS phiên bản nào?',
    answer: 'App hỗ trợ iOS 17 trở lên.',
  },
  {
    category: 'Technical',
    question: 'Có cần internet không?',
    answer: 'Có. Bạn cần internet để xử lý ảnh bằng AI. Ảnh sẽ được gửi đến server để xử lý.',
  },
  {
    category: 'Billing',
    question: 'Làm thế nào để nâng cấp Premium?',
    answer: 'Vào Settings > Subscription > Upgrade. Chọn gói Monthly hoặc Yearly và thanh toán qua App Store.',
  },
  {
    category: 'Billing',
    question: 'Có thể hủy subscription không?',
    answer: 'Có. Bạn có thể hủy subscription bất cứ lúc nào trong App Store Settings. Bạn vẫn có thể sử dụng Premium đến hết kỳ.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqs.map((faq) => faq.category)))];
  const filteredFAQs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <title>FAQ - AI Image Stylist</title>
        <meta name="description" content="Câu hỏi thường gặp về AI Image Stylist." />
      </Helmet>
          <Container maxWidth="constrained">
        <PageHeader title="Câu hỏi thường gặp" />

        <article className="py-12 lg:py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 sm:py-2.5 rounded-lg transition-colors min-h-[44px] ${
                selectedCategory === category
                  ? 'bg-primary-2 text-primary font-semibold shadow-sm'
                  : 'bg-primary-1 text-secondary hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
          {filteredFAQs.map((faq, index) => (
            <GlassCard key={index} padding="md">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left flex items-center justify-between min-h-[44px]"
              >
                <h3 className="text-lg font-semibold text-primary pr-4">
                  {faq.question}
                </h3>
                <span className="text-secondary text-xl flex-shrink-0">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-secondary mt-4">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>
        </article>
      </Container>
    </>
  );
}

