import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Validates that all required environment variables are present and valid
 * Throws an error if any required variable is missing or invalid
 */
export function validateEnvironment(): void {
  const errors: string[] = [];

  // Required variables
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate JWT_SECRET length (minimum 256 bits = 32 bytes)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long for security');
  }

  // Validate REFRESH_TOKEN_SECRET length
  if (process.env.REFRESH_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET.length < 32) {
    errors.push('REFRESH_TOKEN_SECRET must be at least 32 characters long for security');
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  // Validate PORT if provided
  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    errors.push('PORT must be a valid number');
  }

  // If there are any errors, throw them all at once
  if (errors.length > 0) {
    throw new Error(
      `Environment variable validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

/**
 * Get environment variables with defaults
 */
export const env = {
  PORT: parseInt(process.env.PORT || '3001'),
  DATABASE_URL: process.env.DATABASE_URL!,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};
