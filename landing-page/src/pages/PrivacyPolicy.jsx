import React from 'react';
import GlassCard from '../components/ui/GlassCard';

const PrivacyPolicy = () => {
    return (
        <div className="pt-32 pb-20 container mx-auto px-4">
            <GlassCard className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gradient">Chính sách bảo mật</h1>

                <div className="space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Thu thập thông tin</h2>
                        <p>
                            Chúng tôi thu thập thông tin mà bạn cung cấp trực tiếp cho chúng tôi khi sử dụng ứng dụng ImageAI, bao gồm nhưng không giới hạn ở hình ảnh bạn tải lên để chỉnh sửa.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Sử dụng thông tin</h2>
                        <p>
                            Hình ảnh bạn tải lên chỉ được sử dụng cho mục đích xử lý AI theo yêu cầu của bạn. Chúng tôi không chia sẻ, bán hoặc sử dụng hình ảnh của bạn cho bất kỳ mục đích nào khác mà không có sự đồng ý của bạn.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Bảo mật dữ liệu</h2>
                        <p>
                            Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật số tiên tiến để bảo vệ dữ liệu của bạn khỏi truy cập trái phép, mất mát hoặc phá hủy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Quyền của người dùng</h2>
                        <p>
                            Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu cá nhân của mình bất cứ lúc nào bằng cách liên hệ với chúng tôi qua email hỗ trợ.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Thay đổi chính sách</h2>
                        <p>
                            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo trên ứng dụng hoặc qua email.
                        </p>
                    </section>
                </div>
            </GlassCard>
        </div>
    );
};

export default PrivacyPolicy;
