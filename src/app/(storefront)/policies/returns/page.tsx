'use client';

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] py-16 md:py-24">
      <div className="max-w-[700px] mx-auto px-6 space-y-8">
        <div className="space-y-3">
          <p className="text-[12px] tracking-[0.2em] uppercase text-gray-500 font-bold">POLICIES</p>
          <h1 className="text-[36px] md:text-[48px] font-normal leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Returns & Exchanges
          </h1>
          <p className="text-[13px] text-gray-400">Last updated: June 2026</p>
        </div>

        <hr className="border-gray-100" />

        <div className="prose prose-neutral max-w-none text-[15px] text-[#6B6B6B] leading-relaxed space-y-6">
          <p>
            We hope you love your Kroma ceramic vase. However, if you are not fully satisfied with your purchase, we are here to help you resolve it.
          </p>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            1. Return Conditions
          </h2>
          <p>
            We accept returns of unused, undamaged items in their original, complete packaging within <strong>14 days</strong> of the delivery date.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Items returned with signs of water usage, soil residues, or surface scuffs will not be accepted.</li>
            <li>Custom, customized, or commission vases are final sale and cannot be returned.</li>
            <li>Discounted items or items purchased during promotional sales are eligible for store credit only.</li>
          </ul>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            2. Return Shipping
          </h2>
          <p>
            Return shipping costs are the responsibility of the customer. Because ceramics are highly fragile, you must pack the returned item using the original bubble cushions and double-boxing structure to ensure safe transit. We recommend using a trackable courier service. Items damaged during return transit due to improper packaging cannot be refunded.
          </p>

          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mt-8" style={{ fontFamily: 'var(--font-serif)' }}>
            3. Refunds & Processing
          </h2>
          <p>
            Once we receive and inspect your returned vase, we will send you an email confirmation. If approved, your refund will be processed to your original payment method within <strong>5 to 7 business days</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
