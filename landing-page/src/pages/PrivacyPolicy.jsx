import React from 'react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    const sections = t('legal.privacy.sections', { returnObjects: true });
    return (
        <div className="pt-32 pb-20 container mx-auto px-4">
            <GlassCard className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gradient">{t('legal.privacy.title')}</h1>
                <p className="text-gray-300 mb-8">{t('legal.privacy.intro')}</p>

                <div className="space-y-6 text-gray-300">
                    {Object.values(sections).map((section, index) => (
                        <section key={index}>
                            <h2 className="text-xl font-semibold text-white mb-3">{section.title}</h2>
                            <p>{section.body}</p>
                        </section>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

export default PrivacyPolicy;
