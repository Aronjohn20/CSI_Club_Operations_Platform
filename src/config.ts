// ==============================================================================
// CSI Club Operations Platform - Notion & Supabase Configuration
// ==============================================================================

import dotenv from 'dotenv';
import { ConflictStrategy } from './types/index.js';

// Load environment variables from .env file
dotenv.config();

export interface IntegrationConfig {
  notion: {
    apiKey: string;
    membersDatabaseId: string;
    eventsDatabaseId: string;
    assignmentsDatabaseId: string;
    requestsPerSecond: number;
    maxRetries: number;
    initialRetryDelayMs: number;
  };
  supabase: {
    url: string;
    serviceRoleKey: string;
    anonKey: string;
  };
  sync: {
    conflictStrategy: ConflictStrategy;
    batchSize: number;
  };
}

/**
 * Asserts that the code is running in a server-side environment.
 * Prevents accidental exposure of Notion API Key or Supabase Service Role Key.
 */
function assertServerEnvironment(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[CRITICAL SECURITY VIOLATION] Notion & Supabase admin integration modules must NEVER run in client-side / browser environments.'
    );
  }
}

export function getConfig(): IntegrationConfig {
  assertServerEnvironment();

  const conflictStrategy = (process.env.NOTION_SYNC_CONFLICT_STRATEGY || 'latest_wins') as ConflictStrategy;
  const validStrategies: ConflictStrategy[] = ['notion_wins', 'app_wins', 'latest_wins', 'manual'];

  return {
    notion: {
      apiKey: process.env.NOTION_API_KEY || '',
      membersDatabaseId: process.env.NOTION_DATABASE_ID_MEMBERS || '',
      eventsDatabaseId: process.env.NOTION_DATABASE_ID_EVENTS || '',
      assignmentsDatabaseId: process.env.NOTION_DATABASE_ID_ASSIGNMENTS || '',
      requestsPerSecond: Number(process.env.NOTION_REQUESTS_PER_SECOND) || 2.5,
      maxRetries: Number(process.env.NOTION_MAX_RETRIES) || 4,
      initialRetryDelayMs: Number(process.env.NOTION_INITIAL_RETRY_DELAY_MS) || 1000,
    },
    supabase: {
      url: process.env.SUPABASE_URL || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      anonKey: process.env.SUPABASE_ANON_KEY || '',
    },
    sync: {
      conflictStrategy: validStrategies.includes(conflictStrategy) ? conflictStrategy : 'latest_wins',
      batchSize: Number(process.env.NOTION_SYNC_BATCH_SIZE) || 50,
    },
  };
}

export function validateConfigReadiness(config: IntegrationConfig): {
  isNotionReady: boolean;
  isSupabaseReady: boolean;
  missingKeys: string[];
} {
  const missingKeys: string[] = [];

  if (!config.notion.apiKey) missingKeys.push('NOTION_API_KEY');
  if (!config.notion.membersDatabaseId) missingKeys.push('NOTION_DATABASE_ID_MEMBERS');
  if (!config.notion.eventsDatabaseId) missingKeys.push('NOTION_DATABASE_ID_EVENTS');
  if (!config.supabase.url) missingKeys.push('SUPABASE_URL');
  if (!config.supabase.serviceRoleKey) missingKeys.push('SUPABASE_SERVICE_ROLE_KEY');

  const isNotionReady = !!config.notion.apiKey && !!config.notion.membersDatabaseId;
  const isSupabaseReady = !!config.supabase.url && !!config.supabase.serviceRoleKey;

  return {
    isNotionReady,
    isSupabaseReady,
    missingKeys,
  };
}
