/**
 * Input Validation Utilities
 * Common validation functions and schemas
 */

import { ValidationError } from '@/lib/errors/AppError';

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate slug format (lowercase, alphanumeric, hyphens)
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const maxSizeMB = options.maxSizeMB || 10;
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page: any,
  limit: any
): { page: number; limit: number } {
  const parsedPage = parseInt(page as string) || 1;
  const parsedLimit = parseInt(limit as string) || 20;

  return {
    page: Math.max(1, parsedPage),
    limit: Math.min(100, Math.max(1, parsedLimit)), // Max 100 items per page
  };
}

/**
 * Validate price (non-negative number)
 */
export function validatePrice(price: any): number {
  const parsed = parseFloat(price);
  
  if (isNaN(parsed) || parsed < 0) {
    throw new ValidationError('Invalid price value');
  }
  
  return parsed;
}

/**
 * Validate template category
 */
export function validateCategory(category: string): boolean {
  const validCategories = [
    'wedding',
    'portfolio',
    'business',
    'education',
    'restaurant',
    'event',
    'personal',
    'ecommerce',
  ];
  
  return validCategories.includes(category.toLowerCase());
}

/**
 * Validate template status
 */
export function validateTemplateStatus(status: string): boolean {
  const validStatuses = ['draft', 'pending', 'approved', 'rejected'];
  return validStatuses.includes(status.toLowerCase());
}

/**
 * Validate user role
 */
export function validateUserRole(role: string): boolean {
  const validRoles = ['user', 'contributor', 'admin'];
  return validRoles.includes(role.toLowerCase());
}

/**
 * Clean and validate JSON
 */
export function validateJson<T>(
  data: any,
  validator?: (data: any) => boolean
): T {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (validator && !validator(parsed)) {
      throw new ValidationError('JSON validation failed');
    }
    
    return parsed;
  } catch (error) {
    throw new ValidationError('Invalid JSON format');
  }
}

/**
 * Validate domain name
 */
export function validateDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

/**
 * Validate hex color
 */
export function validateColor(color: string): boolean {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return colorRegex.test(color);
}

/**
 * Generic object validator
 */
export function validateObject<T>(
  data: any,
  schema: Record<string, (value: any) => boolean>,
  required: string[] = []
): { success: boolean; data?: T; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Check required fields
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      errors[field] = `${field} is required`;
    }
  }

  // Validate fields
  for (const [field, validator] of Object.entries(schema)) {
    if (data[field] !== undefined && data[field] !== null) {
      try {
        if (!validator(data[field])) {
          errors[field] = `${field} is invalid`;
        }
      } catch (error) {
        errors[field] = (error as Error).message;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: data as T };
}
