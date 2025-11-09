import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-1 to-accent-2 rounded-lg blur-md opacity-50" />
        <div className="relative glass-card p-2 rounded-lg">
          <Sparkles size={icon} className="text-primary" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className={`${text} font-bold text-primary`}>
          AI Image Stylist
        </span>
      )}
    </div>
  );
}

