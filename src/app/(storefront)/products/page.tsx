import { getProducts, getCategories } from '@/lib/db';
import ProductsContent from './ProductsContent';
import { Suspense } from 'react';
import FlowerVaseLoader from '@/components/ui/FlowerVaseLoader';

export const unstable_instant = {
  prefetch: 'runtime',
  samples: [
    {
      searchParams: {
        category: 'all',
        search: '',
        sort: 'default',
      },
    },
  ],
};

function ProductsLoadingState() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex items-center justify-center">
      <FlowerVaseLoader label="Warming up our collections..." />
    </div>
  );
}

async function ProductsWrapper() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ProductsContent initialProducts={products} initialCategories={categories} />
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoadingState />}>
      <ProductsWrapper />
    </Suspense>
  );
}
