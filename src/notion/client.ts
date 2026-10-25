// ==============================================================================
// CSI Club Operations Platform - Resilient Notion API Client
// ==============================================================================

import { Client } from '@notionhq/client';
import { DatabaseInspectionResult, DatabasePropertySchema, NotionPageMeta } from '../types/index.js';

export interface ResilientNotionClientOptions {
  apiKey: string;
  requestsPerSecond?: number;
  maxRetries?: number;
  initialRetryDelayMs?: number;
}

export class ResilientNotionClient {
  private client: Client;
  private readonly delayBetweenRequestsMs: number;
  private readonly maxRetries: number;
  private readonly initialRetryDelayMs: number;
  private lastRequestTime = 0;

  constructor(options: ResilientNotionClientOptions) {
    if (!options.apiKey) {
      // Allow instantiating with dummy for testing/mock purposes, but client calls will warn
      this.client = new Client({ auth: 'dummy_key' });
    } else {
      this.client = new Client({ auth: options.apiKey });
    }

    const rps = options.requestsPerSecond || 2.5;
    this.delayBetweenRequestsMs = Math.ceil(1000 / rps);
    this.maxRetries = options.maxRetries ?? 4;
    this.initialRetryDelayMs = options.initialRetryDelayMs ?? 1000;
  }

  /**
   * Internal rate-limiting throttle to guarantee we stay within Notion API limits.
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.delayBetweenRequestsMs) {
      const waitTime = this.delayBetweenRequestsMs - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Executes a Notion API call with automatic retries, exponential backoff, and rate limiting.
   */
  private async executeWithRetry<T>(operation: () => Promise<T>, contextName: string): Promise<T> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        await this.throttle();
        return await operation();
      } catch (error: any) {
        attempt++;

        const isRateLimited = error?.status === 429 || error?.code === 'rate_limited';
        const isTransientServerError = error?.status >= 500 && error?.status < 600;
        const isNetworkFailure = error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT';

        if ((isRateLimited || isTransientServerError || isNetworkFailure) && attempt <= this.maxRetries) {
          // Read retry-after header if provided by Notion, otherwise use exponential backoff + jitter
          const retryAfterSec = error?.headers?.get ? Number(error.headers.get('retry-after')) : undefined;
          const exponentialBackoff = this.initialRetryDelayMs * Math.pow(2, attempt - 1);
          const jitter = Math.floor(Math.random() * 200);
          const delayMs = (retryAfterSec ? retryAfterSec * 1000 : exponentialBackoff) + jitter;

          console.warn(
            `[NotionClient] Temporary failure in ${contextName} (Attempt ${attempt}/${this.maxRetries}). Retrying in ${delayMs}ms. Reason: ${error.message}`
          );

          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // Permanent failure or retry limit exceeded
        throw new Error(`[NotionClient Error: ${contextName}] ${error?.message || 'Unknown error occurred'} (Code: ${error?.code || error?.status})`);
      }
    }

    throw new Error(`[NotionClient Error: ${contextName}] Max retry attempts (${this.maxRetries}) exceeded.`);
  }

  /**
   * Inspects a Notion database, extracting property schema and validating accessibility.
   */
  async inspectDatabase(databaseId: string): Promise<DatabaseInspectionResult> {
    return this.executeWithRetry(async () => {
      const response: any = await this.client.databases.retrieve({ database_id: databaseId });

      const title = response.title?.[0]?.plain_text || 'Untitled Database';
      const properties: Record<string, DatabasePropertySchema> = {};
      const validationErrors: string[] = [];

      for (const [propName, propDef] of Object.entries<any>(response.properties || {})) {
        properties[propName] = {
          id: propDef.id,
          name: propDef.name,
          type: propDef.type,
          options: propDef.select?.options?.map((o: any) => o.name) || propDef.multi_select?.options?.map((o: any) => o.name),
        };
      }

      return {
        databaseId,
        title,
        properties,
        isAccessible: true,
        validationErrors,
      };
    }, `inspectDatabase(${databaseId})`);
  }

  /**
   * Queries all active pages from a Notion database with pagination handling.
   */
  async queryAllPages(databaseId: string, filter?: any): Promise<NotionPageMeta[]> {
    const results: NotionPageMeta[] = [];
    let hasMore = true;
    let nextCursor: string | undefined = undefined;

    while (hasMore) {
      const pageResult = await this.queryDatabasePage(databaseId, filter, nextCursor);
      results.push(...pageResult.pages);
      hasMore = pageResult.hasMore;
      nextCursor = pageResult.nextCursor;
    }

    return results;
  }

  /**
   * Queries a single page of results from Notion.
   */
  async queryDatabasePage(
    databaseId: string,
    filter?: any,
    startCursor?: string,
    pageSize = 100
  ): Promise<{ pages: NotionPageMeta[]; hasMore: boolean; nextCursor: string | undefined }> {
    return this.executeWithRetry(async () => {
      const queryParams: any = {
        database_id: databaseId,
        page_size: Math.min(pageSize, 100),
      };

      if (filter) queryParams.filter = filter;
      if (startCursor) queryParams.start_cursor = startCursor;

      const response: any = await this.client.databases.query(queryParams);

      const pages: NotionPageMeta[] = response.results.map((page: any) => ({
        id: page.id,
        created_time: page.created_time,
        last_edited_time: page.last_edited_time,
        archived: page.archived,
        url: page.url,
        properties: page.properties,
      }));

      return {
        pages,
        hasMore: response.has_more,
        nextCursor: response.next_cursor || undefined,
      };
    }, `queryDatabasePage(${databaseId})`);
  }

  /**
   * Retrieves a single Notion page by its Notion Page ID.
   */
  async getPage(pageId: string): Promise<NotionPageMeta> {
    return this.executeWithRetry(async () => {
      const page: any = await this.client.pages.retrieve({ page_id: pageId });
      return {
        id: page.id,
        created_time: page.created_time,
        last_edited_time: page.last_edited_time,
        archived: page.archived,
        url: page.url,
        properties: page.properties,
      };
    }, `getPage(${pageId})`);
  }

  /**
   * Creates a new page inside a Notion database.
   */
  async createPage(databaseId: string, properties: Record<string, any>): Promise<NotionPageMeta> {
    return this.executeWithRetry(async () => {
      const response: any = await this.client.pages.create({
        parent: { database_id: databaseId },
        properties,
      });

      return {
        id: response.id,
        created_time: response.created_time,
        last_edited_time: response.last_edited_time,
        archived: response.archived,
        url: response.url,
        properties: response.properties,
      };
    }, `createPage(${databaseId})`);
  }

  /**
   * Updates properties of an existing Notion page.
   */
  async updatePage(pageId: string, properties: Record<string, any>, archive?: boolean): Promise<NotionPageMeta> {
    return this.executeWithRetry(async () => {
      const payload: any = { page_id: pageId, properties };
      if (typeof archive === 'boolean') {
        payload.archived = archive;
      }

      const response: any = await this.client.pages.update(payload);

      return {
        id: response.id,
        created_time: response.created_time,
        last_edited_time: response.last_edited_time,
        archived: response.archived,
        url: response.url,
        properties: response.properties,
      };
    }, `updatePage(${pageId})`);
  }

  /**
   * Archives (soft-deletes) a Notion page.
   */
  async archivePage(pageId: string): Promise<void> {
    await this.updatePage(pageId, {}, true);
  }
}
