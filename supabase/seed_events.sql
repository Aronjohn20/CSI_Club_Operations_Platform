-- ==============================================================================
-- CSI Club Operations Platform - Events Seed Data for Supabase
-- Run this script in the Supabase SQL Editor to populate the events & assignments
-- ==============================================================================

-- 1. Schema Update: Add new columns and remove Notion column
DO $$
BEGIN
    -- Drop notion_page_id if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'notion_page_id'
    ) THEN
        ALTER TABLE events DROP COLUMN notion_page_id;
    END IF;

    -- Add mode, event_type, and description if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'mode'
    ) THEN
        ALTER TABLE events ADD COLUMN mode TEXT DEFAULT 'Offline';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'event_type'
    ) THEN
        ALTER TABLE events ADD COLUMN event_type TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'description'
    ) THEN
        ALTER TABLE events ADD COLUMN description TEXT;
    END IF;
END $$;

-- 2. Clear old events data
DELETE FROM coordinator_assignments;
DELETE FROM events;

-- 3. Insert all 13 events from the club operations table
INSERT INTO events (id, name, event_date, status, required_coordinator_count, mode, event_type, description)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'Cache Quest + Magazine launch', '2026-07-10', 'completed', 3, 'Offline', 'Friday Event', '3 rounds tech challenge that simulates memory management and OS behaviour'),
    ('e0000000-0000-0000-0000-000000000002', 'Coder of the Month - July', '2026-07-16', 'completed', 2, 'Online', 'COTM', 'Monthly coding challenge'),
    ('e0000000-0000-0000-0000-000000000003', 'Tech-Jeopardy', '2026-08-14', 'completed', 2, 'Offline', 'Friday Event', 'Jeopardy style tech quiz - 5 categories, 5 point scales'),
    ('e0000000-0000-0000-0000-000000000004', 'Bug Se Azadi', '2026-08-16', 'completed', 2, 'Online', 'Independence Day Special', 'Independence day themed debugging challenge and Kahoot speedrun'),
    ('e0000000-0000-0000-0000-000000000005', 'Build & Ship AI product', '2026-09-01', 'completed', 3, 'Offline', 'Confluence', 'Workshop regarding vibecoding'),
    ('e0000000-0000-0000-0000-000000000006', 'Traceback', '2026-09-15', 'completed', 2, 'Offline', 'Techkshetra', 'Tech escape room + CTF + Mystery solving'),
    ('e0000000-0000-0000-0000-000000000007', 'Retro Rumble', '2026-09-16', 'completed', 2, 'Online', 'Homecoming', 'Technical and Interactive quiz competition'),
    ('e0000000-0000-0000-0000-000000000008', 'Real or Cake', '2026-09-17', 'completed', 3, 'Online', 'Homecoming', 'Competition on finding whether the displayed image, audio , art are fake or not'),
    ('e0000000-0000-0000-0000-000000000009', 'Say Cheese', '2026-09-18', 'completed', 4, 'Offline', 'Homecoming', 'Treasure Hunt Selfie Competition'),
    ('e0000000-0000-0000-0000-000000000010', 'Coder of the Month - September', '2026-09-19', 'completed', 2, 'Online', 'COTM', 'Monthly coding challenge'),
    ('e0000000-0000-0000-0000-000000000011', 'Keeping it Reel', '2026-09-21', 'completed', 2, 'Online', 'Homecoming', 'Reel Making Competition'),
    ('e0000000-0000-0000-0000-000000000012', 'History But Wrong', '2026-09-23', 'completed', 4, 'Online', 'Homecoming', 'Digital Fictional Story Making Competition'),
    ('e0000000-0000-0000-0000-000000000013', 'Off the Script', '2026-09-25', 'completed', 5, 'Offline', 'Homecoming', 'Mystery event consisting of multiple rounds - cinema, music, decoder, rebus');

-- 4. Link the assigned coordinators into coordinator_assignments
INSERT INTO coordinator_assignments (event_id, member_id, status)
SELECT e.id, m.id, 'completed'
FROM events e, members m
WHERE 
    -- 1. Cache Quest + Magazine launch: Aafiya, Fathima Naja, June Maria Sudhil
    (e.name = 'Cache Quest + Magazine launch' AND m.name IN ('Aafiya Shameer', 'Fathima Naja', 'June Maria Sudhil'))
    OR
    -- 2. Coder of the Month - July: Jovit, Vaishnavi
    (e.name = 'Coder of the Month - July' AND m.name IN ('Jovit Jerry', 'Vaishnavi Dev Thekke Veedu'))
    OR
    -- 4. Bug Se Azadi: Anjali, Elizabeth
    (e.name = 'Bug Se Azadi' AND m.name IN ('Anjali Shaju', 'Elizabeth Joby'))
    OR
    -- 5. Build & Ship AI product: Soorya, Aron, Aafiya
    (e.name = 'Build & Ship AI product' AND m.name IN ('Soorya Das K S', 'Aron Varghese John', 'Aafiya Shameer'))
    OR
    -- 6. Traceback: Soorya, Ben
    (e.name = 'Traceback' AND m.name IN ('Soorya Das K S', 'Ben George Simon'))
    OR
    -- 7. Retro Rumble: Ayyappadas, Fathima Naja
    (e.name = 'Retro Rumble' AND m.name IN ('Ayyappadas S', 'Fathima Naja'))
    OR
    -- 8. Real or Cake: Soorya, June, Kripa
    (e.name = 'Real or Cake' AND m.name IN ('Soorya Das K S', 'June Maria Sudhil', 'Kripa Ann John'))
    OR
    -- 9. Say Cheese: Alina, Elizabeth, Avanthika, Vishnu
    (e.name = 'Say Cheese' AND m.name IN ('Alina Mary John', 'Elizabeth Joby', 'Avanthika S', 'Vishnu M P'))
    OR
    -- 10. Coder of the Month - September: Aron, Aafiya
    (e.name = 'Coder of the Month - September' AND m.name IN ('Aron Varghese John', 'Aafiya Shameer'))
    OR
    -- 11. Keeping it Reel: Anjali, Kripa
    (e.name = 'Keeping it Reel' AND m.name IN ('Anjali Shaju', 'Kripa Ann John'))
    OR
    -- 12. History But Wrong: Abhishek, Vaishnavi, Riyan, Krishna Priya
    (e.name = 'History But Wrong' AND m.name IN ('Abhishek Joby', 'Vaishnavi Dev Thekke Veedu', 'Riyan Raz', 'Krishna Priya K R'))
    OR
    -- 13. Off the Script: Ayyappadas, Ben, Jovit, Sneha, Gayathri
    (e.name = 'Off the Script' AND m.name IN ('Ayyappadas S', 'Ben George Simon', 'Jovit Jerry', 'Sneha Phinoo', 'Gayathri Binoj'))
ON CONFLICT (event_id, member_id) DO NOTHING;
