import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import Container from '../../components/common/Container';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';

interface Template {
  id: number;
  name: string;
  category: string;
  thumbnail: string;
  featured?: boolean;
  popular?: boolean;
}

const categories = ['All', 'Artistic', 'Vintage', 'Modern', 'Nature', 'Portrait'];

// Template data - using image_mock.png as base, would be replaced with real templates
const templates: Template[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `${['Dreamy', 'Vibrant', 'Classic', 'Bold', 'Soft', 'Elegant', 'Dynamic', 'Serene'][i]} Style`,
  category: ['Artistic', 'Modern', 'Vintage', 'Nature', 'Portrait', 'Artistic', 'Modern', 'Vintage'][i],
  thumbnail: `/image_mock.png`, // In production: unique template thumbnails
  featured: i < 2,
  popular: i < 4,
}));

export default function ShowcaseSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const featuredTemplates = templates.filter(t => t.featured);
  const regularTemplates = filteredTemplates.filter(t => !t.featured);

      return (
        <section className="py-20 lg:py-32 relative overflow-hidden" aria-label="Showcase section">
          <Container maxWidth="constrained">
        <div className="text-center mb-8 sm:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4"
          >
            Template Gallery
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-secondary max-w-2xl mx-auto"
          >
            Khám phá hàng trăm style template được thiết kế bởi chuyên gia
          </motion.p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8 sm:mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-200 min-h-[44px] font-medium text-sm sm:text-base ${
                selectedCategory === category
                  ? 'bg-primary-2 text-primary shadow-glass scale-105'
                  : 'glass-card text-secondary hover:text-primary hover:shadow-glass'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Templates */}
        {selectedCategory === 'All' && featuredTemplates.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8 flex items-center justify-center lg:justify-start gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-accent-1" />
              Featured Templates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {featuredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard hover className="overflow-hidden group cursor-pointer hover-lift" padding="md">
                    <div className="relative aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-lg mb-4 lg:mb-6" style={{ backgroundColor: 'rgba(245, 230, 211, 0.3)' }}>
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 lg:top-4 lg:right-4 glass-card px-3 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm font-semibold text-primary">
                        Featured
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-primary">{template.name}</h4>
                        <p className="text-xs sm:text-sm lg:text-base text-secondary">{template.category}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-secondary group-hover:text-primary group-hover:translate-x-2 transition-all" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Templates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {regularTemplates.slice(0, 8).map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <GlassCard hover className="overflow-hidden group cursor-pointer hover-lift" padding="sm">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-3 lg:mb-4" style={{ backgroundColor: 'rgba(245, 230, 211, 0.3)' }}>
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {template.popular && (
                    <div className="absolute top-2 left-2 lg:top-3 lg:left-3 glass-card px-2 lg:px-3 py-1 text-xs font-semibold text-primary">
                      Popular
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-primary group-hover:text-opacity-80 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-xs lg:text-sm text-secondary mt-1">{template.category}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <GlassButton size="lg" variant="secondary">
            Xem tất cả {templates.length}+ Templates
            <ChevronRight className="w-5 h-5 ml-2 inline-block" />
          </GlassButton>
        </motion.div>
      </Container>
    </section>
  );
}


