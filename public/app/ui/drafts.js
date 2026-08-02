import { $, state, documentTypeLabels, templateDocumentFieldSets } from "../core/constants.js";
import { escapeHtml, createId, formToObject, syncDatePickerFromDisplay, toast } from "../core/utils.js";
import { writeDrafts } from "../core/storage.js";
import { showView } from "./nav.js";
// Intentional circular import: this module needs showDocumentForm()/fillFormFromObject()/
// populateDocumentEmployeeSelect()/updateErvNonWorkingDays()/updateDocumentDisplayFields()/
// renderDocumentPicker() from ui-documents.js; ui-documents.js needs saveDraft()/
// renderCurrentTypeDrafts() from here (bindDocumentForm, showDocumentForm/resetContractForm).
// Both sides only reference the import inside function bodies, so this is safe.
import {
  showDocumentForm, fillFormFromObject, populateDocumentEmployeeSelect,
  updateErvNonWorkingDays, updateDocumentDisplayFields, renderDocumentPicker
} from "./documents.js";
import { buildDocument } from "../documents/index.js";

function draftRowHtml(draft, { showTypeBadge = true } = {}) {
  const party = draft.partyName || draft.name;
  const badge = showTypeBadge ? `<span class="doc-type-badge draft-type-badge">${escapeHtml(documentTypeLabels[draft.type] || draft.type)}</span>` : "";
  return `
    <div class="draft-row">
      <div class="draft-info">
        <div class="draft-top">
          ${badge}
          <strong class="draft-name">${escapeHtml(party)}</strong>
        </div>
        <small class="draft-meta">${escapeHtml(new Date(draft.savedAt).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" }))}</small>
      </div>
      <div class="draft-actions">
        <button class="ghost-button" data-load-draft="${escapeHtml(draft.id)}" type="button">Učitaj</button>
        <button class="ghost-button" data-rename-draft="${escapeHtml(draft.id)}" type="button">Preimenuj</button>
        <button class="danger-button" data-delete-draft="${escapeHtml(draft.id)}" type="button">Izbriši</button>
      </div>
    </div>
  `;
}

function bindDraftRowActions(container) {
  container.querySelectorAll("[data-load-draft]").forEach((btn) => btn.addEventListener("click", () => loadDraft(btn.dataset.loadDraft)));
  container.querySelectorAll("[data-rename-draft]").forEach((btn) => btn.addEventListener("click", () => renameDraft(btn.dataset.renameDraft)));
  container.querySelectorAll("[data-delete-draft]").forEach((btn) => btn.addEventListener("click", () => deleteDraft(btn.dataset.deleteDraft)));
}

// --- Draft panel embedded in the document form ---

export function renderCurrentTypeDrafts(type) {
  const container = $("#currentTypeDraftsList");
  const panel = $("#currentTypeDraftsPanel");
  if (!container || !panel) return;
  const matching = state.drafts.filter((d) => d.type === type);
  if (!matching.length) { panel.classList.add("hidden"); return; }
  panel.classList.remove("hidden");
  container.innerHTML = matching.map(draftRowHtml).join("");
  bindDraftRowActions(container);
}

// --- Draft management ---

// --- Draft management ---

export function saveDraft() {
  const form = $("#documentForm");
  const data = formToObject(form);
  const type = data.type || "full_time";
  const typeSelect = $("#contractType");
  const docTypeLabel = typeSelect.options[typeSelect.selectedIndex]?.text || type;
  const employerId = data.employer_id || data.a1_employer_id || data.erv_employer_id || data.services_client_id;
  const employeeId = data.employee_id || data.a1_employee_id || data.erv_employee_id;
  const employer = state.employers.find((e) => e.id === employerId);
  const employee = state.employees.find((e) => e.id === employeeId);
  const paPartyName = templateDocumentFieldSets[type]
    ? (data.pa_source === "adhoc_company" || data.pa_source === "adhoc_person"
        ? data.pa_name
        : state.employers.find((e) => e.id === data.pa_entity_id)?.company_name ||
          state.employees.find((e) => e.id === data.pa_entity_id)?.name)
    : null;
  const partyParts = [
    employer?.company_name || paPartyName,
    employee ? `${employee.name} ${employee.lastname}`.trim() : ""
  ].filter(Boolean);
  const partyName = partyParts.join(", ");
  const autoName = partyParts.length ? `${docTypeLabel} – ${partyParts.join(", ")}` : docTypeLabel;
  const draft = {
    id: createId("draft", `${type}-${Date.now()}`),
    name: autoName,
    type,
    partyName,
    formData: data,
    savedAt: new Date().toISOString()
  };
  state.drafts.unshift(draft);
  writeDrafts();
  renderDrafts();
  renderCurrentTypeDrafts(type);
  toast("Nacrt je spremljen.");
}

export function loadDraft(id) {
  const draft = state.drafts.find((d) => d.id === id);
  if (!draft) return;
  const type = draft.formData.type || "full_time";
  showView("documents");
  showDocumentForm(type);
  const form = $("#documentForm");
  fillFormFromObject(form, draft.formData);
  if (type === "erv") {
    populateDocumentEmployeeSelect("ervEmployee", form.elements.erv_employer_id?.value || "");
    if (draft.formData.erv_employee_id) form.elements.erv_employee_id.value = draft.formData.erv_employee_id;
    updateErvNonWorkingDays();
  } else if (type === "annex_a1" || type === "annex_standard") {
    populateDocumentEmployeeSelect("a1Employee", form.elements.a1_employer_id?.value || "");
    if (draft.formData.a1_employee_id) form.elements.a1_employee_id.value = draft.formData.a1_employee_id;
  } else {
    populateDocumentEmployeeSelect("documentEmployee", form.elements.employer_id?.value || "");
    if (draft.formData.employee_id) form.elements.employee_id.value = draft.formData.employee_id;
  }
  form.querySelectorAll(".date-hr-input").forEach(syncDatePickerFromDisplay);
  updateDocumentDisplayFields();
  renderCurrentTypeDrafts(type);
  $("#documentPreview").innerHTML = buildDocument().html;
  toast(`Nacrt "${draft.name}" je učitan.`);
}

export function renameDraft(id) {
  const draft = state.drafts.find((d) => d.id === id);
  if (!draft) return;
  const newName = window.prompt("Upiši naziv nacrta:", draft.name);
  if (newName === null) return;
  const trimmed = newName.trim();
  if (!trimmed) return;
  draft.name = trimmed;
  writeDrafts();
  renderDrafts();
}

export function deleteDraft(id) {
  if (!window.confirm("Izbrisati nacrt?")) return;
  const type = state.drafts.find((d) => d.id === id)?.type;
  state.drafts = state.drafts.filter((d) => d.id !== id);
  writeDrafts();
  renderDrafts();
  if (type) renderCurrentTypeDrafts(type);
  toast("Nacrt je izbrisan.");
}

export function renderDrafts() {
  const countEl = $("#draftCount");
  if (countEl) countEl.textContent = state.drafts.length;
  renderDocumentPicker();
  const list = $("#nacrtiList");
  if (!list) return;
  const query = ($("#nacrtiSearch")?.value || "").trim().toLowerCase();
  const filtered = query
    ? state.drafts.filter((d) => `${d.name} ${d.partyName || ""} ${documentTypeLabels[d.type] || d.type}`.toLowerCase().includes(query))
    : state.drafts;
  if (!filtered.length) {
    list.innerHTML = `<p class="drafts-empty">${query ? "Nema nacrta koji odgovaraju pretrazi." : "Nema spremljenih nacrta. Otvorite dokument i kliknite <strong>Spremi nacrt</strong>."}</p>`;
    return;
  }
  const groups = new Map();
  filtered.forEach((draft) => {
    if (!groups.has(draft.type)) groups.set(draft.type, []);
    groups.get(draft.type).push(draft);
  });
  list.innerHTML = Array.from(groups.entries()).map(([type, drafts]) => `
    <div class="draft-group">
      <h3 class="draft-group-title">${escapeHtml(documentTypeLabels[type] || type)} (${drafts.length})</h3>
      ${drafts.map((draft) => draftRowHtml(draft, { showTypeBadge: false })).join("")}
    </div>
  `).join("");
  bindDraftRowActions(list);
}

// --- Form fill from draft ---

// --- Bindings ---

export function bindDrafts() {
  $("#nacrtiSearch")?.addEventListener("input", renderDrafts);
}
