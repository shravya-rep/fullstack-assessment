"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  stacklineSku: string;
  title: string;
  categoryName: string;
  subCategoryName: string;
  imageUrls: string[];
  retailPrice: number;
}

interface CategoriesResponse {
  categories: string[];
}

interface SubCategoriesResponse {
  subCategories: string[];
}

interface ProductsResponse {
  products: Product[];
}

const ALL_CATEGORIES_VALUE = "__all_categories__";
const ALL_SUBCATEGORIES_VALUE = "__all_subcategories__";
const PRICE_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    ALL_CATEGORIES_VALUE
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    ALL_SUBCATEGORIES_VALUE
  );
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search") ?? "";
    const categoryParam = params.get("category");
    const subCategoryParam = params.get("subCategory");

    setSearch(searchParam);
    setDebouncedSearch(searchParam.trim());
    setSelectedCategory(categoryParam || ALL_CATEGORIES_VALUE);
    setSelectedSubCategory(subCategoryParam || ALL_SUBCATEGORIES_VALUE);
    setProductsError(null);
    setInitialized(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory !== ALL_CATEGORIES_VALUE) {
      params.set("category", selectedCategory);
    }
    if (selectedSubCategory !== ALL_SUBCATEGORIES_VALUE) {
      params.set("subCategory", selectedSubCategory);
    }

    const query = params.toString();
    const nextUrl = query ? `/?${query}` : "/";
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [initialized, debouncedSearch, selectedCategory, selectedSubCategory]);

  useEffect(() => {
    if (!initialized) return;

    const controller = new AbortController();

    fetchJson<CategoriesResponse>("/api/categories", controller.signal)
      .then((data) => setCategories(data.categories))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setCategories([]);
      });

    return () => controller.abort();
  }, [initialized]);

  useEffect(() => {
    if (!initialized) return;

    const controller = new AbortController();

    if (selectedCategory !== ALL_CATEGORIES_VALUE) {
      setSelectedSubCategory(ALL_SUBCATEGORIES_VALUE);
      fetchJson<SubCategoriesResponse>(
        `/api/subcategories?category=${encodeURIComponent(selectedCategory)}`,
        controller.signal
      )
        .then((data) => setSubCategories(data.subCategories))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setSubCategories([]);
        });
    } else {
      setSubCategories([]);
      setSelectedSubCategory(ALL_SUBCATEGORIES_VALUE);
    }

    return () => controller.abort();
  }, [initialized, selectedCategory]);

  useEffect(() => {
    if (!initialized) return;

    const controller = new AbortController();

    setLoading(true);
    setProductsError(null);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (selectedCategory !== ALL_CATEGORIES_VALUE) {
      params.append("category", selectedCategory);
    }
    if (selectedSubCategory !== ALL_SUBCATEGORIES_VALUE) {
      params.append("subCategory", selectedSubCategory);
    }
    params.append("limit", "20");

    fetchJson<ProductsResponse>(`/api/products?${params}`, controller.signal)
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch products:", error);
        setProducts([]);
        setProductsError(
          "We couldn't load products right now. Please try again."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [initialized, debouncedSearch, selectedCategory, selectedSubCategory]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-6">StackShop</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <Search
                aria-hidden="true"
                className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Input
                id="product-search"
                name="productSearch"
                autoComplete="off"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              name="category"
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger id="category-filter" className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES_VALUE}>
                  All Categories
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory !== ALL_CATEGORIES_VALUE &&
              subCategories.length > 0 && (
              <Select
                name="subCategory"
                value={selectedSubCategory}
                onValueChange={(value) => setSelectedSubCategory(value)}
              >
                <SelectTrigger
                  id="subcategory-filter"
                  className="w-full md:w-[200px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SUBCATEGORIES_VALUE}>
                    All Subcategories
                  </SelectItem>
                  {subCategories.map((subCat) => (
                    <SelectItem key={subCat} value={subCat}>
                      {subCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(search ||
              selectedCategory !== ALL_CATEGORIES_VALUE ||
              selectedSubCategory !== ALL_SUBCATEGORIES_VALUE) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(ALL_CATEGORIES_VALUE);
                  setSelectedSubCategory(ALL_SUBCATEGORIES_VALUE);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {selectedCategory !== ALL_CATEGORIES_VALUE && (
          <nav
            aria-label="Breadcrumb"
            className="mb-4 text-sm text-muted-foreground"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground underline-offset-4 hover:underline"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory(ALL_CATEGORIES_VALUE);
                    setSelectedSubCategory(ALL_SUBCATEGORIES_VALUE);
                    setProductsError(null);
                  }}
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">{">"}</li>
              <li className="text-foreground" aria-current="page">
                {selectedCategory}
              </li>
            </ol>
          </nav>
        )}

        {loading ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Loading products...</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Card key={idx} className="h-full animate-pulse">
                  <CardHeader className="p-0">
                    <div className="h-48 w-full rounded-t-lg bg-muted" />
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="h-4 w-4/5 rounded bg-muted" />
                    <div className="h-6 w-1/3 rounded bg-muted" />
                    <div className="flex gap-2">
                      <div className="h-5 w-20 rounded bg-muted" />
                      <div className="h-5 w-24 rounded bg-muted" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 w-full rounded bg-muted" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            {productsError ? (
              <p className="text-destructive">{productsError}</p>
            ) : (
              <p className="text-muted-foreground">
                {search.trim()
                  ? `No products found for "${search.trim()}". Try a different keyword or clear filters.`
                  : "No products found. Try adjusting your filters."}
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {products.length} products
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <Link
                  key={product.stacklineSku}
                  href={{
                    pathname: "/product",
                    query: { sku: product.stacklineSku },
                  }}
                  aria-label={`View details for ${product.title}`}
                  className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
                        {product.imageUrls[0] && (
                          <Image
                            src={product.imageUrls[0]}
                            alt={`Product image for ${product.title}`}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index < 20}
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <CardTitle className="text-base line-clamp-2 mb-2">
                        {product.title}
                      </CardTitle>
                      <p className="text-lg font-semibold mb-2">
                        {PRICE_FORMATTER.format(product.retailPrice)}
                      </p>
                      <CardDescription className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">
                          {product.categoryName}
                        </Badge>
                        <Badge variant="outline">
                          {product.subCategoryName}
                        </Badge>
                      </CardDescription>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <span>View Details</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
