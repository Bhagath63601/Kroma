'use client';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] py-16 md:py-24">
      <div className="max-w-[700px] mx-auto px-6 space-y-8">
        <div className="space-y-3">
          <p className="text-[12px] tracking-[0.2em] uppercase text-gray-500 font-bold">POLICIES</p>
          <h1 className="text-[36px] md:text-[48px] font-normal leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Terms of Service
          </h1>
          <p className="text-[13px] text-gray-400">Last updated: June 2026</p>
        </div>

        <hr className="border-gray-100" />

        <div className="prose prose-neutral max-w-none text-[15px] text-[#6B6B6B] leading-relaxed space-y-6">
          <p>
            Welcome to Kroma. By accessing our website and buying handcrafted ceramic products, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            1. Purchases & Product Pricing
          </h2>
          <p>
            We make every effort to display accurate product details, stock levels, and pricing. All prices listed on the store are in Indian Rupees (INR) and are inclusive of GST unless stated otherwise.
          </p>
          <p>
            We reserve the right to cancel orders or adjust pricing at any time due to stock limitations, pricing errors, or shipping constraints. In the event of a cancellation, you will receive a full refund.
          </p>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            2. Intellectual Property
          </h2>
          <p>
            All content on this website, including photographs, logo assets, copy, user interface styles, and illustrations, is the intellectual property of Kroma. You may not copy, reproduce, or redistribute any materials without explicit written consent.
          </p>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            3. Limitation of Liability
          </h2>
          <p>
            Kroma shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our products. We warrant that the products are shipped in sound structural condition and are suitable for functional flower display.
          </p>
        </div>
      </div>
    </div>
  );
}
