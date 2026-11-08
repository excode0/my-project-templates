/**
 * Portfolio Creative Template Utilities
 */

/**
 * Format skill level to display percentage
 */
export function formatSkillLevel(level: number): string {
  return `${Math.min(100, Math.max(0, level))}%`;
}

/**
 * Parse comma-separated tags into array
 */
export function parseTags(tags: string): string[] {
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

/**
 * Get layout class name
 */
export function getLayoutClass(layout: string): string {
  return `layout-${layout}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get project category color
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'web design': '#6366f1',
    'branding': '#8b5cf6',
    'mobile design': '#ec4899',
    'ui/ux': '#06b6d4',
    'development': '#10b981',
  };
  
  return colors[category.toLowerCase()] || '#6366f1';
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate project card animation delay
 */
export function getAnimationDelay(index: number, baseDelay: number = 100): string {
  return `${index * baseDelay}ms`;
}
