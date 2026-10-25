// ==============================================================================
// CSI Club Operations Platform - Supabase Client & Repository Adapter
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AuditLogRecord,
  CoordinatorAssignmentRecord,
  EventRecord,
  MemberRecord,
  NotionSyncJobRecord,
} from '../types/index.js';

export interface SupabaseAdapterOptions {
  supabaseUrl: string;
  serviceRoleKey: string;
}

export interface ISupabaseRepository {
  // Members
  getMembers(options?: { activeOnly?: boolean; updatedSince?: string }): Promise<MemberRecord[]>;
  getMemberByNotionPageId(notionPageId: string): Promise<MemberRecord | null>;
  getMemberById(id: string): Promise<MemberRecord | null>;
  upsertMember(member: Partial<MemberRecord>): Promise<MemberRecord>;

  // Events
  getEvents(options?: { updatedSince?: string }): Promise<EventRecord[]>;
  getEventByNotionPageId(notionPageId: string): Promise<EventRecord | null>;
  getEventById(id: string): Promise<EventRecord | null>;
  upsertEvent(event: Partial<EventRecord>): Promise<EventRecord>;

  // Assignments
  getAssignments(): Promise<CoordinatorAssignmentRecord[]>;
  getAssignmentByNotionPageId(notionPageId: string): Promise<CoordinatorAssignmentRecord | null>;
  upsertAssignment(assignment: Partial<CoordinatorAssignmentRecord>): Promise<CoordinatorAssignmentRecord>;

  // Sync Jobs & Audit
  createSyncJob(job: Partial<NotionSyncJobRecord>): Promise<NotionSyncJobRecord>;
  updateSyncJob(jobId: string, updates: Partial<NotionSyncJobRecord>): Promise<void>;
  createAuditLog(log: AuditLogRecord): Promise<void>;
}

export class LiveSupabaseRepository implements ISupabaseRepository {
  private client: SupabaseClient;

  constructor(options: SupabaseAdapterOptions) {
    if (!options.supabaseUrl || !options.serviceRoleKey) {
      throw new Error('[SupabaseRepository] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    }
    this.client = createClient(options.supabaseUrl, options.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // --- Members ---
  async getMembers(options?: { activeOnly?: boolean; updatedSince?: string }): Promise<MemberRecord[]> {
    let query = this.client.from('members').select('*');
    if (options?.activeOnly) query = query.eq('active', true);
    if (options?.updatedSince) query = query.gt('updated_at', options.updatedSince);

    const { data, error } = await query;
    if (error) throw new Error(`[Supabase Error: getMembers] ${error.message}`);
    return (data || []) as MemberRecord[];
  }

  async getMemberByNotionPageId(notionPageId: string): Promise<MemberRecord | null> {
    const { data, error } = await this.client
      .from('members')
      .select('*')
      .eq('notion_page_id', notionPageId)
      .maybeSingle();

    if (error) throw new Error(`[Supabase Error: getMemberByNotionPageId] ${error.message}`);
    return (data as MemberRecord) || null;
  }

  async getMemberById(id: string): Promise<MemberRecord | null> {
    const { data, error } = await this.client.from('members').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`[Supabase Error: getMemberById] ${error.message}`);
    return (data as MemberRecord) || null;
  }

  async upsertMember(member: Partial<MemberRecord>): Promise<MemberRecord> {
    const { data, error } = await this.client
      .from('members')
      .upsert(
        {
          ...member,
          updated_at: new Date().toISOString(),
        },
        { onConflict: member.id ? 'id' : 'notion_page_id' }
      )
      .select('*')
      .single();

    if (error) throw new Error(`[Supabase Error: upsertMember] ${error.message}`);
    return data as MemberRecord;
  }

  // --- Events ---
  async getEvents(options?: { updatedSince?: string }): Promise<EventRecord[]> {
    let query = this.client.from('events').select('*');
    if (options?.updatedSince) query = query.gt('updated_at', options.updatedSince);

    const { data, error } = await query;
    if (error) throw new Error(`[Supabase Error: getEvents] ${error.message}`);
    return (data || []) as EventRecord[];
  }

  async getEventByNotionPageId(notionPageId: string): Promise<EventRecord | null> {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('notion_page_id', notionPageId)
      .maybeSingle();

    if (error) throw new Error(`[Supabase Error: getEventByNotionPageId] ${error.message}`);
    return (data as EventRecord) || null;
  }

  async getEventById(id: string): Promise<EventRecord | null> {
    const { data, error } = await this.client.from('events').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`[Supabase Error: getEventById] ${error.message}`);
    return (data as EventRecord) || null;
  }

  async upsertEvent(event: Partial<EventRecord>): Promise<EventRecord> {
    const { data, error } = await this.client
      .from('events')
      .upsert(
        {
          ...event,
          updated_at: new Date().toISOString(),
        },
        { onConflict: event.id ? 'id' : 'notion_page_id' }
      )
      .select('*')
      .single();

    if (error) throw new Error(`[Supabase Error: upsertEvent] ${error.message}`);
    return data as EventRecord;
  }

  // --- Assignments ---
  async getAssignments(): Promise<CoordinatorAssignmentRecord[]> {
    const { data, error } = await this.client.from('coordinator_assignments').select('*');
    if (error) throw new Error(`[Supabase Error: getAssignments] ${error.message}`);
    return (data || []) as CoordinatorAssignmentRecord[];
  }

  async getAssignmentByNotionPageId(notionPageId: string): Promise<CoordinatorAssignmentRecord | null> {
    const { data, error } = await this.client
      .from('coordinator_assignments')
      .select('*')
      .eq('notion_page_id', notionPageId)
      .maybeSingle();

    if (error) throw new Error(`[Supabase Error: getAssignmentByNotionPageId] ${error.message}`);
    return (data as CoordinatorAssignmentRecord) || null;
  }

  async upsertAssignment(assignment: Partial<CoordinatorAssignmentRecord>): Promise<CoordinatorAssignmentRecord> {
    const { data, error } = await this.client
      .from('coordinator_assignments')
      .upsert(
        {
          ...assignment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: assignment.id ? 'id' : 'notion_page_id' }
      )
      .select('*')
      .single();

    if (error) throw new Error(`[Supabase Error: upsertAssignment] ${error.message}`);
    return data as CoordinatorAssignmentRecord;
  }

  // --- Sync Jobs & Audit ---
  async createSyncJob(job: Partial<NotionSyncJobRecord>): Promise<NotionSyncJobRecord> {
    const { data, error } = await this.client
      .from('notion_sync_jobs')
      .insert({
        entity_type: job.entity_type || 'all',
        direction: job.direction || 'bidirectional',
        status: job.status || 'running',
        started_at: job.started_at || new Date().toISOString(),
        records_read: job.records_read || 0,
        records_written: job.records_written || 0,
        conflicts_detected: job.conflicts_detected || 0,
        conflicts_resolved: job.conflicts_resolved || 0,
        details: job.details || {},
        created_by: job.created_by || 'system',
      })
      .select('*')
      .single();

    if (error) throw new Error(`[Supabase Error: createSyncJob] ${error.message}`);
    return data as NotionSyncJobRecord;
  }

  async updateSyncJob(jobId: string, updates: Partial<NotionSyncJobRecord>): Promise<void> {
    const { error } = await this.client.from('notion_sync_jobs').update(updates).eq('id', jobId);
    if (error) throw new Error(`[Supabase Error: updateSyncJob] ${error.message}`);
  }

  async createAuditLog(log: AuditLogRecord): Promise<void> {
    const { error } = await this.client.from('audit_logs').insert({
      actor_id: log.actor_id || null,
      actor_role: log.actor_role || null,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id || null,
      metadata: log.metadata || {},
    });

    if (error) console.error(`[Supabase Error: createAuditLog] ${error.message}`);
  }
}

/**
 * In-memory repository implementation for local tests, dry runs, and mock simulations.
 */
export class InMemorySupabaseRepository implements ISupabaseRepository {
  private members = new Map<string, MemberRecord>();
  private events = new Map<string, EventRecord>();
  private assignments = new Map<string, CoordinatorAssignmentRecord>();
  private jobs = new Map<string, NotionSyncJobRecord>();
  private auditLogs: AuditLogRecord[] = [];

  async getMembers(): Promise<MemberRecord[]> {
    return Array.from(this.members.values());
  }

  async getMemberByNotionPageId(notionPageId: string): Promise<MemberRecord | null> {
    for (const m of this.members.values()) {
      if (m.notion_page_id === notionPageId) return m;
    }
    return null;
  }

  async getMemberById(id: string): Promise<MemberRecord | null> {
    return this.members.get(id) || null;
  }

  async upsertMember(member: Partial<MemberRecord>): Promise<MemberRecord> {
    const existing = (member.id && this.members.get(member.id)) || (member.notion_page_id && (await this.getMemberByNotionPageId(member.notion_page_id)));
    const now = new Date().toISOString();
    const record: MemberRecord = {
      id: existing?.id || member.id || `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: member.name || existing?.name || 'Unnamed',
      email: member.email !== undefined ? member.email : existing?.email || null,
      join_year: member.join_year || existing?.join_year || new Date().getFullYear(),
      member_type: member.member_type || existing?.member_type || 'new_coordinator',
      active: member.active !== undefined ? member.active : existing?.active ?? true,
      notion_page_id: member.notion_page_id || existing?.notion_page_id || null,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    this.members.set(record.id, record);
    return record;
  }

  async getEvents(): Promise<EventRecord[]> {
    return Array.from(this.events.values());
  }

  async getEventByNotionPageId(notionPageId: string): Promise<EventRecord | null> {
    for (const e of this.events.values()) {
      if (e.notion_page_id === notionPageId) return e;
    }
    return null;
  }

  async getEventById(id: string): Promise<EventRecord | null> {
    return this.events.get(id) || null;
  }

  async upsertEvent(event: Partial<EventRecord>): Promise<EventRecord> {
    const existing = (event.id && this.events.get(event.id)) || (event.notion_page_id && (await this.getEventByNotionPageId(event.notion_page_id)));
    const now = new Date().toISOString();
    const record: EventRecord = {
      id: existing?.id || event.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: event.name || existing?.name || 'Unnamed Event',
      event_date: event.event_date || existing?.event_date || new Date().toISOString().split('T')[0],
      status: event.status || existing?.status || 'planned',
      required_coordinator_count: event.required_coordinator_count || existing?.required_coordinator_count || 2,
      notion_page_id: event.notion_page_id || existing?.notion_page_id || null,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    this.events.set(record.id, record);
    return record;
  }

  async getAssignments(): Promise<CoordinatorAssignmentRecord[]> {
    return Array.from(this.assignments.values());
  }

  async getAssignmentByNotionPageId(notionPageId: string): Promise<CoordinatorAssignmentRecord | null> {
    for (const a of this.assignments.values()) {
      if (a.notion_page_id === notionPageId) return a;
    }
    return null;
  }

  async upsertAssignment(assignment: Partial<CoordinatorAssignmentRecord>): Promise<CoordinatorAssignmentRecord> {
    const existing = (assignment.id && this.assignments.get(assignment.id)) || (assignment.notion_page_id && (await this.getAssignmentByNotionPageId(assignment.notion_page_id)));
    const now = new Date().toISOString();
    const record: CoordinatorAssignmentRecord = {
      id: existing?.id || assignment.id || `asgn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      event_id: assignment.event_id || existing?.event_id || '',
      member_id: assignment.member_id || existing?.member_id || '',
      allocation_run_id: assignment.allocation_run_id || existing?.allocation_run_id || null,
      status: assignment.status || existing?.status || 'assigned',
      notion_page_id: assignment.notion_page_id || existing?.notion_page_id || null,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    this.assignments.set(record.id, record);
    return record;
  }

  async createSyncJob(job: Partial<NotionSyncJobRecord>): Promise<NotionSyncJobRecord> {
    const record: NotionSyncJobRecord = {
      id: `job-${Date.now()}`,
      entity_type: job.entity_type || 'all',
      direction: job.direction || 'bidirectional',
      status: job.status || 'running',
      started_at: job.started_at || new Date().toISOString(),
      completed_at: null,
      records_read: job.records_read || 0,
      records_written: job.records_written || 0,
      conflicts_detected: job.conflicts_detected || 0,
      conflicts_resolved: job.conflicts_resolved || 0,
      error_summary: null,
      details: job.details || {},
      created_by: job.created_by || 'system',
    };
    this.jobs.set(record.id, record);
    return record;
  }

  async updateSyncJob(jobId: string, updates: Partial<NotionSyncJobRecord>): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      this.jobs.set(jobId, { ...job, ...updates });
    }
  }

  async createAuditLog(log: AuditLogRecord): Promise<void> {
    this.auditLogs.push({ ...log, id: `audit-${Date.now()}`, created_at: new Date().toISOString() });
  }

  getAuditLogs(): AuditLogRecord[] {
    return [...this.auditLogs];
  }
}
