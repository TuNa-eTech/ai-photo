interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  verified?: boolean;
}

export default function Avatar({ name, size = 'md', verified = false }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  // Generate avatar color based on name
  const colors = [
    'from-accent-1 to-accent-2',
    'from-primary-1 to-primary-2',
    'from-accent-2 to-primary-1',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  
  // Get initials
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-semibold text-primary shadow-glass`}>
        {initials}
      </div>
      {verified && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs">
          ✓
        </div>
      )}
    </div>
  );
}

