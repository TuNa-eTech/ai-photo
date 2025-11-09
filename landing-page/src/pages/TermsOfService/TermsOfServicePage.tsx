import { Helmet } from 'react-helmet-async';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';

export default function TermsOfServicePage() {
  return (
    <>
      <Helmet>
        <title>Điều khoản sử dụng - AI Image Stylist</title>
        <meta name="description" content="Điều khoản sử dụng của AI Image Stylist." />
      </Helmet>
      <Container>
        <PageHeader title="Điều khoản sử dụng" lastUpdated="27 tháng 1, 2025" />
        <GlassCard className="max-w-4xl mx-auto" padding="lg">
          <div className="space-y-6 sm:space-y-8 max-w-none">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">1. Chấp nhận điều khoản</h2>
              <p className="text-secondary">
                Bằng việc tải, cài đặt, hoặc sử dụng AI Image Stylist ("App"),
                bạn đồng ý với các điều khoản sử dụng này. Nếu bạn không đồng ý,
                vui lòng không sử dụng App.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">2. Mô tả dịch vụ</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">2.1. Dịch vụ</h3>
                  <p>AI Image Stylist là ứng dụng chỉnh ảnh AI cho phép bạn:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Browse và chọn AI style templates</li>
                    <li>Upload và xử lý ảnh với AI</li>
                    <li>Lưu và chia sẻ ảnh đã xử lý</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">2.2. Tính năng</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>100+ AI style templates</li>
                    <li>Xử lý ảnh với Gemini AI</li>
                    <li>Lưu trữ local trên thiết bị</li>
                    <li>Chia sẻ ảnh đã xử lý</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">3. Tài khoản người dùng</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">3.1. Yêu cầu đăng nhập</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Bạn phải đăng nhập bằng Google hoặc Apple (Firebase Auth)</li>
                    <li>Bạn phải cung cấp thông tin chính xác</li>
                    <li>Bạn phải bảo mật thông tin đăng nhập</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">3.2. Trách nhiệm</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Bạn chịu trách nhiệm về tài khoản của mình</li>
                    <li>Bạn phải báo cáo ngay nếu tài khoản bị hack</li>
                    <li>Bạn không được chia sẻ tài khoản với người khác</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">4. Sử dụng hợp lệ</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">4.1. Bạn ĐƯỢC PHÉP:</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Sử dụng App cho mục đích cá nhân</li>
                    <li>Xử lý ảnh của bạn</li>
                    <li>Chia sẻ ảnh đã xử lý</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">4.2. Bạn KHÔNG ĐƯỢC PHÉP:</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Sử dụng App cho mục đích bất hợp pháp</li>
                    <li>Upload ảnh có nội dung bất hợp pháp, khiêu dâm, bạo lực</li>
                    <li>Lạm dụng App (spam, hack, etc.)</li>
                    <li>Reverse engineer App</li>
                    <li>Sử dụng App để vi phạm quyền của người khác</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">5. Sở hữu trí tuệ</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">5.1. Quyền của bạn</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Bạn sở hữu ảnh đã xử lý</li>
                    <li>Bạn có quyền sử dụng, chia sẻ, bán ảnh đã xử lý</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">5.2. Quyền của chúng tôi</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Chúng tôi sở hữu App, templates, và code</li>
                    <li>Bạn không được sao chép, phân phối, hoặc bán App</li>
                    <li>Bạn không được sử dụng templates cho mục đích thương mại</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">6. Giới hạn trách nhiệm</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">6.1. Dịch vụ "As Is"</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>App được cung cấp "as is", không có bảo đảm</li>
                    <li>Chúng tôi không đảm bảo App sẽ hoạt động hoàn hảo</li>
                    <li>Chúng tôi không đảm bảo kết quả AI sẽ đẹp 100%</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">6.2. Giới hạn trách nhiệm</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp</li>
                    <li>Chúng tôi không chịu trách nhiệm về mất mát dữ liệu</li>
                    <li>Trách nhiệm tối đa: số tiền bạn đã trả cho App</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">7. Chấm dứt</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">7.1. Quyền của bạn</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Bạn có thể xóa tài khoản bất cứ lúc nào</li>
                    <li>Bạn có thể gỡ App bất cứ lúc nào</li>
                    <li>Dữ liệu sẽ bị xóa khi bạn xóa tài khoản</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">7.2. Quyền của chúng tôi</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Chúng tôi có thể suspend tài khoản vi phạm</li>
                    <li>Chúng tôi có thể chấm dứt dịch vụ bất cứ lúc nào</li>
                    <li>Chúng tôi sẽ thông báo trước khi chấm dứt</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">8. Luật áp dụng</h2>
              <p className="text-secondary">
                Điều khoản này được điều chỉnh bởi luật pháp Việt Nam.
                Mọi tranh chấp sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">9. Liên hệ</h2>
              <p className="text-secondary">
                Nếu bạn có câu hỏi về điều khoản này, vui lòng liên hệ:
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

