/**
 * API Response Utilities
 * Standardized response format for all API endpoints
 */

import { NextResponse } from 'next/server';
import { AppError, formatErrorResponse } from '@/lib/errors/AppError';
import { logger } from '@/lib/logger';

/**
 * Success response wrapper (alias: apiSuccess)
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

// Export alias for convenience
export const apiSuccess = successResponse;

/**
 * Error response wrapper (alias: apiError)
 */
export function errorResponse(error: Error | AppError | string, statusCode: number = 500, logContext?: Record<string, any>) {
  // Support both Error objects and string messages
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  
  // Log the error
  logger.error('API Error', errorObj, logContext);

  const formatted = formatErrorResponse(errorObj);
  const status = errorObj instanceof AppError ? errorObj.statusCode : statusCode;

  return NextResponse.json(formatted, { status });
}

// Export alias for convenience
export const apiError = errorResponse;

/**
 * Paginated response wrapper
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasMore: pagination.page * pagination.limit < pagination.total,
    },
  });
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T) {
  return successResponse(data, 201);
}

/**
 * No content response (204)
 */
export function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}

/**
 * API Handler wrapper with error handling
 */
export function withErrorHandling(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorResponse(error as Error, 500, {
        url: req.url,
        method: req.method,
      });
    }
  };
}

/**
 * Validate request body against schema
 */
export async function validateRequest<T>(
  req: Request,
  validator: (data: any) => { success: boolean; data?: T; errors?: any }
): Promise<T> {
  let body;
  try {
    body = await req.json();
  } catch {
    throw new AppError('Invalid JSON body', 400, 'INVALID_JSON');
  }

  const result = validator(body);
  
  if (!result.success) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', result.errors);
  }

  return result.data as T;
}
