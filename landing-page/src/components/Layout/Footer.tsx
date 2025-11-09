import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, ExternalLink, Download, Shield, Lock } from 'lucide-react';
import Logo from '../common/Logo';
import NewsletterForm from '../forms/NewsletterForm';

const footerLinks = {
  product: [
    { path: '/about', label: 'Về chúng tôi' },
    { path: '/faq', label: 'FAQ' },
    { path: '/support', label: 'Hỗ trợ' },
  ],
  legal: [
    { path: '/privacy-policy', label: 'Chính sách bảo mật' },
    { path: '/terms-of-service', label: 'Điều khoản sử dụng' },
    { path: '/subscription-terms', label: 'Điều khoản subscription' },
    { path: '/legal', label: 'Thông tin pháp lý' },
  ],
};

const socialLinks = [
  { href: 'https://facebook.com/yourpage', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com/yourhandle', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com/yourhandle', icon: Instagram, label: 'Instagram' },
  { href: 'mailto:contact@yourdomain.com', icon: Mail, label: 'Email' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-2/95 border-t border-white/20 mt-24" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16">
          {/* Column 1: Brand & Social */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-4">
              <Logo size="md" showText={false} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-3">AI Image Stylist</h3>
            <p className="text-sm text-secondary leading-relaxed mb-6 max-w-xs mx-auto md:mx-0">
              Biến ảnh của bạn thành tác phẩm nghệ thuật AI chỉ trong vài giây.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 justify-center md:justify-start">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-1/50 hover:bg-primary-1 transition-colors text-primary hover:scale-110"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-5 h-5" strokeWidth={2} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Links (2 Groups) */}
          <div className="grid grid-cols-2 gap-8">
            {/* Product Links */}
            <div className="text-center md:text-left">
              <h3 className="text-base font-semibold text-primary mb-4">Sản phẩm</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-secondary hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="text-center md:text-left">
              <h3 className="text-base font-semibold text-primary mb-4">Pháp lý</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-secondary hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Newsletter (Compact) */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-semibold text-primary mb-3">Đăng ký nhận tin</h3>
            <p className="text-sm text-secondary mb-4">
              Cập nhật templates mới và offers độc quyền
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar - Copyright & Trust Badges */}
        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-secondary">
              © {currentYear} AI Image Stylist. All rights reserved.
            </p>

            {/* Trust Badges & App Store */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Trust Badges */}
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Lock className="w-4 h-4" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Shield className="w-4 h-4" />
                <span>Privacy Protected</span>
              </div>
              
              {/* App Store Badge */}
              <a 
                href="https://apps.apple.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-1/50 hover:bg-primary-1 transition-colors text-primary text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

