import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/products';

const MAX_CATEGORY_LENGTH = 80;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category')?.trim() || undefined;

  if (category && category.length > MAX_CATEGORY_LENGTH) {
    return NextResponse.json(
      { error: `Invalid "category" query parameter: max length is ${MAX_CATEGORY_LENGTH}` },
      { status: 400 }
    );
  }

  const subCategories = productService.getSubCategories(category);
  return NextResponse.json({ subCategories });
}
