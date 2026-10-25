// ==============================================================================
// CSI Club Operations Platform - Member Entity <-> Notion Properties Mapper
// ==============================================================================

import { MemberRecord, MemberType, NotionPageMeta } from '../types/index.js';

export interface MemberMappingSchema {
  nameProperty: string;
  emailProperty: string;
  joinYearProperty: string;
  memberTypeProperty: string;
  activeProperty: string;
  appIdProperty: string;
}

export const DEFAULT_MEMBER_SCHEMA: MemberMappingSchema = {
  nameProperty: 'Name',
  emailProperty: 'Email',
  joinYearProperty: 'Join Year',
  memberTypeProperty: 'Member Type',
  activeProperty: 'Active',
  appIdProperty: 'App ID',
};

export class MemberMapper {
  private schema: MemberMappingSchema;

  constructor(schema: Partial<MemberMappingSchema> = {}) {
    this.schema = { ...DEFAULT_MEMBER_SCHEMA, ...schema };
  }

  /**
   * Converts a Supabase MemberRecord into Notion page properties.
   */
  toNotionProperties(member: MemberRecord): Record<string, any> {
    const properties: Record<string, any> = {
      [this.schema.nameProperty]: {
        title: [
          {
            text: {
              content: member.name || 'Unnamed Member',
            },
          },
        ],
      },
      [this.schema.emailProperty]: {
        email: member.email || null,
      },
      [this.schema.joinYearProperty]: {
        number: member.join_year,
      },
      [this.schema.memberTypeProperty]: {
        select: {
          name: this.formatMemberTypeForNotion(member.member_type),
        },
      },
      [this.schema.activeProperty]: {
        checkbox: member.active,
      },
      [this.schema.appIdProperty]: {
        rich_text: [
          {
            text: {
              content: member.id,
            },
          },
        ],
      },
    };

    return properties;
  }

  /**
   * Parses a Notion Page into a partial MemberRecord for Supabase.
   */
  fromNotionPage(page: NotionPageMeta): {
    member: Partial<MemberRecord>;
    isValid: boolean;
    errors: string[];
  } {
    const props = page.properties || {};
    const errors: string[] = [];

    // 1. Extract Name (Title)
    const nameProp = props[this.schema.nameProperty];
    const name = nameProp?.title?.[0]?.plain_text?.trim() || '';
    if (!name) {
      errors.push(`Missing or empty required title property '${this.schema.nameProperty}'`);
    }

    // 2. Extract Email (Email or Text)
    const emailProp = props[this.schema.emailProperty];
    let email: string | null = null;
    if (emailProp?.email) {
      email = emailProp.email.trim();
    } else if (emailProp?.rich_text?.[0]?.plain_text) {
      email = emailProp.rich_text[0].plain_text.trim();
    }

    // 3. Extract Join Year (Number)
    const yearProp = props[this.schema.joinYearProperty];
    let joinYear = typeof yearProp?.number === 'number' ? yearProp.number : new Date().getFullYear();
    if (typeof yearProp?.number !== 'number') {
      errors.push(`Missing or invalid number property '${this.schema.joinYearProperty}', defaulted to ${joinYear}`);
    }

    // 4. Extract Member Type (Select or inferred from Join Year per BUSINESS_RULES.md Section 1.4)
    const typeProp = props[this.schema.memberTypeProperty];
    const rawType = typeProp?.select?.name || '';
    const memberType = this.normalizeMemberType(rawType, joinYear);

    // 5. Extract Active (Checkbox)
    const activeProp = props[this.schema.activeProperty];
    const active = typeof activeProp?.checkbox === 'boolean' ? activeProp.checkbox : true;

    // 6. Extract Local App ID if previously synced
    const appIdProp = props[this.schema.appIdProperty];
    const localId = appIdProp?.rich_text?.[0]?.plain_text?.trim() || undefined;

    const member: Partial<MemberRecord> = {
      ...(localId ? { id: localId } : {}),
      name,
      email,
      join_year: joinYear,
      member_type: memberType,
      active,
      notion_page_id: page.id,
    };

    return {
      member,
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Normalizes raw Notion select labels or join year into strict MemberType enum.
   * Adheres strictly to BUSINESS_RULES.md Section 1.4:
   * 2026 -> 'new_coordinator', 2024/2025 -> 'old_coordinator', other -> 'other'.
   */
  private normalizeMemberType(label: string, joinYear?: number): MemberType {
    const clean = (label || '').toLowerCase().replace(/[\s-_]+/g, '');
    if (clean.includes('new')) return 'new_coordinator';
    if (clean.includes('old') || clean.includes('senior')) return 'old_coordinator';
    if (clean.includes('exec') || clean.includes('lead')) return 'executive';

    // Fallback to Join Year rule if label is ambiguous or empty
    if (joinYear === 2026) return 'new_coordinator';
    if (joinYear === 2024 || joinYear === 2025) return 'old_coordinator';
    return 'other';
  }

  /**
   * Formats internal MemberType to friendly Notion select label.
   */
  private formatMemberTypeForNotion(type: MemberType): string {
    switch (type) {
      case 'new_coordinator':
        return 'New Coordinator';
      case 'old_coordinator':
        return 'Old Coordinator';
      case 'executive':
        return 'Executive Member';
      default:
        return 'Other Member';
    }
  }
}
