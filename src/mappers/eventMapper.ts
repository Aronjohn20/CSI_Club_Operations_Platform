// ==============================================================================
// CSI Club Operations Platform - Event Entity <-> Notion Properties Mapper
// ==============================================================================

import { EventRecord, EventStatus, NotionPageMeta } from '../types/index.js';

export interface EventMappingSchema {
  nameProperty: string;
  dateProperty: string;
  statusProperty: string;
  coordinatorsNeededProperty: string;
  appIdProperty: string;
}

export const DEFAULT_EVENT_SCHEMA: EventMappingSchema = {
  nameProperty: 'Event Name',
  dateProperty: 'Event Date',
  statusProperty: 'Status',
  coordinatorsNeededProperty: 'Coordinators Needed',
  appIdProperty: 'App ID',
};

export class EventMapper {
  private schema: EventMappingSchema;

  constructor(schema: Partial<EventMappingSchema> = {}) {
    this.schema = { ...DEFAULT_EVENT_SCHEMA, ...schema };
  }

  /**
   * Converts a Supabase EventRecord into Notion page properties.
   */
  toNotionProperties(event: EventRecord): Record<string, any> {
    const properties: Record<string, any> = {
      [this.schema.nameProperty]: {
        title: [
          {
            text: {
              content: event.name || 'Untitled Event',
            },
          },
        ],
      },
      [this.schema.dateProperty]: {
        date: {
          start: event.event_date,
        },
      },
      [this.schema.statusProperty]: {
        select: {
          name: this.formatStatusForNotion(event.status),
        },
      },
      [this.schema.coordinatorsNeededProperty]: {
        number: event.required_coordinator_count,
      },
      [this.schema.appIdProperty]: {
        rich_text: [
          {
            text: {
              content: event.id,
            },
          },
        ],
      },
    };

    return properties;
  }

  /**
   * Parses a Notion Page into a partial EventRecord for Supabase.
   */
  fromNotionPage(page: NotionPageMeta): {
    event: Partial<EventRecord>;
    isValid: boolean;
    errors: string[];
  } {
    const props = page.properties || {};
    const errors: string[] = [];

    // 1. Extract Event Name (Title)
    const nameProp = props[this.schema.nameProperty];
    const name = nameProp?.title?.[0]?.plain_text?.trim() || '';
    if (!name) {
      errors.push(`Missing or empty required title property '${this.schema.nameProperty}'`);
    }

    // 2. Extract Event Date (Date)
    const dateProp = props[this.schema.dateProperty];
    let eventDate = dateProp?.date?.start || '';
    if (!eventDate) {
      eventDate = new Date().toISOString().split('T')[0];
      errors.push(`Missing date property '${this.schema.dateProperty}', defaulted to today: ${eventDate}`);
    } else {
      // In case full timestamp is passed, normalize to 'YYYY-MM-DD'
      eventDate = eventDate.split('T')[0];
    }

    // 3. Extract Status (Select or Status)
    const statusProp = props[this.schema.statusProperty];
    const rawStatus = statusProp?.status?.name || statusProp?.select?.name || '';
    const status = this.normalizeStatus(rawStatus);

    // 4. Extract Required Coordinators (Number)
    const countProp = props[this.schema.coordinatorsNeededProperty];
    const requiredCoordinators = typeof countProp?.number === 'number' ? countProp.number : 2;

    // 5. Extract Local App ID if previously synced
    const appIdProp = props[this.schema.appIdProperty];
    const localId = appIdProp?.rich_text?.[0]?.plain_text?.trim() || undefined;

    const event: Partial<EventRecord> = {
      ...(localId ? { id: localId } : {}),
      name,
      event_date: eventDate,
      status,
      required_coordinator_count: requiredCoordinators,
      notion_page_id: page.id,
    };

    return {
      event,
      isValid: errors.length === 0,
      errors,
    };
  }

  private normalizeStatus(label: string): EventStatus {
    const clean = label.toLowerCase().replace(/[\s-_]+/g, '');
    if (clean.includes('completed') || clean.includes('done')) return 'completed';
    if (clean.includes('confirm')) return 'confirmed';
    if (clean.includes('plan')) return 'planned';
    if (clean.includes('cancel')) return 'cancelled';
    return 'draft';
  }

  private formatStatusForNotion(status: EventStatus): string {
    switch (status) {
      case 'planned':
        return 'Planned';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Draft';
    }
  }
}
