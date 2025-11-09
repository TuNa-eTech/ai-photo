import { Helmet } from 'react-helmet-async';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';

export default function LegalPage() {
  return (
    <>
      <Helmet>
        <title>Thông tin pháp lý - AI Image Stylist</title>
        <meta name="description" content="Thông tin pháp lý của AI Image Stylist." />
      </Helmet>
      <Container>
        <PageHeader title="Thông tin pháp lý" />
        <GlassCard className="max-w-4xl mx-auto" padding="lg">
          <div className="space-y-6 sm:space-y-8 max-w-none">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">1. Thông tin công ty</h2>
              <div className="text-secondary space-y-2">
                <p>Company Name: [Your Company Name]</p>
                <p>Address: [Your Address]</p>
                <p>Registration Number: [Your Registration Number]</p>
                <p>Email: <a href="mailto:legal@yourdomain.com" className="text-primary hover:underline font-medium">legal@yourdomain.com</a></p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">2. Bản quyền</h2>
              <p className="text-secondary">
                © 2025 AI Image Stylist. All rights reserved.
              </p>
              <p className="text-secondary mt-4">
                Tất cả nội dung, code, và design của App được bảo vệ bởi luật bản quyền.
                Bạn không được sao chép, phân phối, hoặc sử dụng mà không có sự đồng ý của chúng tôi.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">3. Thương hiệu</h2>
              <p className="text-secondary">
                AI Image Stylist, logo, và các thương hiệu khác là tài sản của chúng tôi.
                Bạn không được sử dụng mà không có sự đồng ý của chúng tôi.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">4. Giấy phép</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">4.1. Open Source Licenses</h3>
                  <p>App sử dụng các thư viện open source sau:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>React (MIT License)</li>
                    <li>React Router (MIT License)</li>
                    <li>Tailwind CSS (MIT License)</li>
                    <li>Framer Motion (MIT License)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">4.2. Third-Party Licenses</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Firebase (Google Terms of Service)</li>
                    <li>Google Gemini (Google AI Terms of Service)</li>
                    <li>App Store (Apple Terms of Service)</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">5. Tuyên bố từ chối trách nhiệm</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">5.1. Kết quả AI</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Kết quả AI có thể khác nhau tùy thuộc vào ảnh input</li>
                    <li>Chúng tôi không đảm bảo kết quả sẽ đẹp 100%</li>
                    <li>Kết quả phụ thuộc vào chất lượng ảnh input</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">5.2. Không đảm bảo</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>App được cung cấp "as is", không có bảo đảm</li>
                    <li>Chúng tôi không đảm bảo App sẽ hoạt động hoàn hảo</li>
                    <li>Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">6. Liên hệ</h2>
              <p className="text-secondary">
                Nếu bạn có câu hỏi về thông tin pháp lý, vui lòng liên hệ:
              </p>
              <p className="text-secondary mt-2">
                Email: <a href="mailto:legal@yourdomain.com" className="text-primary hover:underline font-medium">legal@yourdomain.com</a>
                <br />
                Support: <a href="mailto:support@yourdomain.com" className="text-primary hover:underline font-medium">support@yourdomain.com</a>
              </p>
            </section>
          </div>
        </GlassCard>
      </Container>
    </>
  );
}

