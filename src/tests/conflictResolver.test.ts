// ==============================================================================
// Unit Test: Conflict Resolver
// ==============================================================================

import assert from 'node:assert';
import test from 'node:test';
import { ConflictResolver } from '../services/conflictResolver.js';
import { MemberRecord } from '../types/index.js';

test('ConflictResolver detects identical data as no conflict', () => {
  const resolver = new ConflictResolver('latest_wins');
  const appRecord: MemberRecord = {
    id: 'mem-1',
    name: 'Rohan Gupta',
    email: 'rohan@example.com',
    join_year: 2024,
    member_type: 'new_coordinator',
    active: true,
    notion_page_id: 'page-1',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  };

  const notionRecord = { ...appRecord };

  const result = resolver.resolve({
    entityType: 'members',
    id: 'mem-1',
    notionPageId: 'page-1',
    appRecord,
    notionRecord,
    notionLastEditedTime: '2026-01-01T10:00:00Z',
  });

  assert.strictEqual(result.hasConflict, false);
  assert.strictEqual(result.winningSource, 'none');
});

test('ConflictResolver resolves latest_wins in favor of Notion when Notion edit is newer', () => {
  const resolver = new ConflictResolver('latest_wins');
  const appRecord: MemberRecord = {
    id: 'mem-1',
    name: 'Rohan Gupta',
    email: 'rohan@example.com',
    join_year: 2024,
    member_type: 'new_coordinator',
    active: true,
    notion_page_id: 'page-1',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  };

  const notionRecord: MemberRecord = {
    ...appRecord,
    name: 'Rohan S. Gupta (Updated)',
  };

  const result = resolver.resolve({
    entityType: 'members',
    id: 'mem-1',
    notionPageId: 'page-1',
    appRecord,
    notionRecord,
    notionLastEditedTime: '2026-01-02T12:00:00Z', // newer
  });

  assert.strictEqual(result.hasConflict, true);
  assert.strictEqual(result.winningSource, 'notion');
  assert.strictEqual(result.dataToApply?.name, 'Rohan S. Gupta (Updated)');
});

test('ConflictResolver resolves manual policy by skipping automatic mutation', () => {
  const resolver = new ConflictResolver('manual');
  const appRecord: MemberRecord = {
    id: 'mem-1',
    name: 'Rohan Gupta',
    email: 'rohan@example.com',
    join_year: 2024,
    member_type: 'new_coordinator',
    active: true,
    notion_page_id: 'page-1',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-02T12:00:00Z',
  };

  const notionRecord: MemberRecord = {
    ...appRecord,
    name: 'Rohan Gupta Jr.',
  };

  const result = resolver.resolve({
    entityType: 'members',
    id: 'mem-1',
    notionPageId: 'page-1',
    appRecord,
    notionRecord,
    notionLastEditedTime: '2026-01-02T14:00:00Z',
  });

  assert.strictEqual(result.hasConflict, true);
  assert.strictEqual(result.winningSource, 'none');
  assert.strictEqual(result.conflictRecord?.resolvedWith, 'manual_skip');
});
