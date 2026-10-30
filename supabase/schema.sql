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
    member_type TEXT NOT NULL CHECK (member_type IN ('new_coordinator', 'old_coordinator', 'other', 'executive')),
    role TEXT,
    class_batch TEXT,
    domain TEXT,
    team_tier TEXT CHECK (team_tier IN ('core', 'sub_core')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

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
    mode TEXT DEFAULT 'Offline' CHECK (mode IN ('Online', 'Offline')),
    event_type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_event_member ON coordinator_assignments (event_id, member_id);

-- ------------------------------------------------------------------------------
-- 5. Certificate Batch Runs Table (Operational & Historical Verification Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificate_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_files INTEGER NOT NULL DEFAULT 0,
    passed_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    pass_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_cert_batches_created_at ON certificate_batches (created_at DESC);

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
