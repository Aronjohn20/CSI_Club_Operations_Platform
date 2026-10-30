// ==============================================================================
// CSI Club Operations Platform - Standalone Supabase Client & Repository Adapter
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AuditLogRecord,
  CoordinatorAssignmentRecord,
  EventRecord,
  MemberRecord,
} from '../types/index.js';

export interface SupabaseAdapterOptions {
  supabaseUrl: string;
  serviceRoleKey: string;
}

export interface ISupabaseRepository {
  // Members
  getMembers(options?: { activeOnly?: boolean; updatedSince?: string }): Promise<MemberRecord[]>;
  getMemberById(id: string): Promise<MemberRecord | null>;
  upsertMember(member: Partial<MemberRecord>): Promise<MemberRecord>;

  // Events
  getEvents(options?: { updatedSince?: string }): Promise<EventRecord[]>;
  getEventById(id: string): Promise<EventRecord | null>;
  upsertEvent(event: Partial<EventRecord>): Promise<EventRecord>;

  // Assignments
  getAssignments(): Promise<CoordinatorAssignmentRecord[]>;
  upsertAssignment(assignment: Partial<CoordinatorAssignmentRecord>): Promise<CoordinatorAssignmentRecord>;

  // Audit Logs
  createAuditLog(log: AuditLogRecord): Promise<void>;
  getAuditLogs?(): AuditLogRecord[];
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
        { onConflict: 'id' }
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
        { onConflict: 'id' }
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

  async upsertAssignment(assignment: Partial<CoordinatorAssignmentRecord>): Promise<CoordinatorAssignmentRecord> {
    const { data, error } = await this.client
      .from('coordinator_assignments')
      .upsert(
        {
          ...assignment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error) throw new Error(`[Supabase Error: upsertAssignment] ${error.message}`);
    return data as CoordinatorAssignmentRecord;
  }

  // --- Audit Logs ---
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
  private auditLogs: AuditLogRecord[] = [];

  async getMembers(): Promise<MemberRecord[]> {
    return Array.from(this.members.values());
  }

  async getMemberById(id: string): Promise<MemberRecord | null> {
    return this.members.get(id) || null;
  }

  async upsertMember(member: Partial<MemberRecord>): Promise<MemberRecord> {
    let existing: MemberRecord | null = null;
    if (member.id) {
      existing = this.members.get(member.id) || null;
    }

    const now = new Date().toISOString();
    const record: MemberRecord = {
      id: existing?.id || member.id || `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: member.name || existing?.name || 'Unnamed',
      email: member.email !== undefined ? member.email : existing?.email || null,
      join_year: member.join_year || existing?.join_year || new Date().getFullYear(),
      member_type: member.member_type || existing?.member_type || 'new_coordinator',
      assignment_count: member.assignment_count ?? existing?.assignment_count ?? 0,
      active: member.active !== undefined ? member.active : existing?.active ?? true,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    this.members.set(record.id, record);
    return record;
  }

  async getEvents(): Promise<EventRecord[]> {
    return Array.from(this.events.values());
  }

  async getEventById(id: string): Promise<EventRecord | null> {
    return this.events.get(id) || null;
  }

  async upsertEvent(event: Partial<EventRecord>): Promise<EventRecord> {
    let existing: EventRecord | null = null;
    if (event.id) {
      existing = this.events.get(event.id) || null;
    }

    const now = new Date().toISOString();
    const record: EventRecord = {
      id: existing?.id || event.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: event.name || existing?.name || 'Unnamed Event',
      event_date: event.event_date || existing?.event_date || new Date().toISOString().split('T')[0],
      status: event.status || existing?.status || 'planned',
      required_coordinator_count: event.required_coordinator_count || existing?.required_coordinator_count || 2,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    this.events.set(record.id, record);
    return record;
  }

  async getAssignments(): Promise<CoordinatorAssignmentRecord[]> {
    return Array.from(this.assignments.values());
  }

  async upsertAssignment(assignment: Partial<CoordinatorAssignmentRecord>): Promise<CoordinatorAssignmentRecord> {
    let existing: CoordinatorAssignmentRecord | null = null;
    if (assignment.id) {
      existing = this.assignments.get(assignment.id) || null;
    }

    const now = new Date().toISOString();
    const record: CoordinatorAssignmentRecord = {
      id: existing?.id || assignment.id || `asgn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      event_id: assignment.event_id || existing?.event_id || '',
      member_id: assignment.member_id || existing?.member_id || '',
      allocation_run_id: assignment.allocation_run_id || existing?.allocation_run_id || null,
      status: assignment.status || existing?.status || 'assigned',
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    this.assignments.set(record.id, record);
    return record;
  }

  async createAuditLog(log: AuditLogRecord): Promise<void> {
    this.auditLogs.push({ ...log, id: `audit-${Date.now()}`, created_at: new Date().toISOString() });
  }

  getAuditLogs(): AuditLogRecord[] {
    return [...this.auditLogs];
  }
}
