import React from 'react';
import GlassCard from '../components/ui/GlassCard';

const TermsOfService = () => {
    return (
        <div className="pt-32 pb-20 container mx-auto px-4">
            <GlassCard className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gradient">Điều khoản dịch vụ</h1>

                <div className="space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Chấp nhận điều khoản</h2>
                        <p>
                            Bằng việc tải xuống, cài đặt hoặc sử dụng ứng dụng ImageAI, bạn đồng ý tuân thủ các Điều khoản dịch vụ này. Nếu bạn không đồng ý, vui lòng không sử dụng ứng dụng.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Giấy phép sử dụng</h2>
                        <p>
                            Chúng tôi cấp cho bạn giấy phép cá nhân, không độc quyền, không thể chuyển nhượng để sử dụng ứng dụng cho mục đích phi thương mại, trừ khi có thỏa thuận khác.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Hành vi bị cấm</h2>
                        <p>
                            Bạn không được sử dụng ứng dụng để tạo ra nội dung bất hợp pháp, đồi trụy, hoặc vi phạm quyền sở hữu trí tuệ của người khác.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Giới hạn trách nhiệm</h2>
                        <p>
                            ImageAI được cung cấp "nguyên trạng". Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng ứng dụng.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Chấm dứt</h2>
                        <p>
                            Chúng tôi có quyền chấm dứt hoặc tạm ngưng quyền truy cập của bạn vào ứng dụng ngay lập tức, không cần báo trước, nếu bạn vi phạm các Điều khoản này.
                        </p>
                    </section>
                </div>
            </GlassCard>
        </div>
    );
};

export default TermsOfService;
