// ==============================================================================
// CSI Club Operations Platform - Notion Integration Type Definitions
// ==============================================================================

export type MemberType = 'new_coordinator' | 'old_coordinator' | 'executive' | 'other';

export type EventStatus = 'draft' | 'planned' | 'confirmed' | 'completed' | 'cancelled';

export type AssignmentStatus = 'assigned' | 'confirmed' | 'declined' | 'completed' | 'replaced';

export type SyncDirection = 'pull_from_notion' | 'push_to_notion' | 'bidirectional';

export type SyncJobStatus = 'pending' | 'running' | 'completed' | 'partially_completed' | 'failed';

export type ConflictStrategy = 'notion_wins' | 'app_wins' | 'latest_wins' | 'manual';

export type EntityType = 'members' | 'events' | 'coordinator_assignments' | 'all';

// ------------------------------------------------------------------------------
// Application Entities (Supabase Records)
// ------------------------------------------------------------------------------
export interface MemberRecord {
  id: string;
  name: string;
  email: string | null;
  join_year: number;
  member_type: MemberType;
  active: boolean;
  role?: string;
  class_batch?: string;
  domain?: string;
  team_tier?: 'core' | 'sub_core';
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRecord {
  id: string;
  name: string;
  event_date: string; // ISO date 'YYYY-MM-DD'
  status: EventStatus;
  required_coordinator_count: number;
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoordinatorAssignmentRecord {
  id: string;
  event_id: string;
  member_id: string;
  allocation_run_id: string | null;
  status: AssignmentStatus;
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------------------------
// Sync & Job Tracking
// ------------------------------------------------------------------------------
export interface NotionSyncJobRecord {
  id: string;
  entity_type: EntityType;
  direction: SyncDirection;
  status: SyncJobStatus;
  started_at: string;
  completed_at: string | null;
  records_read: number;
  records_written: number;
  conflicts_detected: number;
  conflicts_resolved: number;
  error_summary: string | null;
  details: Record<string, unknown>;
  created_by: string;
}

export interface AuditLogRecord {
  id?: string;
  actor_id?: string | null;
  actor_role?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

// ------------------------------------------------------------------------------
// Notion Raw Property Representations (Server-Side)
// ------------------------------------------------------------------------------
export interface NotionPageMeta {
  id: string;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  url: string;
  properties: Record<string, any>;
}

// ------------------------------------------------------------------------------
// Schema Inspection & Mapping Validation
// ------------------------------------------------------------------------------
export interface DatabasePropertySchema {
  id: string;
  name: string;
  type: string;
  options?: string[];
}

export interface DatabaseInspectionResult {
  databaseId: string;
  title: string;
  properties: Record<string, DatabasePropertySchema>;
  isAccessible: boolean;
  validationErrors: string[];
}

// ------------------------------------------------------------------------------
// Sync Operation Results & Preview
// ------------------------------------------------------------------------------
export interface SyncItemError {
  identifier: string;
  entityType: EntityType;
  errorMessage: string;
  details?: unknown;
}

export interface ConflictRecord<T = unknown> {
  entityType: EntityType;
  id: string;
  notionPageId: string;
  appRecord: T;
  notionRecord: T;
  resolvedWith: 'notion' | 'app' | 'manual_skip';
  resolutionReason: string;
}

export interface SyncExecutionResult {
  jobId: string;
  entityType: EntityType;
  direction: SyncDirection;
  status: SyncJobStatus;
  startedAt: string;
  completedAt: string;
  recordsRead: number;
  recordsWritten: number;
  conflicts: ConflictRecord[];
  errors: SyncItemError[];
}

export interface ImportPreviewItem<T> {
  notionPageId: string;
  parsedData: Partial<T>;
  isValid: boolean;
  validationIssues: string[];
  willUpdateExisting: boolean;
  matchedLocalId?: string;
}

export interface ImportPreviewResult<T> {
  databaseId: string;
  totalFound: number;
  validCount: number;
  invalidCount: number;
  items: ImportPreviewItem<T>[];
}
