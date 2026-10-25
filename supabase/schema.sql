-- ==============================================================================
-- CSI Club Operations Platform - Database Schema for Supabase / PostgreSQL
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Members Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    join_year INTEGER NOT NULL,
    member_type TEXT NOT NULL CHECK (member_type IN ('new_coordinator', 'old_coordinator', 'other', 'executive')),
    role TEXT,
    class_batch TEXT,
    domain TEXT,
    team_tier TEXT CHECK (team_tier IN ('core', 'sub_core')),
    active BOOLEAN NOT NULL DEFAULT true,
    notion_page_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_members_notion_page_id ON members (notion_page_id);
CREATE INDEX IF NOT EXISTS idx_members_active ON members (active);
CREATE INDEX IF NOT EXISTS idx_members_member_type ON members (member_type);

-- ------------------------------------------------------------------------------
-- 2. Events Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    event_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('draft', 'planned', 'confirmed', 'completed', 'cancelled')),
    required_coordinator_count INTEGER NOT NULL DEFAULT 2,
    notion_page_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_events_notion_page_id ON events (notion_page_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events (event_date);

-- ------------------------------------------------------------------------------
-- 3. Allocation Runs Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS allocation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    rule_version TEXT NOT NULL DEFAULT '1.0',
    input_snapshot JSONB,
    result JSONB NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_allocation_runs_event_id ON allocation_runs (event_id);

-- ------------------------------------------------------------------------------
-- 4. Coordinator Assignments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coordinator_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    allocation_run_id UUID REFERENCES allocation_runs(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'declined', 'completed', 'replaced')),
    notion_page_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_event_member ON coordinator_assignments (event_id, member_id);
CREATE INDEX IF NOT EXISTS idx_assignments_notion_page_id ON coordinator_assignments (notion_page_id);

-- ------------------------------------------------------------------------------
-- 5. Notion Sync Jobs Table (Operational & Historical Sync Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notion_sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('members', 'events', 'coordinator_assignments', 'all')),
    direction TEXT NOT NULL CHECK (direction IN ('pull_from_notion', 'push_to_notion', 'bidirectional')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'partially_completed', 'failed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    completed_at TIMESTAMPTZ,
    records_read INTEGER NOT NULL DEFAULT 0,
    records_written INTEGER NOT NULL DEFAULT 0,
    conflicts_detected INTEGER NOT NULL DEFAULT 0,
    conflicts_resolved INTEGER NOT NULL DEFAULT 0,
    error_summary TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_by TEXT DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_notion_sync_jobs_status ON notion_sync_jobs (status);
CREATE INDEX IF NOT EXISTS idx_notion_sync_jobs_started_at ON notion_sync_jobs (started_at DESC);

-- ------------------------------------------------------------------------------
-- 6. Audit Logs Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- ------------------------------------------------------------------------------
-- Triggers for automatic `updated_at` timestamps
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_members_updated_at ON members;
CREATE TRIGGER trg_members_updated_at
BEFORE UPDATE ON members
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_coordinator_assignments_updated_at ON coordinator_assignments;
CREATE TRIGGER trg_coordinator_assignments_updated_at
BEFORE UPDATE ON coordinator_assignments
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
