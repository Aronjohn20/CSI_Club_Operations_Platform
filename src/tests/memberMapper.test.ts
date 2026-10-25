// ==============================================================================
// Unit Test: Member Mapper
// ==============================================================================

import assert from 'node:assert';
import test from 'node:test';
import { MemberMapper } from '../mappers/memberMapper.js';
import { MemberRecord, NotionPageMeta } from '../types/index.js';

test('MemberMapper converts MemberRecord to Notion properties', () => {
  const mapper = new MemberMapper();
  const sampleMember: MemberRecord = {
    id: 'mem-12345',
    name: 'Aarav Sharma',
    email: 'aarav@csi.example.com',
    join_year: 2024,
    member_type: 'new_coordinator',
    active: true,
    notion_page_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const props = mapper.toNotionProperties(sampleMember);

  assert.strictEqual(props['Name'].title[0].text.content, 'Aarav Sharma');
  assert.strictEqual(props['Email'].email, 'aarav@csi.example.com');
  assert.strictEqual(props['Join Year'].number, 2024);
  assert.strictEqual(props['Member Type'].select.name, 'New Coordinator');
  assert.strictEqual(props['Active'].checkbox, true);
  assert.strictEqual(props['App ID'].rich_text[0].text.content, 'mem-12345');
});

test('MemberMapper parses valid Notion page into MemberRecord', () => {
  const mapper = new MemberMapper();
  const mockPage: NotionPageMeta = {
    id: 'page-abc-123',
    created_time: '2026-01-01T00:00:00.000Z',
    last_edited_time: '2026-01-02T00:00:00.000Z',
    archived: false,
    url: 'https://notion.so/test',
    properties: {
      Name: { title: [{ plain_text: 'Priya Patel' }] },
      Email: { email: 'priya@csi.example.com' },
      'Join Year': { number: 2023 },
      'Member Type': { select: { name: 'Old Coordinator' } },
      Active: { checkbox: true },
      'App ID': { rich_text: [{ plain_text: 'mem-999' }] },
    },
  };

  const result = mapper.fromNotionPage(mockPage);

  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.member.name, 'Priya Patel');
  assert.strictEqual(result.member.email, 'priya@csi.example.com');
  assert.strictEqual(result.member.join_year, 2023);
  assert.strictEqual(result.member.member_type, 'old_coordinator');
  assert.strictEqual(result.member.notion_page_id, 'page-abc-123');
  assert.strictEqual(result.member.id, 'mem-999');
});

test('MemberMapper handles missing required properties with validation errors', () => {
  const mapper = new MemberMapper();
  const invalidPage: NotionPageMeta = {
    id: 'page-invalid',
    created_time: '2026-01-01T00:00:00.000Z',
    last_edited_time: '2026-01-02T00:00:00.000Z',
    archived: false,
    url: 'https://notion.so/invalid',
    properties: {
      // Missing Name title
    },
  };

  const result = mapper.fromNotionPage(invalidPage);

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.length > 0);
});
