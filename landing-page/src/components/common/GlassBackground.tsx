import { motion, useScroll, useTransform } from 'framer-motion';

interface GlassBackgroundProps {
  animated?: boolean;
  children?: React.ReactNode;
}

export default function GlassBackground({ animated = true, children }: GlassBackgroundProps) {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Beige gradient background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, #FAF2E6, #F5E6D3, #F4E4C1)' }} />

      {/* Animated blobs with parallax */}
      {animated && (
        <>
          <motion.div
            className="absolute rounded-full blur-[60px] opacity-40"
            style={{ 
              width: 300, 
              height: 300, 
              backgroundColor: 'rgba(244, 228, 193, 0.5)',
              y: y1,
              left: '10%',
              top: '20%',
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute rounded-full blur-[70px] opacity-30"
            style={{ 
              width: 350, 
              height: 350, 
              backgroundColor: 'rgba(232, 213, 208, 0.4)',
              y: y2,
              right: '10%',
              bottom: '20%',
            }}
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute rounded-full blur-[50px] opacity-25"
            style={{ 
              width: 250, 
              height: 250, 
              backgroundColor: 'rgba(245, 230, 211, 0.5)',
              left: '50%',
              top: '50%',
            }}
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </>
      )}

      {/* Subtle texture overlay with parallax */}
      <motion.div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), transparent, rgba(74, 63, 53, 0.02))',
          y: useTransform(scrollYProgress, [0, 1], [0, -50]),
        }} 
      />

      {children}
    </div>
  );
}


