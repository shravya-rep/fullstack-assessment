import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/products';

const MAX_SKU_LENGTH = 32;
const SKU_PATTERN = /^[a-zA-Z0-9_-]+$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  const { sku } = await params;
  const normalizedSku = sku.trim();

  if (
    normalizedSku.length === 0 ||
    normalizedSku.length > MAX_SKU_LENGTH ||
    !SKU_PATTERN.test(normalizedSku)
  ) {
    return NextResponse.json(
      { error: 'Invalid product SKU' },
      { status: 400 }
    );
  }

  const product = productService.getById(normalizedSku);

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}
