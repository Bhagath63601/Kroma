const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Parse .env.local to get Supabase credentials
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let serviceRoleKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') serviceRoleKey = val;
    }
  });
}

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder') || serviceRoleKey.includes('placeholder')) {
  console.error('Error: Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before running the seed script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// UUID mappings matching the relations exactly
const uuidMap = {
  'cat-1': '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  'cat-2': '2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d',
  'cat-3': '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
  'cat-4': '4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d',
  
  'prod-1': '5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d',
  'prod-2': '6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d',
  'prod-3': '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  'prod-4': '8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d',
  'prod-5': '9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d',
  'prod-6': '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
  'prod-7': '1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
  'prod-8': '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
  'prod-9': '3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e',
  'prod-10': '4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
  'prod-11': '5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
};

// Raw categories
const categories = [
  {
    id: uuidMap['cat-1'],
    name: 'Baskets & Arrangements',
    slug: 'baskets-arrangements',
    description: 'Charming wicker baskets and floral arrangements for tables and mantels',
    image_url: '/samples/2/pomelli_photoshoot-1.png',
    sort_order: 1,
  },
  {
    id: uuidMap['cat-2'],
    name: 'Wall Mounts',
    slug: 'wall-mounts',
    description: 'Bespoke wall-mounted floral plaques and pocket vases',
    image_url: '/samples/5/pomelli_photoshoot-1.png',
    sort_order: 2,
  },
  {
    id: uuidMap['cat-3'],
    name: 'Floral Wreaths',
    slug: 'floral-wreaths',
    description: 'Homemade decorative door and wall wreaths',
    image_url: '/samples/1/pomelli_photoshoot-1.png',
    sort_order: 3,
  },
  {
    id: uuidMap['cat-4'],
    name: 'Table Vases',
    slug: 'table-vases',
    description: 'Elegant homemade vase arrangements for table centerpieces',
    image_url: '/samples/10/pomelli_photoshoot-1.png',
    sort_order: 4,
  },
];

// Raw products with image mappings
const products = [
  {
    id: uuidMap['prod-1'],
    title: 'Pomelli Harvest Wreath',
    slug: 'pomelli-harvest-wreath',
    description: 'A beautiful homemade harvest-style floral wreath featuring warm orange and peach blossoms, lush green leaves, and a rustic burlap ribbon bow. Meticulously handcrafted, this piece is perfect for door decor or bringing warmth to your entryways.',
    category_id: uuidMap['cat-3'],
    price: 3200,
    sku: 'WRE-HARV-001',
    stock_quantity: 12,
    track_inventory: true,
    status: 'active',
    tags: ['wreath', 'harvest', 'autumn', 'orange'],
    images: [
      { image_url: '/samples/1/creative.png', sort_order: 1 },
      { image_url: '/samples/1/pomelli_photoshoot-1.png', sort_order: 2 },
      { image_url: '/samples/1/pomelli_photoshoot-2.png', sort_order: 3 },
      { image_url: '/samples/1/pomelli_photoshoot-3.png', sort_order: 4 }
    ]
  },
  {
    id: uuidMap['prod-2'],
    title: 'Pomelli Velvet Rose Bouquet',
    slug: 'pomelli-velvet-rose-bouquet',
    description: 'An elegant basket arrangement of deep red velvet roses nested amongst rich greenery and subtle white filler blossoms. Perfectly sized for a vanity, sideboard, or gift.',
    category_id: uuidMap['cat-1'],
    price: 4500,
    sku: 'BASK-ROSE-002',
    stock_quantity: 8,
    track_inventory: true,
    status: 'active',
    tags: ['roses', 'red', 'bouquet', 'basket'],
    images: [
      { image_url: '/samples/2/pomelli_photoshoot-1.png', sort_order: 1 },
      { image_url: '/samples/2/pomelli_photoshoot-2.png', sort_order: 2 },
      { image_url: '/samples/2/pomelli_photoshoot-3.png', sort_order: 3 }
    ]
  },
  {
    id: uuidMap['prod-3'],
    title: 'Sunset Blossom Wicker Basket',
    slug: 'sunset-blossom-wicker-basket',
    description: 'A lovely wicker basket overflowing with warm terracotta, yellow, and blush wildflowers. Evokes the feeling of a late summer field under a golden sunset.',
    category_id: uuidMap['cat-1'],
    price: 3800,
    sku: 'BASK-SUNS-003',
    stock_quantity: 15,
    track_inventory: true,
    status: 'active',
    tags: ['wildflowers', 'basket', 'wicker', 'sunset'],
    images: [
      { image_url: '/samples/3/pomelli_photoshoot-1.png', sort_order: 1 },
      { image_url: '/samples/3/pomelli_photoshoot-2.png', sort_order: 2 },
      { image_url: '/samples/3/pomelli_photoshoot-3.png', sort_order: 3 }
    ]
  },
  {
    id: uuidMap['prod-4'],
    title: 'Elegance Hydrangea Basket',
    slug: 'elegance-hydrangea-basket',
    description: 'Lush cream and lavender hydrangeas arranged elegantly in a whitewashed wicker basket. A sophisticated centerpiece for dinners, weddings, or modern living rooms.',
    category_id: uuidMap['cat-1'],
    price: 4900,
    sku: 'BASK-HYDR-004',
    stock_quantity: 5,
    track_inventory: true,
    status: 'active',
    tags: ['hydrangea', 'basket', 'elegant', 'lavender'],
    images: [
      { image_url: '/samples/4/pomelli_photoshoot-1.png', sort_order: 1 },
      { image_url: '/samples/4/pomelli_photoshoot-2.png', sort_order: 2 },
      { image_url: '/samples/4/pomelli_photoshoot-3.png', sort_order: 3 }
    ]
  },
  {
    id: uuidMap['prod-5'],
    title: 'Wildflower Meadow Plaque',
    slug: 'wildflower-meadow-plaque',
    description: 'A flat wooden plaque displaying a preserved wildflower field. Perfect for hanging on kitchen or hallway walls to add a splash of cottagecore aesthetic.',
    category_id: uuidMap['cat-2'],
    price: 2600,
    sku: 'WALL-MEAD-005',
    stock_quantity: 20,
    track_inventory: true,
    status: 'active',
    tags: ['wall-art', 'plaque', 'preserved', 'cottagecore'],
    images: [
      { image_url: '/samples/5/pomelli_photoshoot-1.png', sort_order: 1 },
      { image_url: '/samples/5/pomelli_photoshoot-2.png', sort_order: 2 }
    ]
  },
  {
    id: uuidMap['prod-6'],
    title: 'Golden Eucalyptus Pocket',
    slug: 'golden-eucalyptus-pocket',
    description: 'A semi-circular wall pocket vase holding gilded eucalyptus branches and white pampas grass. Adds a touch of modern luxury to any wall space.',
    category_id: uuidMap['cat-2'],
    price: 2900,
    sku: 'WALL-EUCA-006',
    stock_quantity: 14,
    track_inventory: true,
    status: 'active',
    tags: ['eucalyptus', 'wall-pocket', 'modern', 'gold'],
    images: [
      { image_url: '/samples/6/pomelli_photoshoot-1.png', sort_order: 1 },
      { image_url: '/samples/6/pomelli_photoshoot-2.png', sort_order: 2 }
    ]
  },
  {
    id: uuidMap['prod-7'],
    title: 'Autumn Harvest Plaque',
    slug: 'autumn-harvest-plaque',
    description: 'A wall plaque showcasing deep burgundy maple leaves, dried seed pods, and miniature gourds. Ideal for seasonal autumn home staging.',
    category_id: uuidMap['cat-2'],
    price: 2700,
    sku: 'WALL-AUTM-007',
    stock_quantity: 10,
    track_inventory: true,
    status: 'active',
    tags: ['autumn', 'wall-art', 'plaque', 'dried'],
    images: [
      { image_url: '/samples/7/pomelli_photoshoot-1.png', sort_order: 1 },
      { image_url: '/samples/7/pomelli_photoshoot-2.png', sort_order: 2 }
    ]
  },
  {
    id: uuidMap['prod-8'],
    title: 'Spring Blossom Door Wreath',
    slug: 'spring-blossom-door-wreath',
    description: 'Bright pink cherry blossoms, yellow daffodils, and fresh green ivy wrapped around a sturdy vine wreath. Celebrate the arrival of spring on your front door.',
    category_id: uuidMap['cat-3'],
    price: 3500,
    sku: 'WRE-SPRI-008',
    stock_quantity: 11,
    track_inventory: true,
    status: 'active',
    tags: ['spring', 'wreath', 'cherry-blossoms', 'door'],
    images: [
      { image_url: '/samples/8/pomelli_photoshoot-1.png', sort_order: 1 },
      { image_url: '/samples/8/pomelli_photoshoot-2.png', sort_order: 2 }
    ]
  },
  {
    id: uuidMap['prod-9'],
    title: 'Eucalyptus Forest Wreath',
    slug: 'eucalyptus-forest-wreath',
    description: 'A thick, lush ring of spiral and silver dollar eucalyptus branches with tiny white berries. Simple, clean, and organic look for year-round decor.',
    category_id: uuidMap['cat-3'],
    price: 3100,
    sku: 'WRE-EUCA-009',
    stock_quantity: 18,
    track_inventory: true,
    status: 'active',
    tags: ['eucalyptus', 'wreath', 'organic', 'green'],
    images: [
      { image_url: '/samples/9/pomelli_photoshoot-1.png', sort_order: 1 },
      { image_url: '/samples/9/pomelli_photoshoot-2.png', sort_order: 2 }
    ]
  },
  {
    id: uuidMap['prod-10'],
    title: 'Pomelli Royal Azure Ribbed Bowl',
    slug: 'pomelli-royal-azure-ribbed-bowl',
    description: 'A deep blue ribbed ceramic bowl supporting a dramatic spherical arrangement of warm pink, cream, and apricot preserved flowers. A statement centerpiece.',
    category_id: uuidMap['cat-4'],
    price: 5500,
    sku: 'VASE-AZUR-010',
    stock_quantity: 4,
    track_inventory: true,
    status: 'active',
    tags: ['ceramic', 'blue', 'pink', 'table-vase', 'centerpiece'],
    images: [
      { image_url: '/samples/10/creative.png', sort_order: 1 },
      { image_url: '/samples/10/pomelli_photoshoot-1.png', sort_order: 2 },
      { image_url: '/samples/10/pomelli_photoshoot-2.png', sort_order: 3 },
      { image_url: '/samples/10/pomelli_photoshoot-3.png', sort_order: 4 }
    ]
  },
  {
    id: uuidMap['prod-11'],
    title: 'Sunset Terracotta Vase',
    slug: 'sunset-terracotta-vase',
    description: 'A textured terracotta vase holding dried reeds, palm leaves, and ochre-colored banksia blooms. Evokes warm desert breezes and organic texture.',
    category_id: uuidMap['cat-4'],
    price: 4200,
    sku: 'VASE-TERR-011',
    stock_quantity: 9,
    track_inventory: true,
    status: 'active',
    tags: ['terracotta', 'vase', 'dried', 'desert', 'table-vase'],
    images: [
      { image_url: '/samples/11/pomelli_photoshoot-1.png', sort_order: 1 },
      { image_url: '/samples/11/pomelli_photoshoot-2.png', sort_order: 2 },
      { image_url: '/samples/11/pomelli_photoshoot-3.png', sort_order: 3 }
    ]
  }
];

// Hero slides
const heroSlides = [
  {
    image_url: '/samples/hero-1.png',
    heading: 'Handcrafted Preserved Florals',
    subheading: 'Timeless floral arrangements and decorative wreaths designed to elevate your living spaces.',
    cta_text: 'Explore Collection',
    cta_link: '/products',
    sort_order: 1,
    is_active: true,
  },
  {
    image_url: '/samples/hero-2.png',
    heading: 'Baskets & Arrangements',
    subheading: 'Charming wicker baskets, wreaths, and table centerpieces for beautiful settings.',
    cta_text: 'Shop Baskets',
    cta_link: '/products?category=baskets-arrangements',
    sort_order: 2,
    is_active: true,
  },
  {
    image_url: '/samples/hero-3.png',
    heading: 'Bespoke Wall Mounts',
    subheading: 'Three-dimensional wall plaques and pocket vases that redefine modern wall decor.',
    cta_text: 'View Wall Mounts',
    cta_link: '/products?category=wall-mounts',
    sort_order: 3,
    is_active: true,
  },
];

// Seed execution function
async function seed() {
  console.log('Starting Supabase database seeding...');

  try {
    // 1. Seed Categories
    console.log('Seeding categories...');
    for (const cat of categories) {
      const { error } = await supabase
        .from('categories')
        .upsert(cat, { onConflict: 'slug' });
      if (error) throw new Error(`Category seed failed: ${error.message}`);
    }
    console.log('Categories seeded successfully.');

    // 2. Seed Products & Images
    console.log('Seeding products and images...');
    for (const p of products) {
      const { images, ...productData } = p;
      
      const { error: productError } = await supabase
        .from('products')
        .upsert(productData, { onConflict: 'slug' });
        
      if (productError) throw new Error(`Product seed failed for "${p.title}": ${productError.message}`);

      // Seed product images
      for (const img of images) {
        const { error: imgError } = await supabase
          .from('product_images')
          .upsert({
            product_id: p.id,
            image_url: img.image_url,
            sort_order: img.sort_order,
            alt_text: p.title
          }, { onConflict: 'product_id,image_url' }); // Note: unique key or upsert fallback
          
        if (imgError) {
          // If upsert fails on constraint, insert directly
          const { error: insError } = await supabase
            .from('product_images')
            .insert({
              product_id: p.id,
              image_url: img.image_url,
              sort_order: img.sort_order,
              alt_text: p.title
            });
          if (insError && !insError.message.includes('duplicate key')) {
            console.warn(`Warning: Image insert failed for "${p.title}": ${insError.message}`);
          }
        }
      }
    }
    console.log('Products and images seeded successfully.');

    // 3. Seed Hero Slides
    console.log('Seeding hero slides...');
    for (const slide of heroSlides) {
      const { error } = await supabase
        .from('hero_slides')
        .upsert(slide, { onConflict: 'heading' });
      if (error) {
        // If upsert fails due to constraint, just insert
        const { error: insError } = await supabase
          .from('hero_slides')
          .insert(slide);
        if (insError && !insError.message.includes('duplicate key')) {
          console.warn(`Warning: Hero slide insert failed: ${insError.message}`);
        }
      }
    }
    console.log('Hero slides seeded successfully.');

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seed();
