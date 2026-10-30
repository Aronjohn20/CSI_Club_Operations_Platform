-- ==============================================================================
-- CSI Club Operations Platform - Members Seed Data for Supabase
-- Run this script in the Supabase SQL Editor to populate the members table.
-- ==============================================================================

-- 1. Ensure columns match without requiring join_year, email, or assignment_count
DO $$
BEGIN
    -- Make join_year optional if it exists from earlier schema
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'join_year'
    ) THEN
        ALTER TABLE members ALTER COLUMN join_year DROP NOT NULL;
    END IF;

    -- Make email optional if it exists from earlier schema
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'email'
    ) THEN
        ALTER TABLE members ALTER COLUMN email DROP NOT NULL;
    END IF;

    -- Drop assignment_count column if it exists (assignments are tracked in coordinator_assignments)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'assignment_count'
    ) THEN
        ALTER TABLE members DROP COLUMN assignment_count;
    END IF;
END $$;

-- 2. Clear previous records if any, then insert all 23 members
DELETE FROM members;

INSERT INTO members (name, member_type, role, class_batch, domain, team_tier, active)
VALUES
    -- Core Team
    ('Gayathri Binoj', 'old_coordinator', 'President', 'S7 CS B', 'Executive', 'core', true),
    ('Abhishek Joby', 'old_coordinator', 'Vice President', 'S7 CS A', 'Executive', 'core', true),
    ('Ayyappadas S', 'old_coordinator', 'Secretary', 'S7 CS A', 'Executive', 'core', true),
    ('Fathima Naja', 'old_coordinator', 'Joint Secretary', 'S7 CSBS', 'Executive', 'core', true),
    ('Suraj S Panickar', 'old_coordinator', 'Treasurer', 'S7 CS C', 'Executive', 'core', true),
    ('Vishnu M P', 'old_coordinator', 'Executive Coordinator', 'S7 CSBS', 'Executive', 'core', true),
    ('Aron Varghese John', 'old_coordinator', 'Operations Lead', 'S7 CS A', 'Operations', 'core', true),
    ('Sneha Phinoo', 'old_coordinator', 'Operations Co-Lead', 'S5 CS D', 'Operations', 'core', true),
    ('Sreya Raj', 'old_coordinator', 'Creative Lead', 'S7 IT', 'Creative', 'core', true),
    ('Kripa Ann John', 'old_coordinator', 'Creative Co-Lead', 'S5 CS C', 'Creative', 'core', true),
    ('Aafiya Shameer', 'old_coordinator', 'Documentation Lead', 'S7 CS A', 'Documentation', 'core', true),
    ('June Maria Sudhil', 'new_coordinator', 'Documentation Co-Lead', 'S5 AD', 'Documentation', 'core', true),
    ('Alina Mary John', 'old_coordinator', 'Marketing Lead', 'S7 IT', 'Marketing', 'core', true),
    ('Ben George Simon', 'new_coordinator', 'Marketing Co-Lead', 'S3 IT', 'Marketing', 'core', true),
    ('Soorya Das K S', 'old_coordinator', 'Technical Lead', 'S5 IT', 'Technical', 'core', true),
    ('Riyan Raz', 'new_coordinator', 'Technical Co-Lead', 'S5 CS D', 'Technical', 'core', true),

    -- Sub-Core Team
    ('Anjali Shaju', 'new_coordinator', 'Sub-Core (Documentation)', 'S3 CS A', 'Documentation', 'sub_core', true),
    ('Vaishnavi Dev Thekke Veedu', 'new_coordinator', 'Sub-Core (Creative)', 'S3 CS D', 'Creative', 'sub_core', true),
    ('Jovit Jerry', 'new_coordinator', 'Sub-Core (Creative)', 'S5 CSBS', 'Creative', 'sub_core', true),
    ('Lanet Varghese', 'old_coordinator', 'Sub-Core (Operations)', 'S5 CSBS', 'Operations', 'sub_core', true),
    ('Elizabeth Joby', 'new_coordinator', 'Sub-Core (Operations)', 'S3 AD', 'Operations', 'sub_core', true),
    ('Avanthika S', 'new_coordinator', 'Sub-Core (Marketing)', 'S3 AD', 'Marketing', 'sub_core', true),
    ('Krishna Priya K R', 'new_coordinator', 'Sub-Core (Creative)', 'S3 AD', 'Creative', 'sub_core', true);
