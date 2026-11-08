/**
 * Validation Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateUrl,
  validateSlug,
  validateDomain,
  validateColor,
  validatePrice,
  validateCategory,
  validateTemplateStatus,
  validateUserRole,
  validatePagination,
} from './index';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide specific error messages', () => {
      const result = validatePassword('password');
      expect(result.errors).toContain('Password must contain uppercase letter');
      expect(result.errors).toContain('Password must contain number');
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('https://sub.domain.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('validateSlug', () => {
    it('should validate correct slugs', () => {
      expect(validateSlug('valid-slug')).toBe(true);
      expect(validateSlug('test123')).toBe(true);
      expect(validateSlug('multi-word-slug')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(validateSlug('Invalid Slug')).toBe(false);
      expect(validateSlug('slug_with_underscore')).toBe(false);
      expect(validateSlug('UPPERCASE')).toBe(false);
      expect(validateSlug('special@chars')).toBe(false);
    });
  });

  describe('validateDomain', () => {
    it('should validate correct domain names', () => {
      expect(validateDomain('example.com')).toBe(true);
      expect(validateDomain('sub.example.com')).toBe(true);
      expect(validateDomain('test-site.co.uk')).toBe(true);
    });

    it('should reject invalid domain names', () => {
      expect(validateDomain('invalid')).toBe(false);
      expect(validateDomain('-invalid.com')).toBe(false);
      expect(validateDomain('invalid-.com')).toBe(false);
    });
  });

  describe('validateColor', () => {
    it('should validate hex colors', () => {
      expect(validateColor('#000000')).toBe(true);
      expect(validateColor('#fff')).toBe(true);
      expect(validateColor('#FF5733')).toBe(true);
    });

    it('should reject invalid colors', () => {
      expect(validateColor('000000')).toBe(false);
      expect(validateColor('#gg0000')).toBe(false);
      expect(validateColor('blue')).toBe(false);
    });
  });

  describe('validatePrice', () => {
    it('should validate positive prices', () => {
      expect(validatePrice(100)).toBe(100);
      expect(validatePrice('150.50')).toBe(150.50);
      expect(validatePrice(0)).toBe(0);
    });

    it('should reject invalid prices', () => {
      expect(() => validatePrice(-10)).toThrow();
      expect(() => validatePrice('invalid')).toThrow();
      expect(() => validatePrice(NaN)).toThrow();
    });
  });

  describe('validateCategory', () => {
    it('should validate valid categories', () => {
      expect(validateCategory('wedding')).toBe(true);
      expect(validateCategory('portfolio')).toBe(true);
      expect(validateCategory('business')).toBe(true);
    });

    it('should reject invalid categories', () => {
      expect(validateCategory('invalid')).toBe(false);
      expect(validateCategory('')).toBe(false);
    });
  });

  describe('validateTemplateStatus', () => {
    it('should validate valid statuses', () => {
      expect(validateTemplateStatus('draft')).toBe(true);
      expect(validateTemplateStatus('pending')).toBe(true);
      expect(validateTemplateStatus('approved')).toBe(true);
      expect(validateTemplateStatus('rejected')).toBe(true);
    });

    it('should reject invalid statuses', () => {
      expect(validateTemplateStatus('invalid')).toBe(false);
    });
  });

  describe('validateUserRole', () => {
    it('should validate valid roles', () => {
      expect(validateUserRole('user')).toBe(true);
      expect(validateUserRole('contributor')).toBe(true);
      expect(validateUserRole('admin')).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(validateUserRole('superadmin')).toBe(false);
      expect(validateUserRole('invalid')).toBe(false);
    });
  });

  describe('validatePagination', () => {
    it('should return valid pagination params', () => {
      const result = validatePagination('2', '50');
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('should use defaults for invalid params', () => {
      const result = validatePagination('invalid', 'invalid');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should enforce max limit', () => {
      const result = validatePagination('1', '1000');
      expect(result.limit).toBe(100);
    });

    it('should enforce min values', () => {
      const result = validatePagination('-1', '-1');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
    });
  });
});
