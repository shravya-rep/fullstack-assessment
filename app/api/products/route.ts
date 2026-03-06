import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/products';

const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;
const MAX_FILTER_LENGTH = 80;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const categoryParam = searchParams.get('category')?.trim() || undefined;
  const subCategoryParam = searchParams.get('subCategory')?.trim() || undefined;
  const searchParam = searchParams.get('search')?.trim() || undefined;
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 20;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;

  if (!Number.isInteger(limit) || limit < 0) {
    return NextResponse.json(
      { error: 'Invalid "limit" query parameter' },
      { status: 400 }
    );
  }
  if (limit > MAX_LIMIT) {
    return NextResponse.json(
      { error: `Invalid "limit" query parameter: max allowed is ${MAX_LIMIT}` },
      { status: 400 }
    );
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return NextResponse.json(
      { error: 'Invalid "offset" query parameter' },
      { status: 400 }
    );
  }

  if (categoryParam && categoryParam.length > MAX_FILTER_LENGTH) {
    return NextResponse.json(
      { error: `Invalid "category" query parameter: max length is ${MAX_FILTER_LENGTH}` },
      { status: 400 }
    );
  }

  if (subCategoryParam && subCategoryParam.length > MAX_FILTER_LENGTH) {
    return NextResponse.json(
      {
        error: `Invalid "subCategory" query parameter: max length is ${MAX_FILTER_LENGTH}`,
      },
      { status: 400 }
    );
  }

  if (searchParam && searchParam.length > MAX_SEARCH_LENGTH) {
    return NextResponse.json(
      { error: `Invalid "search" query parameter: max length is ${MAX_SEARCH_LENGTH}` },
      { status: 400 }
    );
  }

  const filters = {
    category: categoryParam,
    subCategory: subCategoryParam,
    search: searchParam,
    limit,
    offset,
  };

  const products = productService.getAll(filters);
  const total = productService.getTotalCount({
    category: filters.category,
    subCategory: filters.subCategory,
    search: filters.search,
  });

  return NextResponse.json({
    products,
    total,
    limit: filters.limit,
    offset: filters.offset,
  });
}
