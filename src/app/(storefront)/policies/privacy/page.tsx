'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] py-16 md:py-24">
      <div className="max-w-[700px] mx-auto px-6 space-y-8">
        <div className="space-y-3">
          <p className="text-[12px] tracking-[0.2em] uppercase text-gray-500 font-bold">POLICIES</p>
          <h1 className="text-[36px] md:text-[48px] font-normal leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Privacy Policy
          </h1>
          <p className="text-[13px] text-gray-400">Last updated: June 2026</p>
        </div>

        <hr className="border-gray-100" />

        <div className="prose prose-neutral max-w-none text-[15px] text-[#6B6B6B] leading-relaxed space-y-6">
          <p>
            Kroma (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the Kroma e-commerce store. This privacy document outlines how we collect, store, share, and protect your personal information.
          </p>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            1. Information We Collect
          </h2>
          <p>
            We collect information that you directly provide to us when you create an account, purchase products, sign up for notifications, or fill out a contact form. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal details:</strong> Name, email address, physical shipping address, phone number.</li>
            <li><strong>Transactional information:</strong> Details about the products you purchase, order totals, and payment status.</li>
            <li><strong>Usage details:</strong> Browser type, duration of visit, and specific product collections viewed.</li>
          </ul>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            2. How We Use Your Data
          </h2>
          <p>
            We process your information to complete sales transactions, arrange shipping, send order notifications (via email and WhatsApp), handle customer support inquiries, and analyze aggregate store performance.
          </p>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            3. Data Sharing & Security
          </h2>
          <p>
            We do not sell, lease, or distribute your personal details to third parties for marketing purposes. Your details are shared only with essential service providers, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase:</strong> For database administration and secure account authentication.</li>
            <li><strong>Razorpay:</strong> To process secure payment transactions.</li>
            <li><strong>Logistics Providers:</strong> To deliver physical packages to your address.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
