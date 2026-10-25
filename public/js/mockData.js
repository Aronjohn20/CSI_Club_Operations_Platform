// ==============================================================================
// CSI Club Operations Platform - Mock Operational Data Store
// ==============================================================================

window.CSIData = {
  activeCycle: {
    id: "cycle-2026-spring",
    name: "Spring 2026 Academic Term",
    totalEvents: 8,
    completedEvents: 4,
    activeCoordinators: 24,
  },

  members: [
    // Core Team
    { id: "mem-01", name: "Gayathri Binoj", role: "President", class_batch: "S7 CS B", domain: "Executive", team_tier: "core", email: "gayathri.b@csi.org", join_year: 2023, member_type: "executive", active: true, assignment_count: 3, notion_page_id: "page-gayathri" },
    { id: "mem-02", name: "Abhishek Joby", role: "Vice President", class_batch: "S7 CS A", domain: "Executive", team_tier: "core", email: "abhishek.j@csi.org", join_year: 2023, member_type: "executive", active: true, assignment_count: 2, notion_page_id: "page-abhishek" },
    { id: "mem-03", name: "Ayyappadas S", role: "Secretary", class_batch: "S7 CS A", domain: "Executive", team_tier: "core", email: "ayyappadas.s@csi.org", join_year: 2023, member_type: "executive", active: true, assignment_count: 2, notion_page_id: "page-ayyappadas" },
    { id: "mem-04", name: "Fathima Naja", role: "Joint Secretary", class_batch: "S7 CSBS", domain: "Executive", team_tier: "core", email: "fathima.n@csi.org", join_year: 2023, member_type: "executive", active: true, assignment_count: 1, notion_page_id: "page-fathima" },
    { id: "mem-05", name: "Suraj S Panickar", role: "Treasurer", class_batch: "S7 CS C", domain: "Executive", team_tier: "core", email: "suraj.p@csi.org", join_year: 2023, member_type: "executive", active: true, assignment_count: 2, notion_page_id: "page-suraj" },
    { id: "mem-06", name: "Vishnu M P", role: "Executive Coordinator", class_batch: "S7 CSBS", domain: "Executive", team_tier: "core", email: "vishnu.mp@csi.org", join_year: 2023, member_type: "executive", active: true, assignment_count: 2, notion_page_id: "page-vishnu" },
    { id: "mem-07", name: "Aron Varghese John", role: "Operations Lead", class_batch: "S7 CS A", domain: "Operations", team_tier: "core", email: "aron.v@csi.org", join_year: 2024, member_type: "old_coordinator", active: true, assignment_count: 3, notion_page_id: "page-aron" },
    { id: "mem-08", name: "Sneha Phinoo", role: "Operations Co-Lead", class_batch: "S5 CS D", domain: "Operations", team_tier: "core", email: "sneha.p@csi.org", join_year: 2025, member_type: "old_coordinator", active: true, assignment_count: 1, notion_page_id: "page-sneha" },
    { id: "mem-09", name: "Sreya Raj", role: "Creative Lead", class_batch: "S7 IT", domain: "Creative", team_tier: "core", email: "sreya.r@csi.org", join_year: 2024, member_type: "old_coordinator", active: true, assignment_count: 2, notion_page_id: "page-sreya" },
    { id: "mem-10", name: "Kripa Ann John", role: "Creative Co-Lead", class_batch: "S5 CS C", domain: "Creative", team_tier: "core", email: "kripa.j@csi.org", join_year: 2025, member_type: "old_coordinator", active: true, assignment_count: 1, notion_page_id: "page-kripa" },
    { id: "mem-11", name: "Aafiya Shameer", role: "Documentation Lead", class_batch: "S7 CS A", domain: "Documentation", team_tier: "core", email: "aafiya.s@csi.org", join_year: 2024, member_type: "old_coordinator", active: true, assignment_count: 2, notion_page_id: "page-aafiya" },
    { id: "mem-12", name: "June Maria Sudhil", role: "Documentation Co-Lead", class_batch: "S5 AD", domain: "Documentation", team_tier: "core", email: "june.s@csi.org", join_year: 2025, member_type: "old_coordinator", active: true, assignment_count: 1, notion_page_id: "page-june" },
    { id: "mem-13", name: "Alina Mary John", role: "Marketing Lead", class_batch: "S7 IT", domain: "Marketing", team_tier: "core", email: "alina.j@csi.org", join_year: 2024, member_type: "old_coordinator", active: true, assignment_count: 2, notion_page_id: "page-alina" },
    { id: "mem-14", name: "Ben George Simon", role: "Marketing Co-Lead", class_batch: "S3 IT", domain: "Marketing", team_tier: "core", email: "ben.s@csi.org", join_year: 2026, member_type: "new_coordinator", active: true, assignment_count: 0, notion_page_id: "page-ben" },
    { id: "mem-15", name: "Soorya Das K S", role: "Technical Lead", class_batch: "S5 IT", domain: "Technical", team_tier: "core", email: "soorya.d@csi.org", join_year: 2025, member_type: "old_coordinator", active: true, assignment_count: 2, notion_page_id: "page-soorya" },
    { id: "mem-16", name: "Riyan Raz", role: "Technical Co-Lead", class_batch: "S5 CS D", domain: "Technical", team_tier: "core", email: "riyan.r@csi.org", join_year: 2025, member_type: "old_coordinator", active: true, assignment_count: 1, notion_page_id: "page-riyan" },

    // Sub-Core Team
    { id: "mem-17", name: "Anjali Shaju", role: "Sub-Core (Documentation)", class_batch: "S3 CS A", domain: "Documentation", team_tier: "sub_core", email: "anjali.s@csi.org", join_year: 2026, member_type: "new_coordinator", active: true, assignment_count: 0, notion_page_id: "page-anjali" },
    { id: "mem-18", name: "Vaishnavi Dev Thekke Veedu", role: "Sub-Core (Creative)", class_batch: "S3 CS D", domain: "Creative", team_tier: "sub_core", email: "vaishnavi.d@csi.org", join_year: 2026, member_type: "new_coordinator", active: true, assignment_count: 0, notion_page_id: "page-vaishnavi" },
    { id: "mem-19", name: "Jovit Jerry", role: "Sub-Core (Creative)", class_batch: "S5 CSBS", domain: "Creative", team_tier: "sub_core", email: "jovit.j@csi.org", join_year: 2025, member_type: "old_coordinator", active: true, assignment_count: 1, notion_page_id: "page-jovit" },
    { id: "mem-20", name: "Lanet Varghese", role: "Sub-Core (Operations)", class_batch: "S5 CSBS", domain: "Operations", team_tier: "sub_core", email: "lanet.v@csi.org", join_year: 2025, member_type: "old_coordinator", active: true, assignment_count: 1, notion_page_id: "page-lanet" },
    { id: "mem-21", name: "Elizabeth Joby", role: "Sub-Core (Operations)", class_batch: "S3 AD", domain: "Operations", team_tier: "sub_core", email: "elizabeth.j@csi.org", join_year: 2026, member_type: "new_coordinator", active: true, assignment_count: 0, notion_page_id: "page-elizabeth" },
    { id: "mem-22", name: "Avanthika S", role: "Sub-Core (Marketing)", class_batch: "S3 AD", domain: "Marketing", team_tier: "sub_core", email: "avanthika.s@csi.org", join_year: 2026, member_type: "new_coordinator", active: true, assignment_count: 0, notion_page_id: "page-avanthika" },
    { id: "mem-23", name: "Krishna Priya K R", role: "Sub-Core (Creative)", class_batch: "S3 AD", domain: "Creative", team_tier: "sub_core", email: "krishnapriya.k@csi.org", join_year: 2026, member_type: "new_coordinator", active: true, assignment_count: 0, notion_page_id: "page-krishnapriya" },
  ],

  events: [
    {
      id: "evt-101",
      name: "CyberSecurity Flag-Hunt 2026",
      event_date: "2026-11-04",
      status: "planned",
      required_coordinator_count: 2,
      assigned_coordinators: [],
      notion_page_id: "notion-evt-101",
    },
    {
      id: "evt-102",
      name: "AI & Neural Networks Hands-on Bootcamp",
      event_date: "2026-11-12",
      status: "planned",
      required_coordinator_count: 2,
      assigned_coordinators: ["mem-01", "mem-02"],
      notion_page_id: "notion-evt-102",
    },
    {
      id: "evt-103",
      name: "Full Stack Web Dev Workshop",
      event_date: "2026-10-18",
      status: "completed",
      required_coordinator_count: 2,
      assigned_coordinators: ["mem-06", "mem-05"],
      notion_page_id: "notion-evt-103",
    },
  ],

  recentBatches: [
    {
      batch_id: "batch_400_hackathon",
      template_name: "CSI Official Event Certificate 2026",
      total_files: 400,
      processed_files: 400,
      passed_files: 372,
      failed_files: 28,
      status: "PARTIAL_FAILURE",
      created_at: "2026-10-23T14:20:00Z",
      sample_failures: [
        { filename: "cert_participant_089.pdf", failed_rule: "CSI Branch Logo Presence", reason: "Logo image object missing or below 150 DPI" },
        { filename: "cert_participant_142.pdf", failed_rule: "Event / Issuance Date", reason: "Date format mismatch or absent" },
        { filename: "cert_participant_215.pdf", failed_rule: "Forbidden Text Check", reason: "Contained placeholder 'Lorem Ipsum'" },
      ]
    }
  ],

  notionSyncState: {
    status: "healthy",
    lastSyncTimestamp: "2026-10-24T12:00:00Z",
    direction: "bidirectional",
    recordsRead: 56,
    recordsWritten: 8,
    conflictsDetected: 1,
    conflictsResolved: 1,
    activeConflict: {
      entity: "Member: Aarav Sharma",
      field: "Member Type",
      notionValue: "New Coordinator",
      appValue: "Executive",
      resolvedStrategy: "latest_wins (Notion Edit Applied)",
    }
  }
};
