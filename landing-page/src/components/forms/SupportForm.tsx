import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import GlassButton from '../common/GlassButton';

const supportFormSchema = z.object({
  name: z.string().min(1, 'Tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  category: z
    .string()
    .min(1, 'Vui lòng chọn danh mục')
    .refine((val) => ['Technical', 'Account', 'Billing', 'Other'].includes(val), {
      message: 'Vui lòng chọn danh mục hợp lệ',
    }),
  subject: z.string().min(1, 'Chủ đề là bắt buộc'),
  message: z.string().min(10, 'Tin nhắn phải có ít nhất 10 ký tự'),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

export default function SupportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
  });

  const onSubmit = async (data: SupportFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Integrate with backend API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Form data:', data);
      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
          Tên *
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="w-full px-4 py-3 rounded-lg border text-primary focus:outline-none min-h-[44px]"
          placeholder="Nhập tên của bạn"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-4 py-3 rounded-lg border text-primary focus:outline-none min-h-[44px]"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-primary mb-2">
          Danh mục *
        </label>
        <select
          id="category"
          {...register('category')}
          className="w-full px-4 py-3 rounded-lg border text-primary focus:outline-none min-h-[44px]"
        >
          <option value="">Chọn danh mục</option>
          <option value="Technical">Kỹ thuật</option>
          <option value="Account">Tài khoản</option>
          <option value="Billing">Thanh toán</option>
          <option value="Other">Khác</option>
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-primary mb-2">
          Chủ đề *
        </label>
        <input
          id="subject"
          type="text"
          {...register('subject')}
          className="w-full px-4 py-3 rounded-lg border text-primary focus:outline-none min-h-[44px]"
          placeholder="Nhập chủ đề"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
          Tin nhắn *
        </label>
        <textarea
          id="message"
          {...register('message')}
          rows={6}
          className="w-full px-4 py-3 rounded-lg border text-primary focus:outline-none resize-none min-h-[120px]"
          placeholder="Mô tả vấn đề của bạn..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="p-4 rounded-lg bg-green-100 text-green-800">
          Cảm ơn bạn! Yêu cầu hỗ trợ của bạn đã được gửi thành công.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 rounded-lg bg-red-100 text-red-800">
          Có lỗi xảy ra. Vui lòng thử lại sau.
        </div>
      )}

      <GlassButton type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
      </GlassButton>
    </form>
  );
}

