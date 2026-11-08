/**
 * Environment Configuration
 * Type-safe environment variable access
 */

/**
 * Get required environment variable
 */
function getEnvVar(key: string): string {
  const value = process.env[key];
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

/**
 * Get optional environment variable with default
 */
function getEnvVarOptional(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Application configuration
 */
export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  database: {
    url: getEnvVar('DATABASE_URL'),
  },

  // NextAuth
  auth: {
    url: getEnvVar('NEXTAUTH_URL'),
    secret: getEnvVar('NEXTAUTH_SECRET'),
  },

  // Application URLs
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL'),
    apiUrl: getEnvVar('NEXT_PUBLIC_API_URL'),
  },

  // Platform settings
  platform: {
    feePercentage: parseFloat(getEnvVarOptional('PLATFORM_FEE_PERCENTAGE', '30')),
    defaultDomainSuffix: getEnvVarOptional('DEFAULT_DOMAIN_SUFFIX', '.localhost.test'),
  },

  // File upload
  upload: {
    maxSizeMB: parseInt(getEnvVarOptional('MAX_UPLOAD_SIZE_MB', '10')),
    dir: getEnvVarOptional('UPLOAD_DIR', './public/uploads'),
  },

  // Redis cache
  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL,
  },

  // Payment gateway (Midtrans)
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    snapUrl: process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js',
  },

  // Email (SMTP)
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: {
      name: process.env.SMTP_FROM_NAME || 'TemplateMKT',
      email: process.env.SMTP_FROM_EMAIL || 'noreply@templatemkt.com',
    },
  },

  // Feature flags
  features: {
    rateLimit: getEnvVarOptional('FEATURE_RATE_LIMIT', 'true') === 'true',
    cache: getEnvVarOptional('FEATURE_CACHE', 'true') === 'true',
    analytics: getEnvVarOptional('FEATURE_ANALYTICS', 'false') === 'true',
  },
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_API_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}`
    );
  }
}

/**
 * Check if environment is properly configured
 */
export function checkEnv(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_API_URL',
  ];

  required.forEach(key => {
    if (!process.env[key]) {
      errors.push(`Missing required variable: ${key}`);
    }
  });

  // Optional but recommended
  if (!process.env.MIDTRANS_SERVER_KEY) {
    warnings.push('MIDTRANS_SERVER_KEY not set - payment will not work');
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    warnings.push('SMTP credentials not set - emails will not be sent');
  }

  if (!process.env.REDIS_URL && config.isProduction) {
    warnings.push('REDIS_URL not set - caching will use in-memory (not recommended for production)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
