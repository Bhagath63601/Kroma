'use client';

import Accordion from '@/components/ui/Accordion';

export default function FAQPage() {
  const faqCategories = [
    {
      title: 'Orders & Shipping',
      items: [
        {
          id: 'shipping-destinations',
          title: 'Where do you ship to and how much does it cost?',
          content: 'We offer free shipping across India for all orders above ₹3,000. For orders under ₹3,000, a flat shipping rate of ₹150 is applied. All shipments are insured and require a signature upon delivery.'
        },
        {
          id: 'shipping-times',
          title: 'How long does shipping take?',
          content: 'Because each vase is carefully wrapped and padded for safety, order processing takes 1-2 business days. Delivery times are typically 3-5 business days for major metropolitan areas and 5-7 business days for rest of India.'
        },
        {
          id: 'order-tracking',
          title: 'Can I track my order?',
          content: 'Yes. Once your order has been dispatched, you will receive an email and WhatsApp confirmation containing a tracking number and shipping provider details. You can also view real-time tracking in your Account dashboard under Orders.'
        }
      ]
    },
    {
      title: 'Products & Handcrafting',
      items: [
        {
          id: 'handmade-variation',
          title: 'Will my vase look exactly like the product photos?',
          content: 'Due to the manual ceramic throwing, glazing, and wood-firing processes, every piece exhibits slight natural variations in texture, shade, and dimensions. These minor imperfections are a testament to the artisan\'s hand and make your vase completely unique.'
        },
        {
          id: 'water-tight',
          title: 'Are your vases completely water-tight?',
          content: 'Yes, all of our functional vases are fired at extremely high stoneware temperatures (up to 1250°C) and double-glazed internally to ensure they are 100% water-tight and will not leak onto your surfaces.'
        },
        {
          id: 'custom-orders',
          title: 'Do you take custom orders or commission work?',
          content: 'Occasionally. We work directly with select studio potters in Shigaraki and Tuscany. If you have a custom size, shape, or commercial design project in mind, please contact us at studio@kromahome.com with details.'
        }
      ]
    },
    {
      title: 'Care & Maintenance',
      items: [
        {
          id: 'cleaning-vases',
          title: 'How should I clean and care for my ceramic vase?',
          content: 'We recommend washing our vases by hand with warm water and a mild dish soap using a non-abrasive sponge. To protect raw stoneware finishes, avoid harsh abrasive chemicals. For matte glazes, a soft damp cloth is usually sufficient for dusting.'
        },
        {
          id: 'matte-marking',
          title: 'How do I remove metal markings on matte clay surfaces?',
          content: 'Matte clay textures can occasionally pick up gray metal markings from rings or utensils. These can easily be removed by applying a small amount of baking soda paste or Bar Keepers Friend to the spot, scrubbing gently with a soft cloth, and rinsing thoroughly.'
        }
      ]
    },
    {
      title: 'Returns & Exchanges',
      items: [
        {
          id: 'return-policy',
          title: 'What is your return policy?',
          content: 'We offer a 14-day return window from the date of delivery. Items must be in their original packaging, unused, and in undamaged condition. Return shipping costs are the responsibility of the customer unless the item arrived damaged.'
        },
        {
          id: 'damaged-item',
          title: 'What happens if my vase arrives broken?',
          content: 'We take great care in packaging our ceramics using biodegradable honeycomb cushions, but transit accidents can happen. If your item arrives broken, please email hello@kromahome.com within 48 hours of delivery with photos of the damaged item and packaging. We will ship a replacement immediately free of charge.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-[12px] tracking-[0.2em] uppercase text-gray-500 font-bold">HELP CENTER</span>
          <h1 className="text-[40px] md:text-[56px] font-normal leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-[15px] text-[#6B6B6B] max-w-lg mx-auto">
            Everything you need to know about our handcrafted ceramics, shipping, returns, and organic clay care.
          </p>
        </div>

        {/* Categories of FAQs */}
        <div className="space-y-16">
          {faqCategories.map((category) => (
            <div key={category.title} className="space-y-6">
              <h2
                className="text-[20px] md:text-[24px] font-normal border-b border-gray-100 pb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {category.title}
              </h2>
              <Accordion items={category.items} className="border-t border-transparent" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
