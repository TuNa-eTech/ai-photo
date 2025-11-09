import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../../components/common/Container';
import GlassButton from '../../components/common/GlassButton';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 - Trang không tìm thấy - AI Image Stylist</title>
        <meta name="description" content="Trang bạn tìm kiếm không tồn tại." />
      </Helmet>
      <Container>
        <div className="min-h-[60vh] flex items-center justify-center text-center">
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary mb-4">
              Trang không tìm thấy
            </h2>
            <p className="text-secondary mb-8 max-w-md mx-auto text-sm sm:text-base">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
            <Link to="/">
              <GlassButton size="lg">Về trang chủ</GlassButton>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}

