// ============================================================
// Kroma E-Commerce — TypeScript Interfaces
// ============================================================

// === Auth & Users ===
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

// === Site Settings ===
export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  logo_inverted_url: string | null;
  favicon_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  business_address: string | null;
  currency_code: string;
  currency_symbol: string;
  tax_rate: number;
  tax_inclusive: boolean;
  announcement_bar_active: boolean;
  announcement_bar_text: string | null;
  announcement_bar_link: string | null;
  announcement_bar_color: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  updated_at: string;
}

// === SEO ===
export interface SEOSettings {
  id: string;
  meta_title_template: string | null;
  default_meta_description: string | null;
  og_default_image_url: string | null;
  ga_tracking_id: string | null;
  fb_pixel_id: string | null;
  search_console_meta: string | null;
  robots_txt: string | null;
  updated_at: string;
}

export interface PageSEO {
  id: string;
  page_slug: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
}

// === Categories ===
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  children?: Category[];
}

// === Products ===
export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  sale_start: string | null;
  sale_end: string | null;
  sku: string;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  status: 'draft' | 'active';
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  images?: ProductImage[];
  category?: Category;
  options?: ProductOption[];
  variants?: ProductVariant[];
  reviews?: Review[];
  average_rating?: number;
  review_count?: number;
  total_orders?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  alt_text: string | null;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  values?: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price: number | null;
  stock_quantity: number;
  option_values: { option_name: string; value: string }[];
  created_at: string;
}

// === Cart ===
export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  selectedOptions?: { option_name: string; value: string }[];
}

// === Addresses ===
export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

// === Orders ===
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  email: string;
  shipping_address: Address;
  billing_address: Address;
  shipping_method: string | null;
  shipping_cost: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon_code: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillment_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  tracking_carrier: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  timeline?: OrderTimeline[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  title: string;
  variant_info: { option_name: string; value: string }[] | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  product?: Product;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

// === Reviews ===
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  created_at: string;
  profile?: Pick<Profile, 'full_name' | 'avatar_url'>;
}

// === Coupons ===
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number | null;
  usage_limit: number | null;
  per_customer_limit: number | null;
  times_used: number;
  valid_from: string | null;
  valid_to: string | null;
  applicable_products: string[] | null;
  applicable_categories: string[] | null;
  is_active: boolean;
  created_at: string;
}

// === Subscribers ===
export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

// === Hero Slides ===
export interface HeroSlide {
  id: string;
  image_url: string;
  heading: string;
  subheading: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
}

// === Wishlist ===
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// === Media ===
export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  uploaded_by: string | null;
  created_at: string;
}

// === Filter Types ===
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  rating?: number;
  inStock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'best_selling' | 'rating';
  search?: string;
  page?: number;
}

// === Shipping ===
export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimated_delivery: string;
  free_shipping_threshold: number | null;
}

// === Toast ===
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}
