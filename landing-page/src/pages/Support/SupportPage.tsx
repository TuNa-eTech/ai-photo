import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import SupportForm from '../../components/forms/SupportForm';

export default function SupportPage() {
  return (
    <>
      <Helmet>
        <title>Hỗ trợ - AI Image Stylist</title>
        <meta name="description" content="Nhận hỗ trợ từ đội ngũ AI Image Stylist." />
      </Helmet>
      <Container>
        <PageHeader title="Hỗ trợ" />
        
        {/* Quick Links */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">Tài nguyên hỗ trợ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { path: '/faq', label: 'FAQ', description: 'Câu hỏi thường gặp' },
              { path: '/contact', label: 'Contact', description: 'Liên hệ với chúng tôi' },
              { path: '/faq', label: 'Guides', description: 'Hướng dẫn sử dụng' },
              { path: '/contact', label: 'Report Bug', description: 'Báo lỗi' },
            ].map((link) => (
              <Link key={link.path} to={link.path}>
                <GlassCard hover padding="md">
                  <h3 className="text-lg font-semibold text-primary mb-2">{link.label}</h3>
                  <p className="text-secondary text-sm">{link.description}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Common Issues */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">Vấn đề thường gặp</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Làm thế nào để sử dụng templates?',
                steps: [
                  'Vào "All Templates" và chọn template yêu thích',
                  'Tap "Use Template" và upload ảnh',
                  'Chờ vài giây để nhận kết quả',
                ],
              },
              {
                title: 'Xử lý ảnh thất bại',
                steps: [
                  'Kiểm tra kết nối internet',
                  'Kiểm tra kích thước ảnh (tối đa 5MB)',
                  'Thử lại sau vài phút',
                ],
              },
              {
                title: 'Vấn đề tài khoản',
                steps: [
                  'Đăng xuất và đăng nhập lại',
                  'Kiểm tra kết nối internet',
                  'Liên hệ support nếu vẫn không giải quyết được',
                ],
              },
              {
                title: 'Vấn đề thanh toán',
                steps: [
                  'Kiểm tra thông tin thanh toán trong App Store',
                  'Liên hệ Apple Support nếu cần',
                  'Liên hệ billing@yourdomain.com',
                ],
              },
            ].map((issue, index) => (
              <GlassCard key={index} padding="md">
                <h3 className="text-lg font-semibold text-primary mb-3">{issue.title}</h3>
                <ul className="list-disc list-inside ml-4 space-y-1 text-secondary">
                  {issue.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Support Form */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">Gửi yêu cầu hỗ trợ</h2>
          <GlassCard padding="lg">
            <SupportForm />
          </GlassCard>
        </section>

        {/* Contact Information */}
        <section>
          <GlassCard padding="md">
            <h2 className="text-2xl font-bold text-primary mb-4">Thông tin liên hệ</h2>
            <div className="space-y-2 text-secondary">
              <p>
                Support: <a href="mailto:support@yourdomain.com" className="text-primary hover:underline font-medium">support@yourdomain.com</a>
              </p>
              <p>
                Billing: <a href="mailto:billing@yourdomain.com" className="text-primary hover:underline font-medium">billing@yourdomain.com</a>
              </p>
              <p>
                Privacy: <a href="mailto:privacy@yourdomain.com" className="text-primary hover:underline font-medium">privacy@yourdomain.com</a>
              </p>
              <p className="mt-4">Thời gian phản hồi: 24-48 giờ</p>
            </div>
          </GlassCard>
        </section>
      </Container>
    </>
  );
}

