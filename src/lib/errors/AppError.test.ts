/**
 * Error Handling Tests
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  formatErrorResponse,
} from './AppError';

describe('Error Handling', () => {
  describe('AppError', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 500);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should include error code', () => {
      const error = new AppError('Test', 400, 'TEST_CODE');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should include details', () => {
      const details = { field: 'email' };
      const error = new AppError('Test', 400, 'TEST', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    it('should have correct status code', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should include validation details', () => {
      const details = { email: 'Invalid format' };
      const error = new ValidationError('Validation failed', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    it('should have correct status code', () => {
      const error = new AuthenticationError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Authentication required');
    });

    it('should allow custom message', () => {
      const error = new AuthenticationError('Token expired');
      expect(error.message).toBe('Token expired');
    });
  });

  describe('AuthorizationError', () => {
    it('should have correct status code', () => {
      const error = new AuthorizationError();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('NotFoundError', () => {
    it('should format message with resource', () => {
      const error = new NotFoundError('Template');
      expect(error.message).toBe('Template not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('ConflictError', () => {
    it('should have correct status code', () => {
      const error = new ConflictError('Duplicate entry');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('DatabaseError', () => {
    it('should have correct status code', () => {
      const error = new DatabaseError('Query failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('ExternalServiceError', () => {
    it('should format message with service name', () => {
      const error = new ExternalServiceError('Midtrans', 'Payment failed');
      expect(error.message).toBe('Midtrans error: Payment failed');
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });
  });

  describe('formatErrorResponse', () => {
    it('should format AppError correctly', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      const response = formatErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error.message).toBe('Invalid input');
      expect(response.error.code).toBe('VALIDATION_ERROR');
      expect(response.error.statusCode).toBe(400);
      expect(response.error.details).toEqual({ field: 'email' });
    });

    it('should hide details for unknown errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';
      
      const error = new Error('Database connection failed');
      const response = formatErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error.message).toBe('Internal server error');
      expect(response.error.code).toBe('INTERNAL_ERROR');
      expect(response.error.statusCode).toBe(500);
      
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should expose details for unknown errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
      
      const error = new Error('Specific error message');
      const response = formatErrorResponse(error);
      
      expect(response.error.message).toBe('Specific error message');
      
      (process.env as any).NODE_ENV = originalEnv;
    });
  });
});
