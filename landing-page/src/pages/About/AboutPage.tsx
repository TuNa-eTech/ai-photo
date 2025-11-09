import { Helmet } from 'react-helmet-async';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Về chúng tôi - AI Image Stylist</title>
        <meta
          name="description"
          content="Tìm hiểu về sứ mệnh, tầm nhìn và giá trị cốt lõi của AI Image Stylist."
        />
      </Helmet>
      <Container maxWidth="constrained">
        <PageHeader title="Về chúng tôi" />
        
        <article className="py-12 lg:py-16">
        {/* Mission Section */}
        <section className="mb-12">
          <GlassCard padding="md">
            <h2 className="text-2xl font-bold text-primary mb-4">Sứ mệnh của chúng tôi</h2>
            <p className="text-secondary leading-relaxed">
              Biến chỉnh ảnh AI trở nên dễ dàng, nhanh chóng, và đẹp mắt cho mọi người.
              Chúng tôi tin rằng mọi người đều có thể tạo ra những tác phẩm nghệ thuật
              tuyệt đẹp chỉ với vài cú chạm.
            </p>
          </GlassCard>
        </section>

        {/* Vision Section */}
        <section className="mb-12">
          <GlassCard padding="md">
            <h2 className="text-2xl font-bold text-primary mb-4">Tầm nhìn</h2>
            <p className="text-secondary leading-relaxed">
              Trở thành ứng dụng chỉnh ảnh AI hàng đầu trên iOS, được hàng triệu người
              dùng tin tưởng và yêu thích. Chúng tôi cam kết không ngừng cải thiện chất
              lượng và trải nghiệm người dùng.
            </p>
          </GlassCard>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { title: 'Innovation', description: 'Đổi mới không ngừng' },
              { title: 'Privacy', description: 'Bảo vệ quyền riêng tư' },
              { title: 'Quality', description: 'Chất lượng hàng đầu' },
              { title: 'User-centric', description: 'Lấy người dùng làm trung tâm' },
            ].map((value) => (
              <GlassCard key={value.title} hover padding="md">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {value.title}
                </h3>
                <p className="text-secondary">{value.description}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Templates', value: '100+' },
              { label: 'Users', value: '10,000+' },
              { label: 'Processing Time', value: '< 30s' },
              { label: 'Rating', value: '4.8/5.0' },
            ].map((stat) => (
              <GlassCard key={stat.label} padding="sm">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-secondary text-sm md:text-base">{stat.label}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
        </article>
      </Container>
    </>
  );
}

