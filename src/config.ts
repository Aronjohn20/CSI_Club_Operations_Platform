// ==============================================================================
// CSI Club Operations Platform - Standalone Configuration
// ==============================================================================

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface PlatformConfig {
  supabase: {
    url: string;
    serviceRoleKey: string;
    anonKey: string;
  };
}

/**
 * Asserts that the code is running in a server-side environment.
 * Prevents accidental exposure of Supabase Service Role Key.
 */
function assertServerEnvironment(): void {
  const isBrowser = typeof globalThis !== 'undefined' && 'window' in globalThis;
  if (isBrowser) {
    throw new Error(
      '[CRITICAL SECURITY VIOLATION] Supabase admin modules must NEVER run in client-side / browser environments.'
    );
  }
}

export function getConfig(): PlatformConfig {
  assertServerEnvironment();

  return {
    supabase: {
      url: process.env.SUPABASE_URL || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      anonKey: process.env.SUPABASE_ANON_KEY || '',
    },
  };
}

export function validateConfigReadiness(config: PlatformConfig): {
  isSupabaseReady: boolean;
  missingKeys: string[];
} {
  const missingKeys: string[] = [];

  if (!config.supabase.url) missingKeys.push('SUPABASE_URL');
  if (!config.supabase.anonKey) missingKeys.push('SUPABASE_ANON_KEY');

  return {
    isSupabaseReady: !!config.supabase.url && !!config.supabase.anonKey,
    missingKeys,
  };
}
