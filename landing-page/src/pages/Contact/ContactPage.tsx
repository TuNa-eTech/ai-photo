import { Helmet } from 'react-helmet-async';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import ContactForm from '../../components/forms/ContactForm';

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Liên hệ - AI Image Stylist</title>
        <meta name="description" content="Liên hệ với đội ngũ AI Image Stylist." />
      </Helmet>
      <Container maxWidth="constrained">
        <PageHeader title="Liên hệ" />
        
        <article className="py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Form */}
          <GlassCard padding="lg">
            <h2 className="text-2xl font-bold text-primary mb-6">Gửi tin nhắn</h2>
            <ContactForm />
          </GlassCard>

          {/* Contact Information */}
          <div className="space-y-4 sm:space-y-6">
            <GlassCard padding="md">
              <h2 className="text-2xl font-bold text-primary mb-4">Thông tin liên hệ</h2>
              <div className="space-y-4 text-secondary">
                <div>
                  <h3 className="font-semibold text-primary mb-2">Email</h3>
                  <p>
                    Contact: <a href="mailto:contact@yourdomain.com" className="text-primary hover:underline font-medium">contact@yourdomain.com</a>
                  </p>
                  <p>
                    Support: <a href="mailto:support@yourdomain.com" className="text-primary hover:underline font-medium">support@yourdomain.com</a>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-2">Thời gian phản hồi</h3>
                  <p>24-48 giờ</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard padding="md">
              <h2 className="text-2xl font-bold text-primary mb-4">Mạng xã hội</h2>
              <div className="space-y-2 text-secondary">
                <p>
                  Facebook: <a href="https://facebook.com/yourpage" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">facebook.com/yourpage</a>
                </p>
                <p>
                  Twitter: <a href="https://twitter.com/yourhandle" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">twitter.com/yourhandle</a>
                </p>
                <p>
                  Instagram: <a href="https://instagram.com/yourhandle" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">instagram.com/yourhandle</a>
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
        </article>
      </Container>
    </>
  );
}

