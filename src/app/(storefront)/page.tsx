import { getHeroSlides, getCategories, getProducts } from '@/lib/db';
import HomeContent from './HomeContent';
import { Suspense } from 'react';
import FlowerVaseLoader from '@/components/ui/FlowerVaseLoader';

function HomeLoadingState() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex items-center justify-center">
      <FlowerVaseLoader label="Warming up our collections..." />
    </div>
  );
}

async function HomeWrapper() {
  const [slides, categories, products] = await Promise.all([
    getHeroSlides(),
    getCategories(),
    getProducts(),
  ]);

  return (
    <HomeContent
      initialSlides={slides}
      initialCategories={categories}
      initialProducts={products}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoadingState />}>
      <HomeWrapper />
    </Suspense>
  );
}
