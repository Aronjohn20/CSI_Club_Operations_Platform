// ==============================================================================
// CSI Club Operations Platform - Notion Integration CLI
// ==============================================================================

import { getConfig, validateConfigReadiness } from './config.js';
import { ResilientNotionClient } from './notion/client.js';
import { NotionSyncService } from './services/notionSyncService.js';
import { InMemorySupabaseRepository, LiveSupabaseRepository } from './supabase/client.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  console.log('------------------------------------------------------------');
  console.log(' CSI Club Operations Platform - Notion Sync CLI');
  console.log('------------------------------------------------------------');

  const config = getConfig();
  const readiness = validateConfigReadiness(config);

  if (command === 'help') {
    printHelp();
    return;
  }

  if (!readiness.isNotionReady && command !== 'demo') {
    console.warn('\n[Notice] Notion API credentials are not yet configured in .env:');
    for (const key of readiness.missingKeys) {
      console.warn(`  - Missing: ${key}`);
    }
    console.warn('\nTo test without live credentials, run: npm run sync:demo');
    return;
  }

  // Setup repositories
  let repo;
  if (readiness.isSupabaseReady) {
    repo = new LiveSupabaseRepository({
      supabaseUrl: config.supabase.url,
      serviceRoleKey: config.supabase.serviceRoleKey,
    });
  } else {
    console.log('[Info] Using in-memory repository (Supabase credentials not yet provided in .env).');
    repo = new InMemorySupabaseRepository();
  }

  const notionClient = new ResilientNotionClient({
    apiKey: config.notion.apiKey,
    requestsPerSecond: config.notion.requestsPerSecond,
    maxRetries: config.notion.maxRetries,
  });

  const syncService = new NotionSyncService({
    config,
    notionClient,
    repository: repo,
  });

  switch (command) {
    case 'inspect': {
      console.log('Inspecting Notion database schemas...');
      try {
        const inspection = await syncService.inspectDatabases();
        console.log('\n[Members Database]:', inspection.members.title);
        console.table(Object.values(inspection.members.properties));
        console.log('\n[Events Database]:', inspection.events.title);
        console.table(Object.values(inspection.events.properties));
      } catch (err: any) {
        console.error('Inspection failed:', err.message);
      }
      break;
    }

    case 'preview': {
      console.log('Previewing Notion records for initial import...');
      try {
        const memberPreview = await syncService.previewMembersImport();
        console.log(`\nFound ${memberPreview.totalFound} members in Notion (${memberPreview.validCount} valid, ${memberPreview.invalidCount} invalid).`);
        console.dir(memberPreview.items.slice(0, 5), { depth: null });

        const eventPreview = await syncService.previewEventsImport();
        console.log(`\nFound ${eventPreview.totalFound} events in Notion (${eventPreview.validCount} valid, ${eventPreview.invalidCount} invalid).`);
        console.dir(eventPreview.items.slice(0, 5), { depth: null });
      } catch (err: any) {
        console.error('Preview failed:', err.message);
      }
      break;
    }

    case 'pull': {
      console.log('Pulling data from Notion into Supabase...');
      const memResult = await syncService.pullMembers('admin');
      console.log(`Members Pull: ${memResult.recordsRead} read, ${memResult.recordsWritten} written, ${memResult.conflicts.length} conflicts, ${memResult.errors.length} errors.`);
      const evtResult = await syncService.pullEvents('admin');
      console.log(`Events Pull: ${evtResult.recordsRead} read, ${evtResult.recordsWritten} written, ${evtResult.conflicts.length} conflicts, ${evtResult.errors.length} errors.`);
      break;
    }

    case 'push': {
      console.log('Pushing data from Supabase to Notion...');
      const memResult = await syncService.pushMembers('admin');
      console.log(`Members Push: ${memResult.recordsRead} read, ${memResult.recordsWritten} written, ${memResult.conflicts.length} conflicts, ${memResult.errors.length} errors.`);
      const evtResult = await syncService.pushEvents('admin');
      console.log(`Events Push: ${evtResult.recordsRead} read, ${evtResult.recordsWritten} written, ${evtResult.conflicts.length} conflicts, ${evtResult.errors.length} errors.`);
      break;
    }

    case 'sync': {
      console.log('Running bidirectional synchronization...');
      const res = await syncService.syncAll('admin');
      console.log('Sync completed successfully.');
      console.dir(res, { depth: 2 });
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
  }
}

function printHelp() {
  console.log(`
Available commands:
  inspect      Inspect Notion databases and print property schema
  preview      Dry-run preview of records from Notion before importing
  pull         Pull updates from Notion into Supabase
  push         Push updates from Supabase to Notion
  sync         Execute full bidirectional sync with conflict handling
  help         Display this help menu
`);
}

main().catch((err) => {
  console.error('CLI Fatal Error:', err);
  process.exit(1);
});
