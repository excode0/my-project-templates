'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  LayoutTemplate,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from 'lucide-react';
import { TemplateCard, type TemplateCardData } from '@/components/public/TemplateCard';

interface MarketplaceClientProps {
  templates: TemplateCardData[];
  categories: string[];
  featuredTemplates: TemplateCardData[];
  initialFilters: {
    category: string;
    search: string;
    sort: string;
  };
}

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'featured', label: 'Featured first' },
];

export function MarketplaceClient({
  templates,
  categories,
  featuredTemplates,
  initialFilters,
}: MarketplaceClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') {
        params.set('category', filters.category);
      }
      if (filters.search) {
        params.set('search', filters.search);
      }
      if (filters.sort && filters.sort !== 'newest') {
        params.set('sort', filters.sort);
      }

      const query = params.toString();
      router.push(`/marketplace${query ? `?${query}` : ''}` as any);
    }, 350);

    return () => clearTimeout(timeout);
  }, [filters, router]);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: 'all', search: '', sort: 'newest' });
  };

  const hasActiveFilters =
    filters.category !== 'all' || filters.search !== '' || filters.sort !== 'newest';

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="pointer-events-none absolute inset-0 bg-radial-fire" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="korex-section relative py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="korex-eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Korex Marketplace
            </span>
            <h1 className="korex-h1 mt-6">
              Find your next
              <span className="text-gradient-fire"> masterpiece</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Professionally crafted, fully customizable templates. Preview every design
              live, then make it entirely yours with the Korex visual editor.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-orange-600" />
                {templates.length} templates available
              </span>
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-600" />
                17+ editable slot types
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-600" />
                Lifetime updates
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featuredTemplates.length > 0 && (
        <section className="korex-section pt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="korex-eyebrow">
                <Star className="h-3.5 w-3.5" />
                Staff picks
              </span>
              <h2 className="korex-h2 mt-4">Featured templates</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="korex-section pt-16">
        <div className="korex-card p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Filter &amp; search</h2>
              <p className="text-sm text-slate-600">Find your perfect starting point</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-slate-900">
                Category
              </label>
              <select
                id="category"
                value={filters.category}
                onChange={(event) => updateFilter('category', event.target.value)}
                className="korex-input appearance-none capitalize"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-white capitalize">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="search" className="block text-sm font-medium text-slate-900">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <input
                  id="search"
                  type="text"
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Search templates..."
                  className="korex-input pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sort" className="block text-sm font-medium text-slate-900">
                Sort by
              </label>
              <select
                id="sort"
                value={filters.sort}
                onChange={(event) => updateFilter('sort', event.target.value)}
                className="korex-input appearance-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="korex-section py-16">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="korex-h2">All templates</h2>
            <p className="mt-2 text-sm text-slate-600">
              Showing <span className="font-semibold text-orange-600">{templates.length}</span>{' '}
              template{templates.length === 1 ? '' : 's'}
              {filters.search && (
                <>
                  {' '}
                  for <span className="text-slate-900">&ldquo;{filters.search}&rdquo;</span>
                </>
              )}
            </p>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="korex-card mt-10 flex flex-col items-center justify-center px-6 py-16 text-center">
            <LayoutTemplate className="h-10 w-10 text-orange-300" />
            <h3 className="korex-h3 mt-4">No templates found</h3>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              We couldn&apos;t find anything matching your filters. Try a different search or
              browse all templates.
            </p>
            <button type="button" onClick={clearFilters} className="korex-btn-primary mt-6">
              Reset filters
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="korex-section pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-orange-200 bg-orange-50/60 px-8 py-14 text-center">
          <div className="pointer-events-none absolute inset-0 bg-radial-fire" />
          <div className="relative mx-auto max-w-xl">
            <h2 className="korex-h2">Can&apos;t decide?</h2>
            <p className="mt-3 text-slate-600">
              Preview any template live, then customize it completely after purchase.
            </p>
            <Link href="/contact" className="korex-btn-ghost mt-6">
              Talk to our team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
