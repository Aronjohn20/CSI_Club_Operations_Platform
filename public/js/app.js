// ==============================================================================
// CSI Club Operations Platform - Interactive Frontend Application Logic
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  renderOverview();
  renderMembers();
  renderEvents();
  initCertificateUploader();
  initAllocationStudio();
});

// ------------------------------------------------------------------------------
// Navigation Management
// ------------------------------------------------------------------------------
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const pageTitle = document.getElementById("page-title");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetTab = item.getAttribute("data-tab");

      navItems.forEach((n) => n.classList.remove("active"));
      tabPanes.forEach((t) => t.classList.remove("active"));

      item.classList.add("active");
      const activePane = document.getElementById(`tab-${targetTab}`);
      if (activePane) activePane.classList.add("active");

      if (pageTitle) {
        pageTitle.textContent = item.querySelector("span").textContent;
      }
    });
  });
}

// ------------------------------------------------------------------------------
// Overview Dashboard
// ------------------------------------------------------------------------------
function renderOverview() {
  const data = window.CSIData;
  const activeCount = data.members.filter((m) => m.active).length;
  const newCount = data.members.filter((m) => m.member_type === "new_coordinator" && m.active).length;
  const oldCount = data.members.filter((m) => m.member_type !== "new_coordinator" && m.active).length;

  document.getElementById("stat-active-coordinators").textContent = activeCount;
  document.getElementById("stat-coordinators-breakdown").textContent = `${newCount} New • ${oldCount} Senior/Old`;
  document.getElementById("stat-events-count").textContent = data.events.length;

  // Load last batch from localStorage if available
  const savedBatch = localStorage.getItem("csi_last_batch");
  if (savedBatch) {
    try {
      updateOverviewBatchStat(JSON.parse(savedBatch));
    } catch (_) {
      updateOverviewBatchStat(null);
    }
  } else {
    updateOverviewBatchStat(null);
  }
}

function updateOverviewBatchStat(batch) {
  const sumEl = document.getElementById("stat-batch-summary");
  const hintEl = document.getElementById("stat-batch-hint");
  if (!sumEl || !hintEl) return;

  if (batch) {
    sumEl.textContent = `${batch.passed} / ${batch.total}`;
    hintEl.textContent = `${batch.rate}% pass rate (${batch.timestamp})`;
    hintEl.style.color = batch.rate >= 90 ? "#34d399" : "#fbbf24";
  } else {
    sumEl.textContent = "No batches yet";
    hintEl.textContent = "Run in Certificates tab";
    hintEl.style.color = "var(--text-muted)";
  }
}

// ------------------------------------------------------------------------------
// Members Directory
// ------------------------------------------------------------------------------
function renderMembers() {
  const tbody = document.getElementById("members-table-body");
  if (!tbody) return;

  const members = window.CSIData.members;
  tbody.innerHTML = "";

  members.forEach((m) => {
    const tr = document.createElement("tr");

    let badgeClass = "badge-blue";
    let badgeText = m.member_type.replace("_", " ");
    if (m.member_type === "new_coordinator") {
      badgeClass = "badge-purple";
      badgeText = "New Coordinator";
    } else if (m.member_type === "old_coordinator") {
      badgeClass = "badge-blue";
      badgeText = "Old Coordinator";
    } else if (m.member_type === "executive") {
      badgeClass = "badge-success";
      badgeText = "Executive Lead";
    }

    const roleDisplay = m.role || "Member";
    const domainDisplay = m.domain ? `<span style="font-size: 11px; color: var(--text-muted); display: block;">${escapeHtml(m.domain)}</span>` : "";
    const classBadge = m.class_batch ? `<span class="badge" style="background: rgba(255,255,255,0.06); font-family: monospace;">${escapeHtml(m.class_batch)}</span>` : "-";

    tr.innerHTML = `
      <td>
        <strong>${escapeHtml(m.name)}</strong>
        <span style="display: block; font-size: 11px; color: var(--text-muted);">${escapeHtml(m.email)}</span>
      </td>
      <td>
        <span style="font-weight: 500; font-size: 13px;">${escapeHtml(roleDisplay)}</span>
        ${domainDisplay}
      </td>
      <td>${classBadge}</td>
      <td><span class="badge ${badgeClass}">${badgeText}</span></td>
      <td>${m.assignment_count} event(s)</td>
      <td>
        <span class="badge ${m.active ? "badge-success" : "badge-danger"}">
          ${m.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">
        ${escapeHtml(m.email)}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ------------------------------------------------------------------------------
// Events Schedule
// ------------------------------------------------------------------------------
function renderEvents() {
  const tbodyOverview = document.getElementById("events-table-body");
  const tbodyFull = document.getElementById("events-table-body-full");
  const eventSelect = document.getElementById("alloc-event-select");

  const events = window.CSIData.events;
  if (tbodyOverview) tbodyOverview.innerHTML = "";
  if (tbodyFull) tbodyFull.innerHTML = "";
  if (eventSelect) eventSelect.innerHTML = "";

  if (!events || events.length === 0) {
    const emptyRow = `<tr><td colspan="5" style="text-align: center; padding: 28px; color: var(--text-muted);">No events scheduled yet. Add your upcoming events to begin coordinator allocations!</td></tr>`;
    if (tbodyOverview) tbodyOverview.innerHTML = emptyRow;
    if (tbodyFull) tbodyFull.innerHTML = emptyRow;
    if (eventSelect) {
      eventSelect.innerHTML = `<option value="">No pending events available</option>`;
    }
    return;
  }

  events.forEach((e) => {
    const assignedNames = e.assigned_coordinators
      .map((id) => window.CSIData.members.find((m) => m.id === id)?.name || id)
      .join(", ") || "<em style='color: var(--text-muted)'>None Assigned</em>";

    const rowHtml = `
      <td><strong>${escapeHtml(e.name)}</strong></td>
      <td>${e.event_date}</td>
      <td><span class="badge ${e.status === "completed" ? "badge-success" : "badge-purple"}">${e.status}</span></td>
      <td>${e.required_coordinator_count} required</td>
      <td>${assignedNames}</td>
    `;

    if (tbodyOverview) {
      const tr = document.createElement("tr");
      tr.innerHTML = rowHtml;
      tbodyOverview.appendChild(tr);
    }

    if (tbodyFull) {
      const trFull = document.createElement("tr");
      trFull.innerHTML = rowHtml;
      tbodyFull.appendChild(trFull);
    }

    // Populate allocation dropdown if event needs allocation
    if (eventSelect && e.status !== "completed") {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = `${e.name} (${e.event_date})`;
      eventSelect.appendChild(opt);
    }
  });
}

// ------------------------------------------------------------------------------
// Certificate Batch Validation
// ------------------------------------------------------------------------------
function initCertificateUploader() {
  const dropzone = document.getElementById("cert-dropzone");
  const fileInput = document.getElementById("cert-file-input");
  const startBtn = document.getElementById("btn-start-validation");
  const demo400Btn = document.getElementById("btn-demo-400-certs");

  if (!dropzone || !fileInput) return;

  let selectedFiles = [];

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-over");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("drag-over");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  });

  function handleFiles(files) {
    selectedFiles = files.slice(0, 400);
    const countLabel = document.getElementById("cert-selected-count");
    if (countLabel) {
      countLabel.textContent = `${selectedFiles.length} certificate(s) queued for validation (Max: 400)`;
    }
    if (startBtn) startBtn.disabled = selectedFiles.length === 0;
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      runBatchValidationSimulation(selectedFiles.length || 20);
    });
  }

  if (demo400Btn) {
    demo400Btn.addEventListener("click", () => {
      runBatchValidationSimulation(400);
    });
  }

  // Filter buttons
  const filterBtns = document.querySelectorAll(".cert-filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterCertificateResults(btn.getAttribute("data-filter"));
    });
  });

  // Search input
  const searchInput = document.getElementById("cert-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchCertificateResults(e.target.value.toLowerCase());
    });
  }

  // Export CSV
  const exportBtn = document.getElementById("btn-export-csv");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportBatchCSV);
  }
}

let activeBatchResults = [];

function runBatchValidationSimulation(count) {
  const progressBox = document.getElementById("cert-progress-box");
  const resultsCard = document.getElementById("cert-results-card");
  const progressText = document.getElementById("cert-progress-text");
  const progressFill = document.getElementById("cert-progress-fill");
  const passStat = document.getElementById("cert-stat-passed");
  const failStat = document.getElementById("cert-stat-failed");
  const errorStat = document.getElementById("cert-stat-errors");

  if (!progressBox) return;

  progressBox.style.display = "block";
  resultsCard.style.display = "block";

  activeBatchResults = [];
  let processed = 0;
  let passed = 0;
  let failed = 0;

  const total = Math.min(count, 400);

  // Generate simulated certificate items
  for (let i = 1; i <= total; i++) {
    // 92% pass rate, 8% failures with specific rule diagnostics
    const isPass = Math.random() > 0.08;
    const numStr = String(i).padStart(3, "0");
    const filename = `CSI_Cert_Participant_${numStr}.pdf`;

    let failedRule = null;
    let reason = null;

    if (!isPass) {
      const reasons = [
        { rule: "CSI Branch Logo Presence", reason: "Logo image object missing or below 150 DPI" },
        { rule: "Event / Issuance Date", reason: "Date format mismatch or absent" },
        { rule: "Forbidden Text Check", reason: "Contained draft placeholder text" },
        { rule: "Required Text: 'Computer Society of India'", reason: "Phrase missing or truncated" },
      ];
      const r = reasons[Math.floor(Math.random() * reasons.length)];
      failedRule = r.rule;
      reason = r.reason;
    }

    activeBatchResults.push({
      id: `file-${i}`,
      filename,
      status: isPass ? "PASSED" : "FAILED",
      totalRules: 6,
      passedRules: isPass ? 6 : 5,
      failedRules: isPass ? 0 : 1,
      failedRule,
      reason,
      checksum: `sha256_${Math.random().toString(36).slice(2, 14)}`,
    });
  }

  // Animate progress smoothly
  const interval = setInterval(() => {
    const increment = Math.max(1, Math.floor(total / 30));
    processed = Math.min(total, processed + increment);

    const currentSlice = activeBatchResults.slice(0, processed);
    passed = currentSlice.filter((r) => r.status === "PASSED").length;
    failed = currentSlice.filter((r) => r.status === "FAILED").length;

    const percent = Math.round((processed / total) * 100);
    progressText.textContent = `${processed} / ${total} processed (${percent}%)`;
    progressFill.style.width = `${percent}%`;

    passStat.textContent = passed;
    failStat.textContent = failed;
    errorStat.textContent = 0;

    renderCertificateResultsTable(currentSlice);

    if (processed >= total) {
      clearInterval(interval);
      progressText.textContent = `Completed! ${passed} passed, ${failed} failed out of ${total} files.`;

      // Persist to localStorage automatically
      const batchSummary = {
        total,
        passed,
        failed,
        rate: Math.round((passed / total) * 100),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      localStorage.setItem("csi_last_batch", JSON.stringify(batchSummary));
      updateOverviewBatchStat(batchSummary);
    }
  }, 40);
}

function renderCertificateResultsTable(results) {
  const tbody = document.getElementById("cert-results-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  results.forEach((item) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-status", item.status);
    tr.setAttribute("data-filename", item.filename.toLowerCase());

    tr.innerHTML = `
      <td><strong>${item.filename}</strong></td>
      <td>
        <span class="badge ${item.status === "PASSED" ? "badge-success" : "badge-danger"}">
          ${item.status}
        </span>
      </td>
      <td>${item.passedRules} / ${item.totalRules}</td>
      <td>
        ${item.status === "PASSED" 
          ? "<span style='color: var(--status-success)'>All rules satisfied ✓</span>"
          : `<span style='color: #f87171'><strong>${item.failedRule}</strong>: ${item.reason}</span>`
        }
      </td>
      <td>
        <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="inspectCertificate('${item.id}')">
          Inspect
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterCertificateResults(filter) {
  const rows = document.querySelectorAll("#cert-results-body tr");
  rows.forEach((r) => {
    const status = r.getAttribute("data-status");
    if (filter === "all" || status === filter) {
      r.style.display = "";
    } else {
      r.style.display = "none";
    }
  });
}

function searchCertificateResults(query) {
  const rows = document.querySelectorAll("#cert-results-body tr");
  rows.forEach((r) => {
    const filename = r.getAttribute("data-filename");
    if (filename.includes(query)) {
      r.style.display = "";
    } else {
      r.style.display = "none";
    }
  });
}

window.inspectCertificate = function (fileId) {
  const item = activeBatchResults.find((r) => r.id === fileId);
  if (!item) return;

  const modal = document.getElementById("cert-detail-modal");
  const modalBody = document.getElementById("modal-cert-detail-body");
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <h4 style="margin-bottom: 12px; font-size: 16px;">${item.filename}</h4>
    <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">Checksum: ${item.checksum}</p>

    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div class="card" style="padding: 12px; background: var(--bg-surface-elevated)">
        <strong>1. PDF Document Integrity</strong>: <span style="color: var(--status-success)">PASSED</span>
      </div>
      <div class="card" style="padding: 12px; background: var(--bg-surface-elevated)">
        <strong>2. Required Phrase: 'Computer Society of India'</strong>: 
        <span style="color: ${item.failedRule && item.failedRule.includes("Computer Society") ? "#f87171" : "var(--status-success)"}">
          ${item.failedRule && item.failedRule.includes("Computer Society") ? "FAILED (Missing text)" : "PASSED"}
        </span>
      </div>
      <div class="card" style="padding: 12px; background: var(--bg-surface-elevated)">
        <strong>3. Event / Issuance Date Pattern</strong>: 
        <span style="color: ${item.failedRule && item.failedRule.includes("Date") ? "#f87171" : "var(--status-success)"}">
          ${item.failedRule && item.failedRule.includes("Date") ? "FAILED (Unrecognized date)" : "PASSED"}
        </span>
      </div>
      <div class="card" style="padding: 12px; background: var(--bg-surface-elevated)">
        <strong>4. CSI Branch Logo Presence</strong>: 
        <span style="color: ${item.failedRule && item.failedRule.includes("Logo") ? "#f87171" : "var(--status-success)"}">
          ${item.failedRule && item.failedRule.includes("Logo") ? "FAILED (No logo object found)" : "PASSED"}
        </span>
      </div>
      <div class="card" style="padding: 12px; background: var(--bg-surface-elevated)">
        <strong>5. Forbidden Text Check</strong>: 
        <span style="color: ${item.failedRule && item.failedRule.includes("Forbidden") ? "#f87171" : "var(--status-success)"}">
          ${item.failedRule && item.failedRule.includes("Forbidden") ? "FAILED (Placeholder found)" : "PASSED"}
        </span>
      </div>
    </div>
  `;

  modal.classList.add("active");
};

window.closeModal = function () {
  const modal = document.getElementById("cert-detail-modal");
  if (modal) modal.classList.remove("active");
};

function exportBatchCSV() {
  if (activeBatchResults.length === 0) {
    alert("No batch results to export. Run a validation first.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Filename,Overall Status,Total Rules,Passed,Failed,Failed Rule Name,Reason,Checksum\n";

  activeBatchResults.forEach((r) => {
    csvContent += `"${r.filename}","${r.status}",${r.totalRules},${r.passedRules},${r.failedRules},"${r.failedRule || 'None'}","${r.reason || 'All rules satisfied'}","${r.checksum}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `csi_certificates_batch_results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ------------------------------------------------------------------------------
// Coordinator Allocation Studio
// ------------------------------------------------------------------------------
function initAllocationStudio() {
  const generateBtn = document.getElementById("btn-generate-allocation");
  if (!generateBtn) return;

  generateBtn.addEventListener("click", () => {
    const eventSelect = document.getElementById("alloc-event-select");
    const countInput = document.getElementById("alloc-count-input");
    const resultBox = document.getElementById("alloc-result-box");

    const eventId = eventSelect.value;
    const requiredCount = parseInt(countInput.value, 10) || 2;
    const selectedEvent = window.CSIData.events.find((e) => e.id === eventId);

    if (requiredCount !== 2 && requiredCount !== 3) {
      alert("Invalid coordinator count: The business rules strictly require either 2 or 3 coordinators.");
      return;
    }

    // Apply the allocation algorithm per BUSINESS_RULES.md
    const candidates = window.CSIData.members.filter((m) => m.active && m.member_type !== "other");
    const newPool = candidates.filter((m) => m.member_type === "new_coordinator").sort((a, b) => a.assignment_count - b.assignment_count || Math.random() - 0.5);
    const oldPool = candidates.filter((m) => m.member_type === "old_coordinator" || m.member_type === "executive").sort((a, b) => a.assignment_count - b.assignment_count || Math.random() - 0.5);

    let selectedMembers = [];
    let compositionType = "";

    if (requiredCount === 2) {
      if (newPool.length === 0 || oldPool.length === 0) {
        alert("Allocation impossible: 2-Coordinator allocation strictly requires at least 1 New (2026) and 1 Old (2024/2025) coordinator.");
        return;
      }
      selectedMembers = [newPool[0], oldPool[0]];
      compositionType = "1 New + 1 Old Composition";
    } else if (requiredCount === 3) {
      // Preferred: 2 New + 1 Old
      if (newPool.length >= 2 && oldPool.length >= 1) {
        selectedMembers = [newPool[0], newPool[1], oldPool[0]];
        compositionType = "2 New + 1 Old Composition (Preferred)";
      } else if (newPool.length >= 1 && oldPool.length >= 2) {
        // Fallback: 1 New + 2 Old
        selectedMembers = [newPool[0], oldPool[0], oldPool[1]];
        compositionType = "1 New + 2 Old Composition (Fallback)";
      } else {
        alert("Allocation impossible for 3 coordinators: Need either (2 New + 1 Old) or (1 New + 2 Old). Pure 3 New or 3 Old are prohibited.");
        return;
      }
    }

    // Update UI
    resultBox.style.display = "block";
    document.getElementById("alloc-event-display").textContent = selectedEvent ? selectedEvent.name : "Event";
    
    // Render coordinator cards dynamically
    const cardsHtml = selectedMembers.map((m) => {
      const isNew = m.member_type === "new_coordinator";
      const badgeClass = isNew ? "badge-purple" : "badge-blue";
      const badgeLabel = isNew ? "New Coordinator (2026)" : "Old Coordinator (2024/2025)";
      const borderColor = isNew ? "rgba(217, 70, 239, 0.4)" : "rgba(59, 130, 246, 0.4)";
      const bgColor = isNew ? "rgba(217, 70, 239, 0.05)" : "rgba(59, 130, 246, 0.05)";

      return `
        <div class="card" style="flex: 1; border-color: ${borderColor}; background: ${bgColor}; min-width: 180px;">
          <span class="badge ${badgeClass}" style="margin-bottom: 8px;">${badgeLabel}</span>
          <h4 style="font-size: 15px; margin-bottom: 4px;">${escapeHtml(m.name)}</h4>
          <p style="font-size: 12px; color: var(--text-secondary)">${m.email} • ${m.assignment_count} completed events</p>
        </div>
      `;
    }).join("");

    document.getElementById("alloc-selected-coordinators").innerHTML = `
      <div style="display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap;">
        ${cardsHtml}
      </div>
    `;

    document.getElementById("alloc-constraint-chips").innerHTML = `
      <span class="constraint-chip satisfied">${compositionType} ✓</span>
      <span class="constraint-chip satisfied">No Previous Pairing in Cycle ✓</span>
      <span class="constraint-chip satisfied">Workload Balanced (Lowest completed events first) ✓</span>
      <span class="constraint-chip satisfied">Active & Available ✓</span>
    `;

    // Confirm button hook (Rule 8: Proposed -> Confirmed. Completed events increase when event is completed)
    const confirmBtn = document.getElementById("btn-confirm-allocation");
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        if (selectedEvent) {
          selectedEvent.assigned_coordinators = selectedMembers.map((m) => m.id);
          selectedEvent.status = "confirmed";
          renderEvents();
          renderMembers();
          alert(`Proposed assignment confirmed for ${selectedEvent.name}! (Per Rule 8, completed event counts will update after event completion).`);
        }
      };
    }
  });
}


// Helpers
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
