import React from 'react';
import GlassCard from '../components/ui/GlassCard';

const BentoFeatures = () => {
    return (
        <section id="features" className="py-20 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Công nghệ AI <span className="text-gradient">Tiên tiến nhất</span></h2>
                    <p className="text-gray-400">Tất cả công cụ bạn cần, gói gọn trong một ứng dụng.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto auto-rows-[300px]">
                    {/* Feature 1: Remove Background (Large) */}
                    <GlassCard className="md:col-span-2 md:row-span-2 relative overflow-hidden group" hoverEffect={true}>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Xóa phông nền</h3>
                                <p className="text-gray-400">Tách chủ thể khỏi nền chỉ trong 1 giây với độ chính xác tuyệt đối.</p>
                            </div>

                            {/* Placeholder for Demo Video/Image */}
                            <div className="mt-4 flex-1 bg-black/30 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60" alt="Remove BG Demo" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Feature 2: Upscale (Small) */}
                    <GlassCard className="relative overflow-hidden group" hoverEffect={true}>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Upscale 4K</h3>
                            <p className="text-sm text-gray-400">Làm nét ảnh mờ, tăng độ phân giải lên gấp 4 lần.</p>
                        </div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px]" />
                    </GlassCard>

                    {/* Feature 3: AI Filter (Small) */}
                    <GlassCard className="relative overflow-hidden group" hoverEffect={true}>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur">
                                <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">AI Style</h3>
                            <p className="text-sm text-gray-400">Biến ảnh chụp thành tranh vẽ, anime hoặc phong cách nghệ thuật.</p>
                        </div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/20 blur-[50px]" />
                    </GlassCard>

                    {/* Feature 4: Magic Eraser (Wide) */}
                    <GlassCard className="md:col-span-3 relative overflow-hidden group" hoverEffect={true}>
                        <div className="flex flex-col md:flex-row items-center gap-8 h-full">
                            <div className="flex-1">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur">
                                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Magic Eraser</h3>
                                <p className="text-gray-400 max-w-md">Xóa người thừa, vật thể không mong muốn chỉ bằng cách tô nhẹ. AI sẽ tự động tái tạo nền hoàn hảo.</p>
                            </div>
                            <div className="flex-1 w-full h-48 md:h-full bg-black/30 rounded-xl border border-white/5 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=800&auto=format&fit=crop&q=60" alt="Magic Eraser Demo" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </section>
    );
};

export default BentoFeatures;
