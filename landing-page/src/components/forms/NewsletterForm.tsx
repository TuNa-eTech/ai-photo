import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Send } from 'lucide-react';
import GlassButton from '../common/GlassButton';

const newsletterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Integrate with backend API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Newsletter subscription:', data);
      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
          <input
            type="email"
            {...register('email')}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border bg-primary-1/50 border-white/30 text-primary focus:outline-none focus:ring-2 focus:ring-primary-2/50 min-h-[40px]"
            placeholder="your@email.com"
            disabled={isSubmitting}
          />
        </div>
        <GlassButton type="submit" disabled={isSubmitting} size="sm" className="flex-shrink-0">
          <Send className="w-4 h-4" />
        </GlassButton>
      </div>

      {errors.email && (
        <p className="text-xs text-error">{errors.email.message}</p>
      )}

      {submitStatus === 'success' && (
        <p className="text-xs text-success">Cảm ơn bạn đã đăng ký!</p>
      )}

      {submitStatus === 'error' && (
        <p className="text-xs text-error">Có lỗi xảy ra. Vui lòng thử lại.</p>
      )}
    </form>
  );
}

