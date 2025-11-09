import { Helmet } from 'react-helmet-async';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';

export default function SubscriptionTermsPage() {
  return (
    <>
      <Helmet>
        <title>Điều khoản subscription - AI Image Stylist</title>
        <meta name="description" content="Điều khoản subscription của AI Image Stylist." />
      </Helmet>
      <Container>
        <PageHeader title="Điều khoản subscription" lastUpdated="27 tháng 1, 2025" />
        <GlassCard className="max-w-4xl mx-auto" padding="lg">
          <div className="space-y-6 sm:space-y-8 max-w-none">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">1. Gói miễn phí</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">1.1. Tính năng</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>50 ảnh/tháng</li>
                    <li>Chất lượng chuẩn</li>
                    <li>Tất cả templates</li>
                    <li>Hỗ trợ cộng đồng</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">1.2. Giới hạn</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Giới hạn 50 ảnh/tháng</li>
                    <li>Không có chất lượng cao</li>
                    <li>Không có priority queue</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">2. Gói Premium</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">2.1. Tính năng</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Không giới hạn ảnh</li>
                    <li>Chất lượng cao</li>
                    <li>Priority queue</li>
                    <li>Templates độc quyền (tương lai)</li>
                    <li>Hỗ trợ ưu tiên</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">2.2. Giá</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Monthly: $X.XX/tháng</li>
                    <li>Yearly: $XX.XX/năm (tiết kiệm X%)</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">3. Thanh toán và hóa đơn</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">3.1. Thanh toán</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Thanh toán qua App Store (Apple)</li>
                    <li>Hóa đơn từ Apple</li>
                    <li>Tự động gia hạn</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">3.2. Hóa đơn</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Hóa đơn sẽ được gửi qua email</li>
                    <li>Bạn có thể xem hóa đơn trong App Store</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">4. Hủy subscription</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">4.1. Hủy bất cứ lúc nào</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Bạn có thể hủy subscription bất cứ lúc nào</li>
                    <li>Vào Settings &gt; [Your Name] &gt; Subscriptions</li>
                    <li>Chọn AI Image Stylist &gt; Cancel Subscription</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">4.2. Tiếp tục sử dụng</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Bạn vẫn có thể sử dụng Premium đến hết kỳ</li>
                    <li>Sau đó, app sẽ chuyển về Free tier</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">5. Hoàn tiền</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">5.1. Chính sách hoàn tiền</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Hoàn tiền theo chính sách của App Store</li>
                    <li>Liên hệ Apple Support để yêu cầu hoàn tiền</li>
                    <li>Chúng tôi không xử lý hoàn tiền trực tiếp</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">5.2. Điều kiện</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Hoàn tiền trong vòng 14 ngày (nếu đủ điều kiện)</li>
                    <li>Chỉ hoàn tiền cho lần mua đầu tiên</li>
                    <li>Không hoàn tiền cho subscription đã gia hạn</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">6. Thay đổi gói</h2>
              <div className="text-secondary space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">6.1. Thông báo</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Chúng tôi sẽ thông báo trước khi thay đổi giá</li>
                    <li>Thông báo qua email và trong app</li>
                    <li>Bạn có thể hủy subscription trước khi thay đổi có hiệu lực</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">6.2. Áp dụng</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Thay đổi chỉ áp dụng cho subscription mới</li>
                    <li>Subscription hiện tại không bị ảnh hưởng</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">7. Liên hệ</h2>
              <p className="text-secondary">
                Nếu bạn có câu hỏi về subscription, vui lòng liên hệ:
              </p>
              <p className="text-secondary mt-2">
                Email: <a href="mailto:billing@yourdomain.com" className="text-primary hover:underline font-medium">billing@yourdomain.com</a>
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

