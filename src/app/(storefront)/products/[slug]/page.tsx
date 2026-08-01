import { getProductBySlug, getProducts } from '@/lib/db';
import ProductDetailContent from './ProductDetailContent';
import { Suspense } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import FlowerVaseLoader from '@/components/ui/FlowerVaseLoader';

export const unstable_instant = {
  prefetch: 'runtime',
  samples: [
    {
      params: { slug: 'pomelli-harvest-wreath' },
    },
  ],
};

function ProductDetailLoadingState() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex items-center justify-center">
      <FlowerVaseLoader label="Fetching creation details..." />
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex items-center justify-center">
      <div className="text-center p-8 bg-white border border-[#000]/[0.05] rounded-[24px] max-w-[400px] shadow-sm">
        <div className="text-[32px] mb-4">🏺</div>
        <h1 className="text-[20px] font-normal mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Creation Not Found</h1>
        <p className="text-[14px] text-[#6B6B6B] mb-6">
          The arrangement you are looking for does not exist or has been retired from our collection.
        </p>
        <Link href="/products">
          <Button variant="primary">Browse All Creations</Button>
        </Link>
      </div>
    </div>
  );
}

async function ProductDetailWrapper({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return <ProductNotFound />;
  }

  // Fetch products to filter related products on the server
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  return (
    <ProductDetailContent product={product} relatedProducts={relatedProducts} />
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ProductDetailLoadingState />}>
      <ProductDetailWrapper params={params} />
    </Suspense>
  );
}
