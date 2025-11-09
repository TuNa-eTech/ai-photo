import { Helmet } from 'react-helmet-async';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Chính sách bảo mật - AI Image Stylist</title>
        <meta
          name="description"
          content="Chính sách bảo mật của AI Image Stylist. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn."
        />
      </Helmet>
      <Container>
        <PageHeader
          title="Chính sách bảo mật"
          lastUpdated="27 tháng 1, 2025"
        />
        
        <GlassCard className="max-w-4xl mx-auto" padding="lg">
          <div className="space-y-6 sm:space-y-8 max-w-none">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                1. Thông tin chúng tôi thu thập
              </h2>
              <p className="text-secondary mb-4">Chúng tôi thu thập các thông tin sau:</p>
              <div className="space-y-4 text-secondary">
                <div>
                  <h3 className="font-semibold text-primary">1.1. Thông tin đăng nhập (Firebase Auth)</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Email address</li>
                    <li>Tên hiển thị</li>
                    <li>Ảnh đại diện (nếu có)</li>
                    <li>User ID (Firebase UID)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">1.2. Thông tin sử dụng app</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Templates đã sử dụng</li>
                    <li>Thời gian xử lý ảnh</li>
                    <li>Số lượng ảnh đã xử lý</li>
                    <li>Lỗi và crash reports</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">1.3. Thông tin thiết bị</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>iOS version</li>
                    <li>Device model</li>
                    <li>App version</li>
                    <li>Language settings</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                2. Cách chúng tôi sử dụng thông tin
              </h2>
              <p className="text-secondary mb-4">Chúng tôi sử dụng thông tin để:</p>
              <div className="space-y-4 text-secondary">
                <div>
                  <h3 className="font-semibold text-primary">2.1. Cải thiện trải nghiệm</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Phân tích cách người dùng sử dụng app</li>
                    <li>Cải thiện tính năng và giao diện</li>
                    <li>Tối ưu hóa hiệu suất</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">2.2. Analytics và metrics</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Theo dõi số lượng người dùng</li>
                    <li>Phân tích xu hướng sử dụng</li>
                    <li>Đo lường hiệu quả tính năng</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">2.3. Hỗ trợ kỹ thuật</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Xử lý lỗi và crash reports</li>
                    <li>Hỗ trợ người dùng</li>
                    <li>Cải thiện độ ổn định</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                3. Lưu trữ dữ liệu
              </h2>
              <div className="space-y-4 text-secondary">
                <div>
                  <h3 className="font-semibold text-primary">3.1. Ảnh của bạn</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Ảnh KHÔNG được lưu trên server</li>
                    <li>Ảnh chỉ lưu local trên thiết bị của bạn</li>
                    <li>Ảnh được mã hóa bởi iOS FileProtection</li>
                    <li>Ảnh sẽ bị xóa khi bạn gỡ app</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">3.2. Thông tin đăng nhập</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Lưu trữ trên Firebase (Google)</li>
                    <li>Tuân thủ chính sách bảo mật của Firebase</li>
                    <li>Bạn có thể xóa tài khoản bất cứ lúc nào</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">3.3. Analytics data</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Lưu trữ trên Firebase Analytics</li>
                    <li>Dữ liệu ẩn danh, không chứa thông tin cá nhân</li>
                    <li>Bạn có thể opt-out trong Settings</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                4. Dịch vụ bên thứ ba
              </h2>
              <p className="text-secondary mb-4">Chúng tôi sử dụng các dịch vụ bên thứ ba sau:</p>
              <div className="space-y-4 text-secondary">
                <div>
                  <h3 className="font-semibold text-primary">4.1. Firebase (Google)</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Authentication: Đăng nhập bằng Google/Apple</li>
                    <li>Analytics: Phân tích hành vi người dùng</li>
                    <li>Chính sách bảo mật: <a href="https://firebase.google.com/support/privacy" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">https://firebase.google.com/support/privacy</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">4.2. Google Gemini</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>AI Processing: Xử lý ảnh bằng AI</li>
                    <li>Ảnh được gửi đến Gemini API để xử lý</li>
                    <li>Ảnh KHÔNG được lưu trữ bởi Gemini</li>
                    <li>Chính sách bảo mật: <a href="https://ai.google.dev/privacy" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">https://ai.google.dev/privacy</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">4.3. App Store (Apple)</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Payment processing: Thanh toán subscription</li>
                    <li>Chính sách bảo mật: <a href="https://www.apple.com/privacy" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">https://www.apple.com/privacy</a></li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                5. Quyền của bạn
              </h2>
              <p className="text-secondary mb-4">Bạn có các quyền sau:</p>
              <div className="space-y-4 text-secondary">
                <div>
                  <h3 className="font-semibold text-primary">5.1. Quyền truy cập</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Xem thông tin cá nhân của bạn</li>
                    <li>Tải xuống dữ liệu của bạn</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">5.2. Quyền xóa</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Xóa tài khoản của bạn</li>
                    <li>Xóa dữ liệu cá nhân</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">5.3. Quyền từ chối</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Từ chối thu thập analytics</li>
                    <li>Từ chối marketing emails</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">5.4. Quyền khiếu nại</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Khiếu nại về việc xử lý dữ liệu</li>
                    <li>Liên hệ với chúng tôi: privacy@yourdomain.com</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                6. Quyền riêng tư của trẻ em
              </h2>
              <p className="text-secondary">
                App của chúng tôi chỉ dành cho người dùng từ 13 tuổi trở lên.
                Chúng tôi không cố ý thu thập thông tin từ trẻ em dưới 13 tuổi.
                Nếu bạn phát hiện chúng tôi đã thu thập thông tin từ trẻ em,
                vui lòng liên hệ với chúng tôi ngay lập tức.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                7. Thay đổi chính sách
              </h2>
              <p className="text-secondary mb-4">
                Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian.
                Khi có thay đổi, chúng tôi sẽ:
              </p>
              <div className="space-y-4 text-secondary">
                <div>
                  <h3 className="font-semibold text-primary">7.1. Thông báo cho bạn</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Hiển thị thông báo trong app</li>
                    <li>Gửi email (nếu có)</li>
                    <li>Cập nhật "Last Updated" date</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">7.2. Yêu cầu đồng ý</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Yêu cầu bạn đồng ý với chính sách mới</li>
                    <li>Cho phép bạn từ chối và xóa tài khoản</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                8. Liên hệ
              </h2>
              <p className="text-secondary">
                Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
              </p>
              <p className="text-secondary mt-2">
                Email: <a href="mailto:privacy@yourdomain.com" className="text-primary hover:underline font-medium">privacy@yourdomain.com</a>
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

