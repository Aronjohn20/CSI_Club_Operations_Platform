// ==============================================================================
// CSI Club Operations Platform - Conflict Resolution Engine
// ==============================================================================

import { ConflictRecord, ConflictStrategy, EntityType } from '../types/index.js';

export interface ConflictCheckContext<T> {
  entityType: EntityType;
  id: string;
  notionPageId: string;
  appRecord: T & { updated_at?: string };
  notionRecord: T;
  notionLastEditedTime: string;
}

export class ConflictResolver {
  private defaultStrategy: ConflictStrategy;

  constructor(defaultStrategy: ConflictStrategy = 'latest_wins') {
    this.defaultStrategy = defaultStrategy;
  }

  /**
   * Evaluates whether a conflict exists between local Supabase record and incoming Notion record.
   * If both were modified or differ, resolves based on the strategy.
   */
  resolve<T extends Record<string, any>>(
    context: ConflictCheckContext<T>,
    overrideStrategy?: ConflictStrategy
  ): {
    hasConflict: boolean;
    winningSource: 'notion' | 'app' | 'none';
    conflictRecord?: ConflictRecord<T>;
    dataToApply: T | null;
  } {
    const strategy = overrideStrategy || this.defaultStrategy;
    const { entityType, id, notionPageId, appRecord, notionRecord, notionLastEditedTime } = context;

    // Compare fields (excluding metadata timestamps)
    const differences = this.findDifferences(appRecord, notionRecord);

    if (differences.length === 0) {
      // Content is identical, no conflict
      return {
        hasConflict: false,
        winningSource: 'none',
        dataToApply: null,
      };
    }

    // A difference exists. Apply strategy:
    let resolvedWith: 'notion' | 'app' | 'manual_skip';
    let winningSource: 'notion' | 'app' | 'none';
    let reason = '';
    let dataToApply: T | null = null;

    switch (strategy) {
      case 'notion_wins':
        resolvedWith = 'notion';
        winningSource = 'notion';
        dataToApply = notionRecord;
        reason = `Notion wins policy applied. Overwriting local changes on fields: [${differences.join(', ')}]`;
        break;

      case 'app_wins':
        resolvedWith = 'app';
        winningSource = 'app';
        dataToApply = appRecord;
        reason = `Application wins policy applied. Overwriting Notion changes on fields: [${differences.join(', ')}]`;
        break;

      case 'manual':
        resolvedWith = 'manual_skip';
        winningSource = 'none';
        dataToApply = null;
        reason = `Manual policy: conflict detected on fields [${differences.join(', ')}]. Mutating neither side until operator reviews.`;
        break;

      case 'latest_wins':
      default: {
        const appUpdatedAt = appRecord.updated_at ? new Date(appRecord.updated_at).getTime() : 0;
        const notionUpdatedAt = new Date(notionLastEditedTime).getTime();

        if (notionUpdatedAt > appUpdatedAt) {
          resolvedWith = 'notion';
          winningSource = 'notion';
          dataToApply = notionRecord;
          reason = `Latest wins: Notion edit (${notionLastEditedTime}) is newer than App update (${appRecord.updated_at}).`;
        } else {
          resolvedWith = 'app';
          winningSource = 'app';
          dataToApply = appRecord;
          reason = `Latest wins: App update (${appRecord.updated_at}) is newer than Notion edit (${notionLastEditedTime}).`;
        }
        break;
      }
    }

    const conflictRecord: ConflictRecord<T> = {
      entityType,
      id,
      notionPageId,
      appRecord,
      notionRecord,
      resolvedWith,
      resolutionReason: reason,
    };

    return {
      hasConflict: true,
      winningSource,
      conflictRecord,
      dataToApply,
    };
  }

  /**
   * Compares fields while ignoring system internal timestamps.
   */
  private findDifferences<T extends Record<string, any>>(appRecord: T, notionRecord: T): string[] {
    const ignoredKeys = new Set(['created_at', 'updated_at', 'id', 'notion_page_id']);
    const diffKeys: string[] = [];

    const allKeys = new Set([...Object.keys(appRecord), ...Object.keys(notionRecord)]);

    for (const key of allKeys) {
      if (ignoredKeys.has(key)) continue;

      const appVal = appRecord[key];
      const notionVal = notionRecord[key];

      // Loose comparison for dates and nullables
      if (appVal !== notionVal && !(appVal == null && notionVal == null)) {
        diffKeys.push(key);
      }
    }

    return diffKeys;
  }
}
