/**
 * Test Helper Utilities
 * Common test utilities and mocks
 */

import { vi } from 'vitest';

/**
 * Mock database client
 */
export function createMockDb() {
  return {
    query: vi.fn(),
    getClient: vi.fn(() => ({
      query: vi.fn(),
      release: vi.fn(),
    })),
  };
}

/**
 * Mock NextAuth session
 */
export function createMockSession(overrides = {}) {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      ...overrides,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Mock Request object
 */
export function createMockRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
} = {}) {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body = null,
    headers = {},
  } = options;

  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock template data
 */
export function createMockTemplate(overrides = {}) {
  return {
    id: 'template-123',
    name: 'Test Template',
    slug: 'test-template',
    description: 'A test template',
    category: 'portfolio',
    price: '199000',
    status: 'approved',
    contributor_id: 'contributor-123',
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock template instance
 */
export function createMockInstance(overrides = {}) {
  return {
    id: 'instance-123',
    user_id: 'user-123',
    template_id: 'template-123',
    name: 'My Site',
    config: {},
    subdomain: 'mysite',
    custom_domain: null,
    domain_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock user
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'user@example.com',
    username: 'testuser',
    name: 'Test User',
    role: 'user',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Mock fetch API
 */
export function mockFetch(response: any, options: { status?: number } = {}) {
  const { status = 200 } = options;
  
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers(),
    } as Response)
  );
}

/**
 * Reset all mocks
 */
export function resetMocks() {
  vi.clearAllMocks();
  vi.resetAllMocks();
}

/**
 * Mock console methods
 */
export function mockConsole() {
  return {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  };
}
