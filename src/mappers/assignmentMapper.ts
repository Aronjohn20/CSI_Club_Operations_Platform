// ==============================================================================
// CSI Club Operations Platform - Assignment Entity <-> Notion Properties Mapper
// ==============================================================================

import { AssignmentStatus, CoordinatorAssignmentRecord, NotionPageMeta } from '../types/index.js';

export interface AssignmentMappingSchema {
  titleProperty: string;
  eventRelationProperty: string;
  memberRelationProperty: string;
  statusProperty: string;
  appIdProperty: string;
}

export const DEFAULT_ASSIGNMENT_SCHEMA: AssignmentMappingSchema = {
  titleProperty: 'Assignment',
  eventRelationProperty: 'Event',
  memberRelationProperty: 'Member',
  statusProperty: 'Status',
  appIdProperty: 'App ID',
};

export class AssignmentMapper {
  private schema: AssignmentMappingSchema;

  constructor(schema: Partial<AssignmentMappingSchema> = {}) {
    this.schema = { ...DEFAULT_ASSIGNMENT_SCHEMA, ...schema };
  }

  /**
   * Converts a Supabase CoordinatorAssignmentRecord into Notion page properties.
   * Requires notionEventPageId and notionMemberPageId for Notion relations.
   */
  toNotionProperties(
    assignment: CoordinatorAssignmentRecord,
    options: {
      notionEventPageId?: string | null;
      notionMemberPageId?: string | null;
      displayLabel?: string;
    }
  ): Record<string, any> {
    const label = options.displayLabel || `Assignment: ${assignment.id.slice(0, 8)}`;
    const properties: Record<string, any> = {
      [this.schema.titleProperty]: {
        title: [
          {
            text: {
              content: label,
            },
          },
        ],
      },
      [this.schema.statusProperty]: {
        select: {
          name: this.formatStatusForNotion(assignment.status),
        },
      },
      [this.schema.appIdProperty]: {
        rich_text: [
          {
            text: {
              content: assignment.id,
            },
          },
        ],
      },
    };

    if (options.notionEventPageId) {
      properties[this.schema.eventRelationProperty] = {
        relation: [{ id: options.notionEventPageId }],
      };
    }

    if (options.notionMemberPageId) {
      properties[this.schema.memberRelationProperty] = {
        relation: [{ id: options.notionMemberPageId }],
      };
    }

    return properties;
  }

  /**
   * Parses a Notion Page into a partial CoordinatorAssignmentRecord.
   */
  fromNotionPage(page: NotionPageMeta): {
    assignment: Partial<CoordinatorAssignmentRecord> & {
      notionEventPageId?: string;
      notionMemberPageId?: string;
    };
    isValid: boolean;
    errors: string[];
  } {
    const props = page.properties || {};
    const errors: string[] = [];

    // 1. Status
    const statusProp = props[this.schema.statusProperty];
    const rawStatus = statusProp?.status?.name || statusProp?.select?.name || '';
    const status = this.normalizeStatus(rawStatus);

    // 2. Event relation
    const eventRelProp = props[this.schema.eventRelationProperty];
    const notionEventPageId = eventRelProp?.relation?.[0]?.id;
    if (!notionEventPageId) {
      errors.push(`Missing linked Event relation in Notion property '${this.schema.eventRelationProperty}'`);
    }

    // 3. Member relation
    const memberRelProp = props[this.schema.memberRelationProperty];
    const notionMemberPageId = memberRelProp?.relation?.[0]?.id;
    if (!notionMemberPageId) {
      errors.push(`Missing linked Member relation in Notion property '${this.schema.memberRelationProperty}'`);
    }

    // 4. Local App ID
    const appIdProp = props[this.schema.appIdProperty];
    const localId = appIdProp?.rich_text?.[0]?.plain_text?.trim() || undefined;

    return {
      assignment: {
        ...(localId ? { id: localId } : {}),
        status,
        notion_page_id: page.id,
        notionEventPageId,
        notionMemberPageId,
      },
      isValid: errors.length === 0,
      errors,
    };
  }

  private normalizeStatus(label: string): AssignmentStatus {
    const clean = label.toLowerCase();
    if (clean.includes('confirm')) return 'confirmed';
    if (clean.includes('decline')) return 'declined';
    if (clean.includes('complete')) return 'completed';
    if (clean.includes('replace')) return 'replaced';
    return 'assigned';
  }

  private formatStatusForNotion(status: AssignmentStatus): string {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'declined':
        return 'Declined';
      case 'completed':
        return 'Completed';
      case 'replaced':
        return 'Replaced';
      default:
        return 'Assigned';
    }
  }
}
