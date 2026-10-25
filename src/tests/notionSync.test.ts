// ==============================================================================
// Unit Test: End-to-End Notion Sync Service
// ==============================================================================

import assert from 'node:assert';
import test from 'node:test';
import { IntegrationConfig } from '../config.js';
import { ResilientNotionClient } from '../notion/client.js';
import { NotionSyncService } from '../services/notionSyncService.js';
import { InMemorySupabaseRepository } from '../supabase/client.js';
import { NotionPageMeta } from '../types/index.js';

test('NotionSyncService pulls members into Supabase repository and tracks audit log', async () => {
  const repo = new InMemorySupabaseRepository();
  const mockConfig: IntegrationConfig = {
    notion: {
      apiKey: 'test_token',
      membersDatabaseId: 'db_members_123',
      eventsDatabaseId: 'db_events_123',
      assignmentsDatabaseId: 'db_assignments_123',
      requestsPerSecond: 10,
      maxRetries: 1,
      initialRetryDelayMs: 10,
    },
    supabase: {
      url: 'https://mock.supabase.co',
      serviceRoleKey: 'mock_key',
      anonKey: 'mock_anon',
    },
    sync: {
      conflictStrategy: 'latest_wins',
      batchSize: 50,
    },
  };

  const client = new ResilientNotionClient({ apiKey: 'mock' });

  // Mock queryAllPages to return 2 sample members
  client.queryAllPages = async (databaseId: string): Promise<NotionPageMeta[]> => {
    return [
      {
        id: 'notion-page-1',
        created_time: '2026-01-01T00:00:00Z',
        last_edited_time: '2026-01-01T12:00:00Z',
        archived: false,
        url: 'https://notion.so/page1',
        properties: {
          Name: { title: [{ plain_text: 'Siddharth V.' }] },
          Email: { email: 'siddharth@example.com' },
          'Join Year': { number: 2024 },
          'Member Type': { select: { name: 'New Coordinator' } },
          Active: { checkbox: true },
        },
      },
      {
        id: 'notion-page-2',
        created_time: '2026-01-01T00:00:00Z',
        last_edited_time: '2026-01-01T12:00:00Z',
        archived: false,
        url: 'https://notion.so/page2',
        properties: {
          Name: { title: [{ plain_text: 'Ananya Rao' }] },
          Email: { email: 'ananya@example.com' },
          'Join Year': { number: 2023 },
          'Member Type': { select: { name: 'Old Coordinator' } },
          Active: { checkbox: true },
        },
      },
    ];
  };

  const syncService = new NotionSyncService({
    config: mockConfig,
    notionClient: client,
    repository: repo,
  });

  const result = await syncService.pullMembers('admin');

  assert.strictEqual(result.recordsRead, 2);
  assert.strictEqual(result.recordsWritten, 2);
  assert.strictEqual(result.errors.length, 0);

  const savedMembers = await repo.getMembers();
  assert.strictEqual(savedMembers.length, 2);
  assert.strictEqual(savedMembers[0].name, 'Siddharth V.');
  assert.strictEqual(savedMembers[1].name, 'Ananya Rao');

  const auditLogs = repo.getAuditLogs();
  assert.ok(auditLogs.length >= 2);
  assert.strictEqual(auditLogs[0].action, 'notion.sync.started');
  assert.strictEqual(auditLogs[1].action, 'notion.sync.completed');
});
