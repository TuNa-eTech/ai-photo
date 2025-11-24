import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';

const ContactPage = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Cảm ơn bạn đã liên hệ! Đây chỉ là bản demo.');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const faqs = t('contact.faq.items', { returnObjects: true });

    return (
        <div className="pt-24 pb-20 px-4 container mx-auto max-w-6xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    {t('contact.title')}
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                    {t('contact.subtitle')}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Form & Info */}
                <div className="space-y-8">
                    <GlassCard className="p-8">
                        <h2 className="text-2xl font-bold mb-6 text-white">{t('contact.form.title')}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('contact.form.name')}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder={t('contact.form.namePlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('contact.form.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder={t('contact.form.emailPlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('contact.form.message')}</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder={t('contact.form.messagePlaceholder')}
                                ></textarea>
                            </div>
                            <GradientButton type="submit" className="w-full">
                                {t('contact.form.submit')}
                            </GradientButton>
                        </form>
                    </GlassCard>

                    <GlassCard className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">{t('contact.support.title')}</h3>
                            <p className="text-purple-400">{t('contact.support.email')}</p>
                        </div>
                    </GlassCard>
                </div>

                {/* FAQ Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-4">{t('contact.faq.title')}</h2>
                    {faqs.map((faq, index) => (
                        <GlassCard key={index} className="p-6" hoverEffect={true}>
                            <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                            <p className="text-gray-400">{faq.answer}</p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
