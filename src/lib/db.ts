import { createClient } from './supabase';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, SAMPLE_HERO_SLIDES } from './sample-data';
import type { Product, Category, HeroSlide } from '@/types';

// Check if we are running in a client context to instantiate the Supabase client safely
const getSupabaseClient = () => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey || url.includes('placeholder')) {
      return null;
    }
    return createClient();
  } catch {
    return null;
  }
};

export async function getCategories(): Promise<Category[]> {
  'use cache';
  const supabase = getSupabaseClient();
  if (!supabase) return SAMPLE_CATEGORIES;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error || !data || data.length === 0) {
      return SAMPLE_CATEGORIES;
    }
    return data as Category[];
  } catch {
    return SAMPLE_CATEGORIES;
  }
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  'use cache';
  const supabase = getSupabaseClient();
  if (!supabase) return SAMPLE_PRODUCTS;

  try {
    let query = supabase.from('products').select(`
      *,
      images:product_images(*),
      category:categories(*)
    `);

    if (categorySlug && categorySlug !== 'all') {
      // Find category first
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
        
      if (catData) {
        query = query.eq('category_id', catData.id);
      } else {
        // If category slug isn't found in DB, return empty or fallback
        return [];
      }
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      // Fallback if there is an error or no data
      return categorySlug && categorySlug !== 'all'
        ? SAMPLE_PRODUCTS.filter(p => {
            const cat = SAMPLE_CATEGORIES.find(c => c.slug === categorySlug);
            return p.category_id === (cat?.id ?? '');
          })
        : SAMPLE_PRODUCTS;
    }

    // Map database properties (product_images table results) to product.images key
    const mappedProducts = data.map((prod: any) => {
      // Sort images by sort_order
      const images = (prod.images || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
      return {
        ...prod,
        images,
      };
    });

    return mappedProducts as Product[];
  } catch {
    return SAMPLE_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  'use cache';
  const supabase = getSupabaseClient();
  if (!supabase) return SAMPLE_PRODUCTS.find(p => p.slug === slug) || null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        category:categories(*)
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return SAMPLE_PRODUCTS.find(p => p.slug === slug) || null;
    }

    const images = (data.images || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
    return {
      ...data,
      images,
    } as Product;
  } catch {
    return SAMPLE_PRODUCTS.find(p => p.slug === slug) || null;
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  'use cache';
  const supabase = getSupabaseClient();
  if (!supabase) return SAMPLE_HERO_SLIDES;

  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return SAMPLE_HERO_SLIDES;
    }
    return data as HeroSlide[];
  } catch {
    return SAMPLE_HERO_SLIDES;
  }
}
