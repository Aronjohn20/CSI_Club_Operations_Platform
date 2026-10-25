// ==============================================================================
// CSI Club Operations Platform - Audit & Sync Job Logger
// ==============================================================================

import { ISupabaseRepository } from '../supabase/client.js';
import { EntityType, NotionSyncJobRecord, SyncDirection, SyncExecutionResult, SyncJobStatus } from '../types/index.js';

export class AuditLogger {
  private repository: ISupabaseRepository;

  constructor(repository: ISupabaseRepository) {
    this.repository = repository;
  }

  /**
   * Initializes a new Notion sync job tracking record.
   */
  async startSyncJob(entityType: EntityType, direction: SyncDirection, triggeredBy = 'system'): Promise<NotionSyncJobRecord> {
    const job = await this.repository.createSyncJob({
      entity_type: entityType,
      direction,
      status: 'running',
      started_at: new Date().toISOString(),
      records_read: 0,
      records_written: 0,
      conflicts_detected: 0,
      conflicts_resolved: 0,
      created_by: triggeredBy,
    });

    await this.repository.createAuditLog({
      action: 'notion.sync.started',
      entity_type: entityType,
      entity_id: job.id,
      metadata: { direction, triggeredBy },
    });

    return job;
  }

  /**
   * Finalizes and updates the sync job tracking record with execution results.
   */
  async finalizeSyncJob(jobId: string, result: Omit<SyncExecutionResult, 'jobId'>): Promise<void> {
    const completedAt = new Date().toISOString();
    const finalStatus: SyncJobStatus =
      result.errors.length > 0
        ? result.recordsWritten > 0
          ? 'partially_completed'
          : 'failed'
        : 'completed';

    const errorSummary =
      result.errors.length > 0
        ? `${result.errors.length} error(s) occurred. Sample: ${result.errors[0]?.errorMessage}`
        : null;

    await this.repository.updateSyncJob(jobId, {
      status: finalStatus,
      completed_at: completedAt,
      records_read: result.recordsRead,
      records_written: result.recordsWritten,
      conflicts_detected: result.conflicts.length,
      conflicts_resolved: result.conflicts.filter((c) => c.resolvedWith !== 'manual_skip').length,
      error_summary: errorSummary,
      details: {
        conflicts: result.conflicts,
        errors: result.errors,
      },
    });

    await this.repository.createAuditLog({
      action: `notion.sync.${finalStatus}`,
      entity_type: result.entityType,
      entity_id: jobId,
      metadata: {
        recordsRead: result.recordsRead,
        recordsWritten: result.recordsWritten,
        conflictsCount: result.conflicts.length,
        errorsCount: result.errors.length,
      },
    });
  }

  /**
   * Logs unauthorized sync trigger attempts or configuration changes.
   */
  async logSecurityEvent(action: string, actorId: string, actorRole: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.repository.createAuditLog({
      actor_id: actorId,
      actor_role: actorRole,
      action: `security.${action}`,
      entity_type: 'notion_integration',
      metadata,
    });
  }
}
