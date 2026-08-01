'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert([{ name, email, message }]);

      if (dbError) throw dbError;

      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        
        {/* Title Section */}
        <div className="max-w-2xl mb-16 space-y-4">
          <span className="text-[12px] tracking-[0.2em] uppercase text-gray-500 font-bold">CONNECT</span>
          <h1 className="text-[40px] md:text-[56px] font-normal leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
            We would love to hear from you.
          </h1>
          <p className="text-[15px] text-[#6B6B6B]">
            Whether you have a question about custom pottery, ordering, bulk discounts, or a collaboration idea, our team is here to assist.
          </p>
        </div>

        {/* Form and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-[32px] border border-[rgba(0,0,0,0.06)] p-8 md:p-12 shadow-sm">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center border border-green-100 mb-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-[22px] font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
                  Message Sent Successfully
                </h3>
                <p className="text-[14px] text-[#6B6B6B] max-w-sm leading-relaxed">
                  Thank you for reaching out. We have received your message and will get back to you within 24 business hours.
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="mt-6 h-10 px-6 text-[13px] rounded-full"
                >
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <h3 className="text-[20px] font-medium mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  Write a Message
                </h3>
                
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-[12px] text-[13px] text-red-600">
                    {error}
                  </div>
                )}

                {/* Floating input: Name */}
                <div className="relative group">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder=" "
                    className="peer w-full border-b border-gray-200 py-3.5 focus:border-[#2563EB] outline-none text-[15px] bg-transparent transition-colors"
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-0 top-3.5 text-gray-400 text-[15px] pointer-events-none transition-all duration-300 peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-3.5 peer-focus:top-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#2563EB] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider peer-[:not(:placeholder-shown)]:text-[#2563EB] peer-[:not(:placeholder-shown)]:font-bold"
                  >
                    Your Name
                  </label>
                </div>

                {/* Floating input: Email */}
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder=" "
                    className="peer w-full border-b border-gray-200 py-3.5 focus:border-[#2563EB] outline-none text-[15px] bg-transparent transition-colors"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 top-3.5 text-gray-400 text-[15px] pointer-events-none transition-all duration-300 peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-3.5 peer-focus:top-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#2563EB] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider peer-[:not(:placeholder-shown)]:text-[#2563EB] peer-[:not(:placeholder-shown)]:font-bold"
                  >
                    Email Address
                  </label>
                </div>

                {/* Message TextArea */}
                <div className="relative group">
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder=" "
                    className="peer w-full border-b border-gray-200 py-3.5 focus:border-[#2563EB] outline-none text-[15px] bg-transparent transition-colors resize-none"
                  />
                  <label
                    htmlFor="message"
                    className="absolute left-0 top-3.5 text-gray-400 text-[15px] pointer-events-none transition-all duration-300 peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-3.5 peer-focus:top-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#2563EB] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider peer-[:not(:placeholder-shown)]:text-[#2563EB] peer-[:not(:placeholder-shown)]:font-bold"
                  >
                    How can we help you?
                  </label>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="w-full md:w-auto h-12 px-8 rounded-full flex items-center justify-center gap-2 text-[13px] uppercase tracking-wider font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Right Column: Contact info & Details */}
          <div className="lg:col-span-5 flex flex-col justify-between py-4 space-y-12">
            <div className="space-y-8">
              <h3 className="text-[20px] font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
                Get In Touch
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F0] flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h4 className="text-[12px] uppercase tracking-widest text-gray-400 font-bold">Email us</h4>
                    <p className="text-[15px] text-[#1A1A1A] mt-0.5">hello@kromahome.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F0] flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h4 className="text-[12px] uppercase tracking-widest text-gray-400 font-bold">Call us</h4>
                    <p className="text-[15px] text-[#1A1A1A] mt-0.5">+91 (80) 4567 8901</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F0] flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h4 className="text-[12px] uppercase tracking-widest text-gray-400 font-bold">Studio location</h4>
                    <p className="text-[15px] text-[#1A1A1A] leading-relaxed mt-0.5">
                      12, Brigade Road, Ashok Nagar,<br />
                      Bangalore, KA 560025, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Hours */}
            <div className="p-8 bg-[#F5F5F0] rounded-[24px] border border-[rgba(0,0,0,0.04)] space-y-4">
              <h4 className="text-[13px] uppercase tracking-widest font-bold text-gray-700">Studio Hours</h4>
              <div className="space-y-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Monday – Friday</span>
                  <span className="font-semibold">9:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Saturday</span>
                  <span className="font-semibold">10:00 AM – 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Sunday</span>
                  <span className="text-gray-400 font-medium">Closed</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
