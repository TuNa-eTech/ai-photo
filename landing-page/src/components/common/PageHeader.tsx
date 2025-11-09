interface PageHeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
}

export default function PageHeader({ title, subtitle, lastUpdated }: PageHeaderProps) {
  return (
    <div className="text-center mb-8 sm:mb-12 md:mb-16">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6 leading-tight">{title}</h1>
      {subtitle && <p className="text-base sm:text-lg md:text-xl text-secondary mb-4 max-w-3xl mx-auto leading-relaxed px-4">{subtitle}</p>}
      {lastUpdated && (
        <p className="text-sm text-secondary mt-4">
          Cập nhật lần cuối: {lastUpdated}
        </p>
      )}
    </div>
  );
}

