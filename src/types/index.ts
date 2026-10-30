// ==============================================================================
// CSI Club Operations Platform - Core Standalone Type Definitions
// ==============================================================================

export type MemberType = 'new_coordinator' | 'old_coordinator' | 'executive' | 'other';

export type EventStatus = 'draft' | 'planned' | 'confirmed' | 'completed' | 'cancelled';

export type AssignmentStatus = 'assigned' | 'confirmed' | 'declined' | 'completed' | 'replaced';

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
  notion_page_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRecord {
  id: string;
  name: string;
  event_date: string; // ISO date 'YYYY-MM-DD'
  status: EventStatus;
  required_coordinator_count: number;
  notion_page_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoordinatorAssignmentRecord {
  id: string;
  event_id: string;
  member_id: string;
  allocation_run_id: string | null;
  status: AssignmentStatus;
  notion_page_id?: string | null;
  created_at: string;
  updated_at: string;
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
