'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Check, Store, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from '@/src/components/ui/animations/effects';

const formSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ApplyPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submitApplication = useMutation(api.storefrontApplications.mutations.submit.submit);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      description: '',
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      await submitApplication(data);
      setIsSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit application. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center py-12">
      {/* Sleek Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Geometric line accents from /code inspo */}
        <div className="absolute top-1/4 right-1/4 w-px h-32 bg-linear-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-1/3 left-1/3 w-32 h-px bg-linear-to-r from-transparent via-primary/10 to-transparent" />

        {/* Large blur circles for atmosphere - toned down */}
        <motion.div
          className="absolute -top-[10%] -right-[5%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[5%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-400/5 blur-[120px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Center orbital ring - subtle */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-slate-100/50 hidden md:block"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <div className="w-full space-y-8">
              {/* Header section with staggered BlurFade */}
              <div className="text-center space-y-3">
                <BlurFade delay={0.1}>
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
                    <span className="w-8 h-px bg-slate-200" />
                    Join the Ecosystem
                    <span className="w-8 h-px bg-slate-200" />
                  </div>
                </BlurFade>

                <BlurFade delay={0.2}>
                  <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight text-slate-900">
                    Open your <span className="text-primary">storefront</span>
                  </h1>
                </BlurFade>

                <BlurFade delay={0.3}>
                  <p className="text-slate-500 text-base max-w-md mx-auto font-medium leading-relaxed">
                    Start selling your custom merchandise with zero hassle. Fill out the application below to get started.
                  </p>
                </BlurFade>
              </div>

              {/* Form Section */}
              <BlurFade delay={0.4} yOffset={20}>
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 md:p-8 relative overflow-hidden group">
                  {/* Subtle accent corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[80px] transition-colors group-hover:bg-primary/10" />

                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5 group/field">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-3">Business Name</label>
                        <Input
                          placeholder="Acme Merch"
                          {...form.register('businessName')}
                          className="h-12 bg-slate-50/50 border-slate-200 rounded-full focus:bg-white focus:ring-0 focus:border-primary transition-all font-medium text-base px-5"
                        />
                        {form.formState.errors.businessName && (
                          <p className="text-red-500 text-[10px] font-medium ml-3">{form.formState.errors.businessName.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-3">Contact Person</label>
                        <Input
                          placeholder="John Doe"
                          {...form.register('contactName')}
                          className="h-12 bg-slate-50/50 border-slate-200 rounded-full focus:bg-white focus:ring-0 focus:border-primary transition-all font-medium text-base px-5"
                        />
                        {form.formState.errors.contactName && (
                          <p className="text-red-500 text-[10px] font-medium ml-3">{form.formState.errors.contactName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-3">Email Address</label>
                        <Input
                          placeholder="john@example.com"
                          type="email"
                          {...form.register('email')}
                          className="h-12 bg-slate-50/50 border-slate-200 rounded-full focus:bg-white focus:ring-0 focus:border-primary transition-all font-medium text-base px-5"
                        />
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-[10px] font-medium ml-3">{form.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-3">Phone Number</label>
                        <Input
                          placeholder="+63 900 000 0000"
                          {...form.register('phone')}
                          className="h-12 bg-slate-50/50 border-slate-200 rounded-full focus:bg-white focus:ring-0 focus:border-primary transition-all font-medium text-base px-5"
                        />
                        {form.formState.errors.phone && (
                          <p className="text-red-500 text-[10px] font-medium ml-3">{form.formState.errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-3">Organization Context (Optional)</label>
                      <Textarea
                        placeholder="Tell us a little bit about what you do..."
                        {...form.register('description')}
                        rows={3}
                        className="resize-none bg-slate-50/50 border-slate-200 rounded-3xl focus:bg-white focus:ring-0 focus:border-primary transition-all text-sm px-5 py-4 font-medium"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="w-full h-12 text-base font-bold rounded-full hover:bg-primary/90 transition-all duration-300 group"
                      >
                        {form.formState.isSubmitting ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Submit Application
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </BlurFade>
            </div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-full max-w-lg mx-auto"
            >
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-100 p-10 relative overflow-hidden text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="h-10 w-10" />
                </motion.div>

                <h2 className="text-2xl font-bold font-heading mb-3 text-slate-900 tracking-tight">Application Received!</h2>
                <p className="text-slate-500 mb-8 text-base font-medium leading-relaxed">
                  Thanks for your interest. We'll review your application and get back to you at{' '}
                  <span className="font-bold text-primary">{form.getValues().email}</span> shortly.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full h-12 rounded-full border-slate-200 hover:bg-slate-50 font-bold transition-all">
                      Back to Home
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      form.reset();
                    }}
                    className="flex-1 h-12 rounded-full font-bold"
                  >
                    Start Another
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
