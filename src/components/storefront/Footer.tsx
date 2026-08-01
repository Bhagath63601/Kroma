'use client';

import Link from 'next/link';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Baskets & Arrangements', href: '/products?category=baskets-arrangements' },
    { label: 'Wall Mounts', href: '/products?category=wall-mounts' },
    { label: 'Floral Wreaths', href: '/products?category=floral-wreaths' },
    { label: 'Table Vases', href: '/products?category=table-vases' },
  ],
  'Customer Care': [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping Policy', href: '/policies/shipping' },
    { label: 'Returns & Exchanges', href: '/policies/returns' },
    { label: 'Track Your Order', href: '/account/orders' },
  ],
  Company: [
    { label: 'About Kroma', href: '/about' },
    { label: 'Our Artisans', href: '/about#artisans' },
    { label: 'Privacy Policy', href: '/policies/privacy' },
    { label: 'Terms of Service', href: '/policies/terms' },
  ],
};

const socialLinks = [
  {
    label: 'Instagram',
    href: '#',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: '#',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"/>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Main Footer */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 md:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <h2
              className="text-[32px] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
            >
              KROMA
            </h2>
            <p className="text-[14px] text-[#9CA3AF] leading-relaxed max-w-sm">
              Curating exceptional flower vases from the world&apos;s finest artisans. 
              Each piece is a celebration of form, function, and the beauty of nature.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.15)] flex items-center justify-center hover:border-white hover:bg-white/10 transition-all duration-300"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-white/60">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-[#9CA3AF] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-[#6B6B6B]">
            © 2026 Kroma. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Payment method icons */}
            {['Visa', 'Mastercard', 'UPI', 'RuPay'].map((method) => (
              <span
                key={method}
                className="text-[10px] uppercase tracking-[0.05em] text-[#6B6B6B] border border-[rgba(255,255,255,0.1)] px-2 py-1 rounded"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
