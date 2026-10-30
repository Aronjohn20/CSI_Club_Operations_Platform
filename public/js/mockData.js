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
    { id: "mem-01", name: "Gayathri Binoj", role: "President", class_batch: "S7 CS B", domain: "Executive", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-02", name: "Abhishek Joby", role: "Vice President", class_batch: "S7 CS A", domain: "Executive", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-03", name: "Ayyappadas S", role: "Secretary", class_batch: "S7 CS A", domain: "Executive", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-04", name: "Fathima Naja", role: "Joint Secretary", class_batch: "S7 CSBS", domain: "Executive", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-05", name: "Suraj S Panickar", role: "Treasurer", class_batch: "S7 CS C", domain: "Executive", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-06", name: "Vishnu M P", role: "Executive Coordinator", class_batch: "S7 CSBS", domain: "Executive", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-07", name: "Aron Varghese John", role: "Operations Lead", class_batch: "S7 CS A", domain: "Operations", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-08", name: "Sneha Phinoo", role: "Operations Co-Lead", class_batch: "S5 CS D", domain: "Operations", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-09", name: "Sreya Raj", role: "Creative Lead", class_batch: "S7 IT", domain: "Creative", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-10", name: "Kripa Ann John", role: "Creative Co-Lead", class_batch: "S5 CS C", domain: "Creative", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-11", name: "Aafiya Shameer", role: "Documentation Lead", class_batch: "S7 CS A", domain: "Documentation", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-12", name: "June Maria Sudhil", role: "Documentation Co-Lead", class_batch: "S5 AD", domain: "Documentation", team_tier: "core", member_type: "new_coordinator", active: true },
    { id: "mem-13", name: "Alina Mary John", role: "Marketing Lead", class_batch: "S7 IT", domain: "Marketing", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-14", name: "Ben George Simon", role: "Marketing Co-Lead", class_batch: "S3 IT", domain: "Marketing", team_tier: "core", member_type: "new_coordinator", active: true },
    { id: "mem-15", name: "Soorya Das K S", role: "Technical Lead", class_batch: "S5 IT", domain: "Technical", team_tier: "core", member_type: "old_coordinator", active: true },
    { id: "mem-16", name: "Riyan Raz", role: "Technical Co-Lead", class_batch: "S5 CS D", domain: "Technical", team_tier: "core", member_type: "new_coordinator", active: true },

    // Sub-Core Team
    { id: "mem-17", name: "Anjali Shaju", role: "Sub-Core (Documentation)", class_batch: "S3 CS A", domain: "Documentation", team_tier: "sub_core", member_type: "new_coordinator", active: true },
    { id: "mem-18", name: "Vaishnavi Dev Thekke Veedu", role: "Sub-Core (Creative)", class_batch: "S3 CS D", domain: "Creative", team_tier: "sub_core", member_type: "new_coordinator", active: true },
    { id: "mem-19", name: "Jovit Jerry", role: "Sub-Core (Creative)", class_batch: "S5 CSBS", domain: "Creative", team_tier: "sub_core", member_type: "new_coordinator", active: true },
    { id: "mem-20", name: "Lanet Varghese", role: "Sub-Core (Operations)", class_batch: "S5 CSBS", domain: "Operations", team_tier: "sub_core", member_type: "old_coordinator", active: true },
    { id: "mem-21", name: "Elizabeth Joby", role: "Sub-Core (Operations)", class_batch: "S3 AD", domain: "Operations", team_tier: "sub_core", member_type: "new_coordinator", active: true },
    { id: "mem-22", name: "Avanthika S", role: "Sub-Core (Marketing)", class_batch: "S3 AD", domain: "Marketing", team_tier: "sub_core", member_type: "new_coordinator", active: true },
    { id: "mem-23", name: "Krishna Priya K R", role: "Sub-Core (Creative)", class_batch: "S3 AD", domain: "Creative", team_tier: "sub_core", member_type: "new_coordinator", active: true },
  ],

  events: [
    {
      id: "evt-01",
      name: "Cache Quest + Magazine launch",
      event_date: "2026-07-10",
      status: "completed",
      required_coordinator_count: 3,
      mode: "Offline",
      event_type: "Friday Event",
      description: "3 rounds tech challenge that simulates memory management and OS behaviour",
      assigned_coordinators: ["mem-11", "mem-04", "mem-12"]
    },
    {
      id: "evt-02",
      name: "Coder of the Month - July",
      event_date: "2026-07-16",
      status: "completed",
      required_coordinator_count: 2,
      mode: "Online",
      event_type: "COTM",
      description: "Monthly coding challenge",
      assigned_coordinators: ["mem-19", "mem-18"]
    },
    {
      id: "evt-03",
      name: "Tech-Jeopardy",
      event_date: "2026-08-14",
      status: "completed",
      required_coordinator_count: 2,
      mode: "Offline",
      event_type: "Friday Event",
      description: "Jeopardy style tech quiz - 5 categories, 5 point scales",
      assigned_coordinators: []
    },
    {
      id: "evt-04",
      name: "Bug Se Azadi",
      event_date: "2026-08-16",
      status: "completed",
      required_coordinator_count: 2,
      mode: "Online",
      event_type: "Independence Day Special",
      description: "Independence day themed debugging challenge and Kahoot speedrun",
      assigned_coordinators: ["mem-17", "mem-21"]
    },
    {
      id: "evt-05",
      name: "Build & Ship AI product",
      event_date: "2026-09-01",
      status: "completed",
      required_coordinator_count: 3,
      mode: "Offline",
      event_type: "Confluence",
      description: "Workshop regarding vibecoding",
      assigned_coordinators: ["mem-15", "mem-07", "mem-11"]
    },
    {
      id: "evt-06",
      name: "Traceback",
      event_date: "2026-09-15",
      status: "completed",
      required_coordinator_count: 2,
      mode: "Offline",
      event_type: "Techkshetra",
      description: "Tech escape room + CTF + Mystery solving",
      assigned_coordinators: ["mem-15", "mem-14"]
    },
    {
      id: "evt-07",
      name: "Retro Rumble",
      event_date: "2026-09-16",
      status: "completed",
      required_coordinator_count: 2,
      mode: "Online",
      event_type: "Homecoming",
      description: "Technical and Interactive quiz competition",
      assigned_coordinators: ["mem-03", "mem-04"]
    },
    {
      id: "evt-08",
      name: "Real or Cake",
      event_date: "2026-09-17",
      status: "completed",
      required_coordinator_count: 3,
      mode: "Online",
      event_type: "Homecoming",
      description: "Competition on finding whether the displayed image, audio , art are fake or not",
      assigned_coordinators: ["mem-15", "mem-12", "mem-10"]
    },
    {
      id: "evt-09",
      name: "Say Cheese",
      event_date: "2026-09-18",
      status: "completed",
      required_coordinator_count: 4,
      mode: "Offline",
      event_type: "Homecoming",
      description: "Treasure Hunt Selfie Competition",
      assigned_coordinators: ["mem-13", "mem-21", "mem-22", "mem-06"]
    },
    {
      id: "evt-10",
      name: "Coder of the Month - September",
      event_date: "2026-09-19",
      status: "completed",
      required_coordinator_count: 2,
      mode: "Online",
      event_type: "COTM",
      description: "Monthly coding challenge",
      assigned_coordinators: ["mem-07", "mem-11"]
    },
    {
      id: "evt-11",
      name: "Keeping it Reel",
      event_date: "2026-09-21",
      status: "completed",
      required_coordinator_count: 2,
      mode: "Online",
      event_type: "Homecoming",
      description: "Reel Making Competition",
      assigned_coordinators: ["mem-17", "mem-10"]
    },
    {
      id: "evt-12",
      name: "History But Wrong",
      event_date: "2026-09-23",
      status: "completed",
      required_coordinator_count: 4,
      mode: "Online",
      event_type: "Homecoming",
      description: "Digital Fictional Story Making Competition",
      assigned_coordinators: ["mem-02", "mem-18", "mem-16", "mem-23"]
    },
    {
      id: "evt-13",
      name: "Off the Script",
      event_date: "2026-09-25",
      status: "completed",
      required_coordinator_count: 5,
      mode: "Offline",
      event_type: "Homecoming",
      description: "Mystery event consisting of multiple rounds - cinema, music, decoder, rebus",
      assigned_coordinators: ["mem-03", "mem-14", "mem-19", "mem-08", "mem-01"]
    }
  ],

  recentBatches: []
};
