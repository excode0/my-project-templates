import { db } from '@/lib/db';
import type { TemplateCardData } from '@/components/public/TemplateCard';
import { MarketplaceClient } from './MarketplaceClient';

export const metadata = {
  title: 'Marketplace - KOREX Template Marketplace',
  description: 'Browse and purchase professional website templates with full customization',
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  const category = resolvedSearchParams.category;
  const search = resolvedSearchParams.search;
  const sort = resolvedSearchParams.sort || 'newest';

  // Build ORDER BY clause
  const getOrderBy = (sortType: string) => {
    switch (sortType) {
      case 'popular':
        return db`purchase_count DESC, t.created_at DESC`;
      case 'price-low':
        return db`t.price ASC`;
      case 'price-high':
        return db`t.price DESC`;
      case 'featured':
      case 'newest':
      default:
        return db`t.created_at DESC`;
    }
  };

  // Build query dynamically based on filters
  let templates;
  
  if (category && category !== 'all' && search) {
    // Both category and search filters
    const searchPattern = `%${search}%`;
    templates = await db`
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.category,
        t.price,
        t.preview_image,
        t.description,
        t.is_featured,
        t.created_at,
        u.email as contributor_email,
        COALESCE((SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id), 0)::int as purchase_count,
        (SELECT AVG(rating)::numeric(3,2) FROM template_reviews WHERE template_id = t.id) as avg_rating,
        COALESCE((SELECT COUNT(*) FROM template_reviews WHERE template_id = t.id), 0)::int as review_count
      FROM templates t
      JOIN users u ON t.contributor_id = u.id
      WHERE t.status = 'approved'
        AND t.category = ${category}
        AND (t.name ILIKE ${searchPattern} OR COALESCE(t.description, '') ILIKE ${searchPattern})
      ORDER BY ${getOrderBy(sort)}
    `;
  } else if (category && category !== 'all') {
    // Only category filter
    templates = await db`
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.category,
        t.price,
        t.preview_image,
        t.description,
        t.is_featured,
        t.created_at,
        u.email as contributor_email,
        COALESCE((SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id), 0)::int as purchase_count,
        (SELECT AVG(rating)::numeric(3,2) FROM template_reviews WHERE template_id = t.id) as avg_rating,
        COALESCE((SELECT COUNT(*) FROM template_reviews WHERE template_id = t.id), 0)::int as review_count
      FROM templates t
      JOIN users u ON t.contributor_id = u.id
      WHERE t.status = 'approved'
        AND t.category = ${category}
      ORDER BY ${getOrderBy(sort)}
    `;
  } else if (search) {
    // Only search filter
    const searchPattern = `%${search}%`;
    templates = await db`
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.category,
        t.price,
        t.preview_image,
        t.description,
        t.is_featured,
        t.created_at,
        u.email as contributor_email,
        COALESCE((SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id), 0)::int as purchase_count,
        (SELECT AVG(rating)::numeric(3,2) FROM template_reviews WHERE template_id = t.id) as avg_rating,
        COALESCE((SELECT COUNT(*) FROM template_reviews WHERE template_id = t.id), 0)::int as review_count
      FROM templates t
      JOIN users u ON t.contributor_id = u.id
      WHERE t.status = 'approved'
        AND (t.name ILIKE ${searchPattern} OR COALESCE(t.description, '') ILIKE ${searchPattern})
      ORDER BY ${getOrderBy(sort)}
    `;
  } else {
    // No filters
    templates = await db`
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.category,
        t.price,
        t.preview_image,
        t.description,
        t.is_featured,
        t.created_at,
        u.email as contributor_email,
        COALESCE((SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id), 0)::int as purchase_count,
        (SELECT AVG(rating)::numeric(3,2) FROM template_reviews WHERE template_id = t.id) as avg_rating,
        COALESCE((SELECT COUNT(*) FROM template_reviews WHERE template_id = t.id), 0)::int as review_count
      FROM templates t
      JOIN users u ON t.contributor_id = u.id
      WHERE t.status = 'approved'
      ORDER BY ${getOrderBy(sort)}
    `;
  }

  const templatesData: TemplateCardData[] = templates.map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: parseFloat(row.price),
    previewImage: row.preview_image,
    description: row.description,
    isFeatured: row.is_featured || false,
    createdAt: row.created_at.toISOString(),
    contributorUsername: null,
    contributorEmail: row.contributor_email,
    purchaseCount: row.purchase_count || 0,
    avgRating: row.avg_rating ? parseFloat(row.avg_rating) : null,
    reviewCount: row.review_count || 0,
  }));

  // Get categories for filter
  const categoriesResult = await db`
    SELECT DISTINCT category 
    FROM templates 
    WHERE status = 'approved' 
    ORDER BY category
  `;
  const categories = categoriesResult.map((row: any) => row.category);

  // Featured templates come first; fall back to the newest templates
  const featured = templatesData.filter((template) => template.isFeatured);
  const featuredTemplates = (featured.length > 0 ? featured : templatesData).slice(0, 3);

  return (
    <MarketplaceClient
      templates={templatesData}
      categories={categories}
      featuredTemplates={featuredTemplates}
      initialFilters={{
        category: resolvedSearchParams.category || 'all',
        search: resolvedSearchParams.search || '',
        sort: resolvedSearchParams.sort || 'newest',
      }}
    />
  );
}
