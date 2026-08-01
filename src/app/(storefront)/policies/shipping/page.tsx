'use client';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] py-16 md:py-24">
      <div className="max-w-[700px] mx-auto px-6 space-y-8">
        <div className="space-y-3">
          <p className="text-[12px] tracking-[0.2em] uppercase text-gray-500 font-bold">POLICIES</p>
          <h1 className="text-[36px] md:text-[48px] font-normal leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Shipping Policy
          </h1>
          <p className="text-[13px] text-gray-400">Last updated: June 2026</p>
        </div>

        <hr className="border-gray-100" />

        <div className="prose prose-neutral max-w-none text-[15px] text-[#6B6B6B] leading-relaxed space-y-6">
          <p>
            At Kroma, we take extreme care in packing our handcrafted ceramics. Because clay items are fragile, our shipping practices are optimized for protection, security, and prompt delivery.
          </p>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            1. Rates & Processing
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Free Standard Shipping:</strong> Valid for all orders above ₹3,000 within India.</li>
            <li><strong>Flat Shipping Rate:</strong> A flat charge of ₹150 is applied to all domestic orders below the ₹3,000 threshold.</li>
            <li><strong>Processing:</strong> Orders are verified, padded, packed, and handed to our logistics partners within 1 to 2 business days.</li>
          </ul>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            2. Transit & Timelines
          </h2>
          <p>
            All packages are dispatched from our central warehouse in Bangalore using registered express air couriers (Blue Dart, Delhivery, or DTDC).
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Major Metros (Mumbai, Delhi, Bangalore, Chennai):</strong> 3 to 5 business days.</li>
            <li><strong>Rest of India:</strong> 5 to 7 business days.</li>
            <li><strong>Holidays:</strong> Delays may occur during national holidays, extreme weather events, or high-volume festive seasons.</li>
          </ul>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            3. Insurance & Damage Claims
          </h2>
          <p>
            All shipments are 100% insured against loss or damage in transit. A delivery signature is required for safety.
          </p>
          <p>
            If your ceramic vase arrives damaged or broken, please notify us within 48 hours of delivery at <strong>hello@kromahome.com</strong>. Include clear photos of the broken vase, the shipping label, and the cardboard box. We will issue a replacement or refund immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
