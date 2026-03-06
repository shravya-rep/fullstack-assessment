# Status Report

## Summary

- Total issues tracked: **33**
- Fixed: **33**
- Open: **0**

## UX Issues

1. **[Fixed]** Subcategory dropdown showed unrelated options because category was not passed to the subcategory API request.
   - Fix: Updated the frontend request to `/api/subcategories?category=<selectedCategory>`.
   - Why this approach: It keeps the UI options aligned with the active category filter and removes irrelevant choices.
2. **[Fixed]** Subcategory selection could remain stale after changing category.
   - Fix: Reset selected subcategory whenever category changes.
   - Why this approach: Dependent filters must be cleared when parent state changes to avoid invalid combinations.
3. **[Fixed]** Frontend fetches had weak error handling, which could lead to stale/loading UX problems.
   - Fix: Added `.catch(...)` handlers and used `.finally(...)` to always clear loading state.
   - Why this approach: It is a minimal, reliable way to keep UI state consistent during request failures.
4. **[Fixed]** Product cards used nested interactive elements (`Link` wrapping a `Button`), which was an accessibility UX issue.
   - Fix: Removed nested interactive behavior and rendered the CTA as non-button content inside the link.
   - Why this approach: It preserves clickable card behavior while restoring valid and accessible semantics.
5. **[Fixed]** App metadata/title was generic (`Create Next App`) and has been updated to product-specific values.
   - Fix: Replaced default metadata with `StackShop` title and a relevant description.
   - Why this approach: Product-specific metadata improves user clarity and better reflects the actual application.
6. **[Fixed]** Search text with leading/trailing whitespace produced inconsistent filtering behavior.
   - Fix: Trimmed search text before building product query parameters.
   - Why this approach: Normalizing user input improves search consistency with minimal behavior change.
7. **[Fixed]** Next.js warned that above-the-fold product card images could become LCP candidates without preloading.
   - Fix: Added conditional `priority` on top product grid images (`priority={index < 4}`) in the home page listing.
   - Why this approach: Preloading likely LCP images reduces initial visual load delay while avoiding eager loading for all cards.
8. **[Fixed]** Search input field lacked explicit form identifiers (`id`/`name`), which can impact browser autofill and form tooling.
   - Fix: Added `id`, `name`, `autoComplete`, and an associated screen-reader label to the product search input.
   - Why this approach: Explicit field semantics improve accessibility, compatibility with browser features, and diagnostics quality.
9. **[Fixed]** Filter form controls still triggered autofill diagnostics because select fields were missing explicit identifiers.
   - Fix: Added `name` and `id` attributes for category and subcategory filter controls.
   - Why this approach: Consistent field identification across all form-like controls eliminates browser/tooling warnings and improves accessibility semantics.
10. **[Fixed]** LCP warning persisted for some product images because the preload set was too narrow for certain viewport/content combinations.
   - Fix: Expanded `priority` coverage on home-page product cards (`index < 8`) while keeping product-page thumbnail images non-priority.
   - Why this approach: It improves likely LCP candidates on listing pages without over-preloading secondary assets that trigger unused-preload warnings.
11. **[Fixed]** "Back to Products" navigation returned users to the home page instead of their previous filtered category/subcategory context.
   - Fix: Updated product-page back actions to use browser history navigation (`router.back()`) instead of static navigation to `/`.
   - Why this approach: History-based back behavior preserves user journey context and matches expected navigation semantics for drill-down flows.
12. **[Fixed]** Product detail page emitted repeated LCP/preload warnings for hero images due to inconsistent preload behavior.
   - Fix: Set the main product hero image to `priority` and kept thumbnail images non-priority.
   - Why this approach: It ensures the above-the-fold LCP candidate is intentionally preloaded while avoiding unnecessary preloads for secondary gallery assets.
13. **[Fixed]** Search empty state was generic and did not show what query returned no matches.
   - Fix: Updated "no results" messaging to show the typed search query (when present) with friendly guidance.
   - Why this approach: Contextual empty states reduce user confusion and make search refinement faster without changing filtering behavior.
14. **[Fixed]** Loading states could appear sparse/blank during product fetches, reducing perceived responsiveness.
   - Fix: Added skeleton loaders for both product list and product detail fetch states using existing card layouts.
   - Why this approach: Skeletons preserve layout continuity and provide immediate visual feedback while data loads, without introducing complex state logic.
15. **[Fixed]** Product data request failures did not provide clear user-facing feedback and lacked debug logging.
   - Fix: Added user-friendly request-failure handling in product list/detail fetch flows and added basic `console.error` logging for debugging paths.
   - Why this approach: Explicit failure messaging prevents silent UI confusion while lightweight logging improves diagnosability without changing API behavior.
16. **[Fixed]** Accessibility metadata and keyboard cues were incomplete for key product browsing interactions.
   - Fix: Improved image alt text clarity, added explicit `aria-label` for product-detail links, hid decorative search icon from assistive tech, and added visible focus-ring styling for keyboard navigation on product cards.
   - Why this approach: It improves screen-reader context and keyboard discoverability with minimal visual changes and without altering existing interaction flows.
17. **[Fixed]** Search triggered filtering/fetching on every keystroke, causing unnecessary request churn.
   - Fix: Added a simple 300ms debounced search state and wired list filtering/URL sync to the debounced value.
   - Why this approach: Debouncing keeps implementation lightweight while significantly reducing redundant renders and API calls during typing.
18. **[Fixed]** Breadcrumb navigation was missing/inconsistent across product and category browsing flows.
   - Fix: Added `Home > Category > Product` on product detail, added `Home > {Category}` on category-filtered listing, and ensured Home breadcrumb resets filter state while navigating to `/`.
   - Why this approach: A unified breadcrumb model improves orientation and predictable navigation while keeping route and UI state aligned.

## Design Problems

1. **[Fixed]** Product detail routing used serialized product JSON in URL params instead of stable SKU-based routing.
   - Fix: Changed routing to pass only `sku` in query params.
   - Why this approach: ID-based routes are stable, shareable, and avoid exposing mutable payload data in URLs.
2. **[Fixed]** Product detail page did not use the canonical `/api/products/[sku]` endpoint.
   - Fix: Updated product page to fetch details from `/api/products/[sku]`.
   - Why this approach: Centralizing reads through the API avoids duplicated data logic and keeps behavior consistent.
3. **[Fixed]** Repository had mixed lockfiles (`yarn.lock` and `package-lock.json`); lockfiles were standardized to Yarn only.
   - Fix: Removed `package-lock.json` and retained `yarn.lock`.
   - Why this approach: One lockfile ensures deterministic installs and avoids cross-package-manager drift.
4. **[Fixed]** Asynchronous requests on list/detail pages could race and overwrite newer UI state.
   - Fix: Added `AbortController` cleanup to category, subcategory, product list, and product detail fetches.
   - Why this approach: Cancelling obsolete requests prevents stale responses from mutating current state.

## Functionality Bugs

1. **[Fixed]** Production build failed on `/product` because `useSearchParams()` was not wrapped in `Suspense`.
   - Fix: Wrapped product-page search-param usage in a `Suspense` boundary with fallback UI.
   - Why this approach: It directly satisfies Next.js App Router requirements and restores successful production builds.
2. **[Fixed]** `/api/products` did not validate `limit`/`offset` query parameters.
   - Fix: Added validation for non-negative integer `limit` and `offset`, returning `400` for invalid values.
   - Why this approach: Defensive input validation prevents undefined behavior and enforces a clear API contract.
3. **[Fixed]** Product and taxonomy fetches did not validate HTTP status before consuming response JSON.
   - Fix: Added explicit `response.ok` checks before parsing JSON responses.
   - Why this approach: Failing fast on non-2xx responses avoids treating server errors as valid data.
4. **[Fixed]** Thumbnail controls on the product page were missing explicit button semantics.
   - Fix: Added `type="button"` and descriptive `aria-label` values to thumbnail buttons.
   - Why this approach: Explicit semantics improve accessibility and prevent accidental form-submit behavior.
5. **[Fixed]** Some searched products crashed image rendering with `next/image` hostname validation errors.
   - Fix: Added `images-na.ssl-images-amazon.com` to `images.remotePatterns` in `next.config.ts`.
   - Why this approach: Allowlisting all dataset image hosts prevents runtime image loader failures while preserving Next.js domain safety checks.
6. **[Fixed]** Product detail fetch handling was inconsistent with the standard async JSON parsing pattern.
   - Fix: Refactored product detail API handling to `async/await` and explicit `const data = await response.json()` flow.
   - Why this approach: A consistent response parsing style improves readability, reduces promise-chain complexity, and makes error handling easier to follow.
7. **[Fixed]** Search failed for simple plural variants (for example, `chocolates` not matching results that appear for `chocolate`).
   - Fix: Updated product filtering logic to normalize search input (`trim().toLowerCase()`), keep case-insensitive substring matching, and additionally try a singular form when query ends with `s`.
   - Why this approach: It preserves lightweight search behavior while improving relevance for common singular/plural user input variations without adding heavy stemming logic.
8. **[Fixed]** Product price existed in API/data (`retailPrice`) but was not displayed in product list/detail views.
   - Fix: Added `retailPrice` to product types and rendered formatted USD prices on both the home product cards and product detail page.
   - Why this approach: It resolves the true data-to-UI gap by wiring an existing API field through typed models into the visible components, without changing endpoint contracts.

## Potential Security Vulnerabilities

1. **[Fixed]** `next@15.5.4` vulnerability exposure was resolved by upgrading to `next@15.5.12`; dependency audit now reports no vulnerabilities.
   - Fix: Upgraded `next` and `eslint-config-next` to `15.5.12`.
   - Why this approach: Moving to patched upstream versions is the lowest-risk and officially recommended remediation path.
2. **[Fixed]** Product detail data was client-tamperable via URL JSON payload; now replaced with SKU-based server fetch.
   - Fix: Removed product JSON from URLs and fetched product data server-side by SKU.
   - Why this approach: Trusting server-fetched data reduces tampering surface and keeps detail rendering authoritative.
3. **[Fixed]** Unbounded page-size requests could increase resource consumption risk on `/api/products`.
   - Fix: Added a maximum allowed `limit` (`100`) and return `400` when exceeded.
   - Why this approach: Bounding request size reduces abuse potential while preserving normal pagination usage.
4. **[Fixed]** API query parameters were not consistently bounded/validated (`search`, `category`, `subCategory`, `sku`), enabling oversized or malformed input.
   - Fix: Added trimming, max-length guards, and SKU format validation in product and subcategory API routes, returning `400` for invalid input.
   - Why this approach: Early input validation is a low-risk hardening step that reduces abuse surface and keeps API behavior predictable.
5. **[Fixed]** External image allowlist accepted any path on trusted hosts, which was broader than necessary.
   - Fix: Restricted `next/image` remote patterns to `/images/**` paths for allowed Amazon hosts.
   - Why this approach: Narrowing allowed paths preserves required functionality while reducing unnecessary external-fetch surface.

## Improvements and Enhancements

1. **Breadcrumb navigation improvements**
   - What changed: Added more consistent breadcrumb trails across listing and product detail views (for example, `Home > Category > Product`), and ensured breadcrumb navigation preserves expected context.
   - Why this helps: Clear hierarchy navigation reduces confusion, helps users orient faster, and makes it easier to move between related catalog pages.

2. **Search UX improvements (plural handling and debouncing)**
   - What changed: Improved matching for simple singular/plural query variations and added a debounce delay so filtering does not trigger on every keystroke.
   - Why this helps: Results feel more forgiving for natural typing patterns, and debouncing reduces unnecessary requests/re-renders for smoother interaction.

3. **Loading skeleton states**
   - What changed: Added skeleton placeholders for product list and product detail loading phases.
   - Why this helps: Skeletons prevent blank states and improve perceived performance by showing structure immediately while data is being fetched.

4. **Improved empty search states**
   - What changed: Updated the no-results UI to show more user-friendly messaging, including the current search query where relevant.
   - Why this helps: Contextual feedback makes it easier for users to understand outcomes and refine searches without guesswork.

5. **Accessibility improvements (ARIA labels, alt text, focus rings)**
   - What changed: Improved alt text quality, added clearer ARIA labels for key interactive elements, and enhanced visible keyboard focus states.
   - Why this helps: Better accessibility metadata improves usability for screen-reader and keyboard users, making core flows more inclusive.

6. **LCP image priority optimizations**
   - What changed: Tuned `next/image` `priority` usage for likely above-the-fold images in key pages.
   - Why this helps: Prioritizing likely LCP candidates improves initial visual load performance and can reduce user-perceived wait time.

7. **Error handling improvements**
   - What changed: Added user-friendly failure messages for product-data requests and basic console logging for debugging.
   - Why this helps: Users get clearer feedback instead of silent failures, and developers can troubleshoot request issues faster.

## Verification

- `npm run lint` passes.
- `npm run build` passes on Next.js `15.5.12`.
- `corepack yarn audit --level high` reports `0 vulnerabilities found`.

