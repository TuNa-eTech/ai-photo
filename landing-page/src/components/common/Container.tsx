import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'fluid' | 'constrained' | 'wide';
}

export default function Container({
  children,
  className = '',
  maxWidth = 'constrained',
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
    fluid: 'max-w-full',
    constrained: 'max-w-5xl', // 1280px - optimal for web readability
    wide: 'max-w-7xl', // 1280px
  };

  const paddingClasses = 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16';
  const baseClasses = `mx-auto ${paddingClasses} ${maxWidthClasses[maxWidth]}`;
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return <div className={combinedClasses}>{children}</div>;
}

