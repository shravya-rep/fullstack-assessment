'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  stacklineSku: string;
  title: string;
  categoryName: string;
  subCategoryName: string;
  imageUrls: string[];
  featureBullets: string[];
  retailPrice: number;
  retailerSku: string;
}

const PRICE_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function ProductPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sku = searchParams.get('sku');
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    if (!sku) {
      setProduct(null);
      setProductError('Product not found.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setProductError(null);
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(sku)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found.');
          }
          throw new Error('Failed to load product details.');
        }
        const data = (await response.json()) as Product;
        setProduct(data);
        setSelectedImage(0);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to fetch product details:', error);
        setProduct(null);
        setProductError(
          error instanceof Error
            ? error.message
            : 'We could not load this product right now.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadProduct();

    return () => controller.abort();
  }, [sku]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-96 w-full bg-muted" />
              </CardContent>
            </Card>
            <div className="space-y-4">
              <div className="h-5 w-1/3 rounded bg-muted" />
              <div className="h-10 w-4/5 rounded bg-muted" />
              <div className="h-7 w-1/4 rounded bg-muted" />
              <div className="h-4 w-1/3 rounded bg-muted" />
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="h-6 w-1/3 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-11/12 rounded bg-muted" />
                  <div className="h-4 w-10/12 rounded bg-muted" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              {productError ?? 'Product not found'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">{'>'}</li>
            <li>
              <Link
                href={`/?category=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                {product.categoryName}
              </Link>
            </li>
            <li aria-hidden="true">{'>'}</li>
            <li className="text-foreground" aria-current="page">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-96 w-full bg-muted">
                  {product.imageUrls[selectedImage] && (
                    <Image
                      src={product.imageUrls[selectedImage]}
                      alt={`Product image for ${product.title}`}
                      fill
                      className="object-contain p-8"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {product.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Select image ${idx + 1}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 border-2 rounded-lg overflow-hidden ${
                      selectedImage === idx ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.title} - Image ${idx + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-2">
                <Badge variant="secondary">{product.categoryName}</Badge>
                <Badge variant="outline">{product.subCategoryName}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl font-semibold mb-2">
                {PRICE_FORMATTER.format(product.retailPrice)}
              </p>
              <p className="text-sm text-muted-foreground">SKU: {product.retailerSku}</p>
            </div>

            {product.featureBullets.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">Features</h2>
                  <ul className="space-y-2">
                    {product.featureBullets.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Card className="p-8">
              <p className="text-center text-muted-foreground">
                Loading product page...
              </p>
            </Card>
          </div>
        </div>
      }
    >
      <ProductPageContent />
    </Suspense>
  );
}
