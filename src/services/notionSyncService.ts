// ==============================================================================
// CSI Club Operations Platform - Core Notion Synchronization Service
// ==============================================================================

import { IntegrationConfig } from '../config.js';
import { AssignmentMapper } from '../mappers/assignmentMapper.js';
import { EventMapper } from '../mappers/eventMapper.js';
import { MemberMapper } from '../mappers/memberMapper.js';
import { ResilientNotionClient } from '../notion/client.js';
import { ISupabaseRepository } from '../supabase/client.js';
import {
  ConflictRecord,
  ConflictStrategy,
  DatabaseInspectionResult,
  EntityType,
  EventRecord,
  ImportPreviewItem,
  ImportPreviewResult,
  MemberRecord,
  SyncDirection,
  SyncExecutionResult,
  SyncItemError,
} from '../types/index.js';
import { AuditLogger } from './auditLogger.js';
import { ConflictResolver } from './conflictResolver.js';

export interface NotionSyncServiceOptions {
  config: IntegrationConfig;
  notionClient: ResilientNotionClient;
  repository: ISupabaseRepository;
  memberMapper?: MemberMapper;
  eventMapper?: EventMapper;
  assignmentMapper?: AssignmentMapper;
  conflictResolver?: ConflictResolver;
}

export class NotionSyncService {
  private config: IntegrationConfig;
  private notionClient: ResilientNotionClient;
  private repository: ISupabaseRepository;
  private memberMapper: MemberMapper;
  private eventMapper: EventMapper;
  private assignmentMapper: AssignmentMapper;
  private conflictResolver: ConflictResolver;
  private auditLogger: AuditLogger;

  constructor(options: NotionSyncServiceOptions) {
    this.config = options.config;
    this.notionClient = options.notionClient;
    this.repository = options.repository;
    this.memberMapper = options.memberMapper || new MemberMapper();
    this.eventMapper = options.eventMapper || new EventMapper();
    this.assignmentMapper = options.assignmentMapper || new AssignmentMapper();
    this.conflictResolver = options.conflictResolver || new ConflictResolver(options.config.sync.conflictStrategy);
    this.auditLogger = new AuditLogger(this.repository);
  }

  // ----------------------------------------------------------------------------
  // Security Guard Check
  // ----------------------------------------------------------------------------
  public verifyAuthorizedRole(actorRole?: string): void {
    const authorizedRoles = ['admin', 'operations_lead', 'system'];
    if (!actorRole || !authorizedRoles.includes(actorRole.toLowerCase())) {
      throw new Error(`[Security Error] Role '${actorRole || 'anonymous'}' is unauthorized to configure or run Notion synchronization.`);
    }
  }

  // ----------------------------------------------------------------------------
  // Controlled Initial Import - 1. Inspect
  // ----------------------------------------------------------------------------
  async inspectDatabases(): Promise<{
    members: DatabaseInspectionResult;
    events: DatabaseInspectionResult;
  }> {
    const membersDbId = this.config.notion.membersDatabaseId;
    const eventsDbId = this.config.notion.eventsDatabaseId;

    if (!membersDbId || !eventsDbId) {
      throw new Error('Notion database IDs for members and events must be configured before inspection.');
    }

    const [members, events] = await Promise.all([
      this.notionClient.inspectDatabase(membersDbId),
      this.notionClient.inspectDatabase(eventsDbId),
    ]);

    return { members, events };
  }

  // ----------------------------------------------------------------------------
  // Controlled Initial Import - 2. Preview Members
  // ----------------------------------------------------------------------------
  async previewMembersImport(): Promise<ImportPreviewResult<MemberRecord>> {
    const dbId = this.config.notion.membersDatabaseId;
    const pages = await this.notionClient.queryAllPages(dbId);

    const items: ImportPreviewItem<MemberRecord>[] = [];
    let validCount = 0;
    let invalidCount = 0;

    for (const page of pages) {
      const parsed = this.memberMapper.fromNotionPage(page);
      const existing = await this.repository.getMemberByNotionPageId(page.id);

      if (parsed.isValid) {
        validCount++;
      } else {
        invalidCount++;
      }

      items.push({
        notionPageId: page.id,
        parsedData: parsed.member,
        isValid: parsed.isValid,
        validationIssues: parsed.errors,
        willUpdateExisting: !!existing,
        matchedLocalId: existing?.id,
      });
    }

    return {
      databaseId: dbId,
      totalFound: pages.length,
      validCount,
      invalidCount,
      items,
    };
  }

  // ----------------------------------------------------------------------------
  // Controlled Initial Import - 3. Preview Events
  // ----------------------------------------------------------------------------
  async previewEventsImport(): Promise<ImportPreviewResult<EventRecord>> {
    const dbId = this.config.notion.eventsDatabaseId;
    const pages = await this.notionClient.queryAllPages(dbId);

    const items: ImportPreviewItem<EventRecord>[] = [];
    let validCount = 0;
    let invalidCount = 0;

    for (const page of pages) {
      const parsed = this.eventMapper.fromNotionPage(page);
      const existing = await this.repository.getEventByNotionPageId(page.id);

      if (parsed.isValid) {
        validCount++;
      } else {
        invalidCount++;
      }

      items.push({
        notionPageId: page.id,
        parsedData: parsed.event,
        isValid: parsed.isValid,
        validationIssues: parsed.errors,
        willUpdateExisting: !!existing,
        matchedLocalId: existing?.id,
      });
    }

    return {
      databaseId: dbId,
      totalFound: pages.length,
      validCount,
      invalidCount,
      items,
    };
  }

  // ----------------------------------------------------------------------------
  // Pull from Notion -> Supabase (Members)
  // ----------------------------------------------------------------------------
  async pullMembers(operatorRole = 'system'): Promise<SyncExecutionResult> {
    this.verifyAuthorizedRole(operatorRole);

    const job = await this.auditLogger.startSyncJob('members', 'pull_from_notion', operatorRole);
    const dbId = this.config.notion.membersDatabaseId;

    let recordsRead = 0;
    let recordsWritten = 0;
    const conflicts: ConflictRecord[] = [];
    const errors: SyncItemError[] = [];

    try {
      const pages = await this.notionClient.queryAllPages(dbId);
      recordsRead = pages.length;

      for (const page of pages) {
        try {
          const parsed = this.memberMapper.fromNotionPage(page);
          if (!parsed.isValid) {
            errors.push({
              identifier: page.id,
              entityType: 'members',
              errorMessage: `Validation failed: ${parsed.errors.join(', ')}`,
            });
            continue;
          }

          const existing = await this.repository.getMemberByNotionPageId(page.id);

          if (existing) {
            // Check conflict
            const resolution = this.conflictResolver.resolve({
              entityType: 'members',
              id: existing.id,
              notionPageId: page.id,
              appRecord: existing,
              notionRecord: parsed.member as MemberRecord,
              notionLastEditedTime: page.last_edited_time,
            });

            if (resolution.hasConflict && resolution.conflictRecord) {
              conflicts.push(resolution.conflictRecord);
            }

            if (resolution.winningSource === 'notion' && resolution.dataToApply) {
              await this.repository.upsertMember({
                ...resolution.dataToApply,
                id: existing.id,
                notion_page_id: page.id,
              });
              recordsWritten++;
            }
          } else {
            // Fresh record from Notion
            await this.repository.upsertMember({
              ...parsed.member,
              notion_page_id: page.id,
            });
            recordsWritten++;
          }
        } catch (itemError: any) {
          errors.push({
            identifier: page.id,
            entityType: 'members',
            errorMessage: itemError.message || 'Error processing Notion member page',
          });
        }
      }
    } catch (globalError: any) {
      errors.push({
        identifier: dbId,
        entityType: 'members',
        errorMessage: `Failed querying Notion database: ${globalError.message}`,
      });
    }

    const result: SyncExecutionResult = {
      jobId: job.id,
      entityType: 'members',
      direction: 'pull_from_notion',
      status: errors.length > 0 ? (recordsWritten > 0 ? 'partially_completed' : 'failed') : 'completed',
      startedAt: job.started_at,
      completedAt: new Date().toISOString(),
      recordsRead,
      recordsWritten,
      conflicts,
      errors,
    };

    await this.auditLogger.finalizeSyncJob(job.id, result);
    return result;
  }

  // ----------------------------------------------------------------------------
  // Push from Supabase -> Notion (Members)
  // ----------------------------------------------------------------------------
  async pushMembers(operatorRole = 'system'): Promise<SyncExecutionResult> {
    this.verifyAuthorizedRole(operatorRole);

    const job = await this.auditLogger.startSyncJob('members', 'push_to_notion', operatorRole);
    const dbId = this.config.notion.membersDatabaseId;

    let recordsRead = 0;
    let recordsWritten = 0;
    const conflicts: ConflictRecord[] = [];
    const errors: SyncItemError[] = [];

    try {
      const members = await this.repository.getMembers();
      recordsRead = members.length;

      for (const member of members) {
        try {
          const properties = this.memberMapper.toNotionProperties(member);

          if (member.notion_page_id) {
            // Check if page still exists on Notion and compare timestamps
            let remotePage;
            try {
              remotePage = await this.notionClient.getPage(member.notion_page_id);
            } catch (err: any) {
              remotePage = null;
            }

            if (remotePage) {
              const parsedRemote = this.memberMapper.fromNotionPage(remotePage);
              const resolution = this.conflictResolver.resolve({
                entityType: 'members',
                id: member.id,
                notionPageId: member.notion_page_id,
                appRecord: member,
                notionRecord: parsedRemote.member as MemberRecord,
                notionLastEditedTime: remotePage.last_edited_time,
              });

              if (resolution.hasConflict && resolution.conflictRecord) {
                conflicts.push(resolution.conflictRecord);
              }

              if (resolution.winningSource === 'app' || !resolution.hasConflict) {
                await this.notionClient.updatePage(member.notion_page_id, properties, !member.active);
                recordsWritten++;
              }
            } else {
              // Page was deleted/archived on Notion, recreate
              const newPage = await this.notionClient.createPage(dbId, properties);
              await this.repository.upsertMember({ ...member, notion_page_id: newPage.id });
              recordsWritten++;
            }
          } else {
            // Create brand new page in Notion
            const newPage = await this.notionClient.createPage(dbId, properties);
            await this.repository.upsertMember({ ...member, notion_page_id: newPage.id });
            recordsWritten++;
          }
        } catch (itemError: any) {
          errors.push({
            identifier: member.id,
            entityType: 'members',
            errorMessage: itemError.message || 'Failed pushing member to Notion',
          });
        }
      }
    } catch (globalError: any) {
      errors.push({
        identifier: 'members_table',
        entityType: 'members',
        errorMessage: `Failed fetching members from Supabase: ${globalError.message}`,
      });
    }

    const result: SyncExecutionResult = {
      jobId: job.id,
      entityType: 'members',
      direction: 'push_to_notion',
      status: errors.length > 0 ? (recordsWritten > 0 ? 'partially_completed' : 'failed') : 'completed',
      startedAt: job.started_at,
      completedAt: new Date().toISOString(),
      recordsRead,
      recordsWritten,
      conflicts,
      errors,
    };

    await this.auditLogger.finalizeSyncJob(job.id, result);
    return result;
  }

  // ----------------------------------------------------------------------------
  // Pull from Notion -> Supabase (Events)
  // ----------------------------------------------------------------------------
  async pullEvents(operatorRole = 'system'): Promise<SyncExecutionResult> {
    this.verifyAuthorizedRole(operatorRole);

    const job = await this.auditLogger.startSyncJob('events', 'pull_from_notion', operatorRole);
    const dbId = this.config.notion.eventsDatabaseId;

    let recordsRead = 0;
    let recordsWritten = 0;
    const conflicts: ConflictRecord[] = [];
    const errors: SyncItemError[] = [];

    try {
      const pages = await this.notionClient.queryAllPages(dbId);
      recordsRead = pages.length;

      for (const page of pages) {
        try {
          const parsed = this.eventMapper.fromNotionPage(page);
          if (!parsed.isValid) {
            errors.push({
              identifier: page.id,
              entityType: 'events',
              errorMessage: `Validation failed: ${parsed.errors.join(', ')}`,
            });
            continue;
          }

          const existing = await this.repository.getEventByNotionPageId(page.id);

          if (existing) {
            const resolution = this.conflictResolver.resolve({
              entityType: 'events',
              id: existing.id,
              notionPageId: page.id,
              appRecord: existing,
              notionRecord: parsed.event as EventRecord,
              notionLastEditedTime: page.last_edited_time,
            });

            if (resolution.hasConflict && resolution.conflictRecord) {
              conflicts.push(resolution.conflictRecord);
            }

            if (resolution.winningSource === 'notion' && resolution.dataToApply) {
              await this.repository.upsertEvent({
                ...resolution.dataToApply,
                id: existing.id,
                notion_page_id: page.id,
              });
              recordsWritten++;
            }
          } else {
            await this.repository.upsertEvent({
              ...parsed.event,
              notion_page_id: page.id,
            });
            recordsWritten++;
          }
        } catch (itemError: any) {
          errors.push({
            identifier: page.id,
            entityType: 'events',
            errorMessage: itemError.message || 'Error processing Notion event page',
          });
        }
      }
    } catch (globalError: any) {
      errors.push({
        identifier: dbId,
        entityType: 'events',
        errorMessage: `Failed querying Notion events database: ${globalError.message}`,
      });
    }

    const result: SyncExecutionResult = {
      jobId: job.id,
      entityType: 'events',
      direction: 'pull_from_notion',
      status: errors.length > 0 ? (recordsWritten > 0 ? 'partially_completed' : 'failed') : 'completed',
      startedAt: job.started_at,
      completedAt: new Date().toISOString(),
      recordsRead,
      recordsWritten,
      conflicts,
      errors,
    };

    await this.auditLogger.finalizeSyncJob(job.id, result);
    return result;
  }

  // ----------------------------------------------------------------------------
  // Push from Supabase -> Notion (Events)
  // ----------------------------------------------------------------------------
  async pushEvents(operatorRole = 'system'): Promise<SyncExecutionResult> {
    this.verifyAuthorizedRole(operatorRole);

    const job = await this.auditLogger.startSyncJob('events', 'push_to_notion', operatorRole);
    const dbId = this.config.notion.eventsDatabaseId;

    let recordsRead = 0;
    let recordsWritten = 0;
    const conflicts: ConflictRecord[] = [];
    const errors: SyncItemError[] = [];

    try {
      const events = await this.repository.getEvents();
      recordsRead = events.length;

      for (const event of events) {
        try {
          const properties = this.eventMapper.toNotionProperties(event);

          if (event.notion_page_id) {
            let remotePage;
            try {
              remotePage = await this.notionClient.getPage(event.notion_page_id);
            } catch (err: any) {
              remotePage = null;
            }

            if (remotePage) {
              const parsedRemote = this.eventMapper.fromNotionPage(remotePage);
              const resolution = this.conflictResolver.resolve({
                entityType: 'events',
                id: event.id,
                notionPageId: event.notion_page_id,
                appRecord: event,
                notionRecord: parsedRemote.event as EventRecord,
                notionLastEditedTime: remotePage.last_edited_time,
              });

              if (resolution.hasConflict && resolution.conflictRecord) {
                conflicts.push(resolution.conflictRecord);
              }

              if (resolution.winningSource === 'app' || !resolution.hasConflict) {
                await this.notionClient.updatePage(event.notion_page_id, properties, event.status === 'cancelled');
                recordsWritten++;
              }
            } else {
              const newPage = await this.notionClient.createPage(dbId, properties);
              await this.repository.upsertEvent({ ...event, notion_page_id: newPage.id });
              recordsWritten++;
            }
          } else {
            const newPage = await this.notionClient.createPage(dbId, properties);
            await this.repository.upsertEvent({ ...event, notion_page_id: newPage.id });
            recordsWritten++;
          }
        } catch (itemError: any) {
          errors.push({
            identifier: event.id,
            entityType: 'events',
            errorMessage: itemError.message || 'Failed pushing event to Notion',
          });
        }
      }
    } catch (globalError: any) {
      errors.push({
        identifier: 'events_table',
        entityType: 'events',
        errorMessage: `Failed fetching events from Supabase: ${globalError.message}`,
      });
    }

    const result: SyncExecutionResult = {
      jobId: job.id,
      entityType: 'events',
      direction: 'push_to_notion',
      status: errors.length > 0 ? (recordsWritten > 0 ? 'partially_completed' : 'failed') : 'completed',
      startedAt: job.started_at,
      completedAt: new Date().toISOString(),
      recordsRead,
      recordsWritten,
      conflicts,
      errors,
    };

    await this.auditLogger.finalizeSyncJob(job.id, result);
    return result;
  }

  // ----------------------------------------------------------------------------
  // Comprehensive Bidirectional Sync (Members & Events)
  // ----------------------------------------------------------------------------
  async syncAll(operatorRole = 'system'): Promise<{
    members: { pull: SyncExecutionResult; push: SyncExecutionResult };
    events: { pull: SyncExecutionResult; push: SyncExecutionResult };
  }> {
    this.verifyAuthorizedRole(operatorRole);

    // 1. Pull updates from Notion
    const membersPull = await this.pullMembers(operatorRole);
    const eventsPull = await this.pullEvents(operatorRole);

    // 2. Push local updates to Notion
    const membersPush = await this.pushMembers(operatorRole);
    const eventsPush = await this.pushEvents(operatorRole);

    return {
      members: { pull: membersPull, push: membersPush },
      events: { pull: eventsPull, push: eventsPush },
    };
  }
}
