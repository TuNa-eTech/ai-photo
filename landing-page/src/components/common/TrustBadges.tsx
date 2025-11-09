import { Star, Download, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustBadges() {
  const badges = [
    { icon: Star, label: '4.8/5.0 Rating', value: '1,000+ reviews' },
    { icon: Download, label: '10,000+', value: 'Downloads' },
    { icon: Users, label: '5,000+', value: 'Active users' },
    { icon: Award, label: 'Top Rated', value: 'App Store' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="glass-card p-3 sm:p-4 text-center"
        >
          <badge.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-primary" strokeWidth={2} />
          <div className="text-xs sm:text-sm font-semibold text-primary">{badge.label}</div>
          <div className="text-xs text-secondary mt-1">{badge.value}</div>
        </motion.div>
      ))}
    </div>
  );
}

