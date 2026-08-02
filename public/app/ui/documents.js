import {
  $, $$, state, documentTypeLabels, documentCategories,
  numbers1To30, numbers1To12, vacationOptions, courtOptions,
  monthNamesHr, ervColumnDescriptions, ervColumns,
  employmentDocumentDefinitions, employmentDocumentFieldSets, templateDocumentFieldSets,
  partySourceOptions, sourceLabels, getTemplateLastUpdated
} from "../core/constants.js";
import {
  escapeHtml, formatDate, formatAddress, numberOptions,
  syncDatePickerFromDisplay, croatianNonWorkingDays, titleCaseDocument, clamp
} from "../core/utils.js";
import { clearFieldInvalid, withBusyButton, validateForm } from "./shared.js";
// Intentional circular import: showView() is needed for the "back to picker"
// button; ui-nav.js needs showDocumentPicker() from this module for the
// nav-item re-click case. Both are used only inside function bodies, so the
// ESM circular import is safe (see the comment in ui-nav.js).
import { showView } from "./nav.js";
// Intentional circular import: saveDraft()/renderCurrentTypeDrafts() are needed
// here; ui-drafts.js needs showDocumentForm()/fillFormFromObject() from this
// module (loadDraft). Both sides only reference the import inside function bodies.
import { saveDraft, renderCurrentTypeDrafts } from "./drafts.js";
import { buildDocument, buildBlankDocumentFromForm } from "../documents/index.js";
import { downloadPrintableHtml } from "../io/print.js";

export function showDocumentPicker() {
  $("#documentsPickerView")?.classList.remove("hidden");
  $("#documentsFormView")?.classList.add("hidden");
  renderDocumentPicker();
}

export function showDocumentForm(type) {
  $("#documentsPickerView")?.classList.add("hidden");
  $("#documentsFormView")?.classList.remove("hidden");
  $("#contractType").value = type;
  updateContractUi();
  updatePartySourceOptions(type);
  renderSelects();
  renderCurrentTypeDrafts(type);
  $("#templateUpdatedBadge").textContent = `Predložak ažuriran: ${formatDate(getTemplateLastUpdated(type))}`;
}

// --- Validation ---

// --- Contract control hydration ---

export function hydrateContractControls() {
  $("#trailNumbers").innerHTML = numbers1To30.map((value) => `<option>${value}</option>`).join("");
  $("#trailNumbers").value = "1";
  $("#vacationSelect").innerHTML = vacationOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#vacationSelect").value = "20";
  $("#courtSelect").innerHTML = courtOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#courtSelect").value = "Zagrebu";
  $("#a1CourtSelect").innerHTML = courtOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#a1CourtSelect").value = "Zagrebu";
  $("#annexCourtSelect").innerHTML = courtOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#annexCourtSelect").value = "Zagrebu";
  $("#annexVacationSelect").innerHTML = vacationOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#annexVacationSelect").value = "20";
  $("#employmentVacationTotalSelect").innerHTML = vacationOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#employmentVacationTotalSelect").value = "20";
  $("#employmentVacationUsedSelect").innerHTML = ["0", ...vacationOptions].map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#employmentVacationUsedSelect").value = "0";
  $("#employmentVacationRemainingSelect").innerHTML = ["0", ...vacationOptions].map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#employmentVacationRemainingSelect").value = "20";
  $("#servicesCourtSelect").innerHTML = courtOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#servicesCourtSelect").value = "Zagrebu";
  $("#servicesDeliveryDaySelect").innerHTML = numberOptions(1, 31);
  $("#servicesDeliveryDaySelect").value = "5";
  $("#servicesPaymentDueSelect").innerHTML = numberOptions(1, 31);
  $("#servicesPaymentDueSelect").value = "8";
  $("#servicesDurationType").value = "neodređeno vrijeme";
  $("#servicesNoticePeriodSelect").innerHTML = numberOptions(1, 60);
  $("#servicesNoticePeriodSelect").value = "30";
  $("#servicesCopiesSelect").innerHTML = numberOptions(2, 6);
  $("#servicesCopiesSelect").value = "2";
  hydrateErvControls();
  updateContractUi();
  updateWorkType();
  updateWorkingShift();
  updateContractTermination();
  updateServicesDurationUi();
  updateStandardAnnexUi();
  ["endJob", "startJob", "contractStart"].forEach(updatePairedCheckboxes);
}

export function hydrateErvControls() {
  const currentYear = new Date().getFullYear();
  $("#ervYearSelect").innerHTML = Array.from({ length: 5 }, (_, index) => {
    const year = currentYear + index;
    return `<option value="${year}">${year}</option>`;
  }).join("");
  $("#ervMonthSelect").innerHTML = monthNamesHr.map((name, index) => `<option value="${index + 1}">${index + 1} - ${name}</option>`).join("");
  $("#ervYearSelect").value = String(currentYear);
  $("#ervMonthSelect").value = String(new Date().getMonth() + 1);
  renderErvFieldExplanations();
  updateErvNonWorkingDays();
}

function renderErvFieldExplanations() {
  const container = $("#ervFieldExplanations");
  if (!container) return;
  container.innerHTML = `
    <h4>Objašnjenje ERV polja</h4>
    <div class="erv-explanation-grid">
      ${ervColumns.map((column) => `
        <div class="erv-explanation-item">
          <strong>${escapeHtml(column)}</strong>
          <span>${escapeHtml(column === "Datum" ? "Datum" : ervColumnDescriptions[column] || "")}</span>
        </div>
      `).join("")}
    </div>
  `;
}

export function resetContractForm() {
  const currentType = $("#contractType").value;
  const form = $("#documentForm");
  form.reset();
  $("#contractType").value = currentType;
  hydrateContractControls();
  setDefaultDates();
  renderSelects();
  renderCurrentTypeDrafts(currentType);
  $("#documentPreview").innerHTML = buildDocument().html;
}

// --- UI update helpers ---

// --- UI update helpers ---

export function updateContractUi() {
  const type = $("#contractType").value;
  const isPartTime = type === "part_time";
  const isContract = type === "full_time" || type === "part_time";
  const isAnnexA1 = type === "annex_a1";
  const isStandardAnnex = type === "annex_standard";
  const isAnnex = isAnnexA1 || isStandardAnnex;
  const isErv = type === "erv";
  const isAccountingServices = type === "accounting_services";
  const isTemplateDocument = Boolean(templateDocumentFieldSets[type]);
  const isEmploymentDocument = Boolean(employmentDocumentDefinitions[type]);
  const titles = {
    full_time: "Ugovor o radu na neodređeno vrijeme",
    part_time: "Ugovor o radu na određeno vrijeme",
    annex_standard: "Aneks ugovora o radu",
    annex_a1: "Aneks ugovora o radu za A1",
    erv: "Evidencija radnog vremena",
    accounting_services: "Ugovor o knjigovodstveno-računovodstvenim uslugama",
    business_cooperation: "Ugovor o poslovnoj suradnji",
    vehicle_power_of_attorney: "Punomoć za vozilo",
    work_order: "Radni nalog",
    virtual_address_lease: "Ugovor o najmu virtualne adrese",
    ...Object.fromEntries(Object.entries(employmentDocumentDefinitions).map(([key, value]) => [key, titleCaseDocument(value.title)]))
  };
  $("#documentForm h2").textContent = titles[type] || "Dokumenti";
  $$(".contract-party-section").forEach((element) => element.classList.toggle("hidden", !(isContract || isEmploymentDocument)));
  $$(".annex-party-section").forEach((element) => element.classList.toggle("hidden", !isAnnex));
  $$(".contract-doc-section").forEach((element) => element.classList.toggle("hidden", !isContract));
  $$(".standard-annex-doc-section").forEach((element) => element.classList.toggle("hidden", !isStandardAnnex));
  $$(".annex-doc-section").forEach((element) => element.classList.toggle("hidden", !isAnnexA1));
  $$(".erv-doc-section").forEach((element) => element.classList.toggle("hidden", !isErv));
  $$(".accounting-services-section").forEach((element) => element.classList.toggle("hidden", !isAccountingServices));
  $$(".template-doc-section").forEach((element) => element.classList.toggle("hidden", !isTemplateDocument));
  $$(".employment-doc-section").forEach((element) => element.classList.toggle("hidden", !isEmploymentDocument));
  updatePartySectionUi(isContract, isEmploymentDocument);
  updateEmploymentDocumentFields(type);
  $$(".only-ptc").forEach((element) => element.classList.toggle("hidden", !isPartTime));
  $$(".full-time-intro").forEach((element) => element.classList.toggle("hidden", isPartTime));
  updateContractTermination();
  updateStandardAnnexUi();
  updateTemplateDocumentFields();
  updateDocumentDisplayFields();
  updateErvNonWorkingDays();
  $("#documentPreview").innerHTML = buildDocument().html;
}

function updatePartySectionUi(isContract, isEmploymentDocument) {
  $$(".contract-party-contract-only").forEach((element) => {
    toggleElementWithDatePicker(element, !isContract);
  });
  $$(".contract-party-employment-only").forEach((element) => {
    element.classList.toggle("hidden", !isEmploymentDocument);
  });
  const contractDate = $("#documentForm").elements.contract_date;
  if (contractDate) contractDate.disabled = !isContract;
}

function updateEmploymentDocumentFields(type) {
  const selectedFields = new Set(employmentDocumentFieldSets[type] || []);
  $$("[data-employment-field]").forEach((element) => {
    const visible = selectedFields.has(element.dataset.employmentField);
    element.classList.toggle("hidden", !visible);
    element.querySelectorAll("input, select, textarea").forEach((control) => { control.disabled = !visible; });
  });
}

export function updateStandardAnnexUi() {
  const isFixed = $("#annexNewContractType")?.value === "fixed";
  $$(".standard-annex-fixed-end").forEach((element) => {
    element.classList.toggle("hidden", !isFixed);
    element.querySelectorAll("input, select, textarea").forEach((control) => { control.disabled = !isFixed; });
  });
}

function updateTemplateDocumentFields() {
  const type = $("#contractType")?.value;
  const selectedFields = new Set(templateDocumentFieldSets[type] || []);
  $$("[data-template-field]").forEach((element) => {
    const visible = selectedFields.has(element.dataset.templateField);
    element.classList.toggle("hidden", !visible);
    element.querySelectorAll("input, select, textarea").forEach((control) => { control.disabled = !visible; });
  });
  updatePartyPickerVisibility();
}

function toggleElementWithDatePicker(element, hidden) {
  element.classList.toggle("hidden", hidden);
  const picker = element.nextElementSibling;
  if (element.classList.contains("date-picker-display") && picker?.classList.contains("native-date-picker")) {
    picker.classList.toggle("hidden", hidden);
    picker.disabled = hidden;
  }
}

export function updateTrailNumbers() {
  const selected = $("#trailOption").value === "mjesec/a/i" ? numbers1To12 : numbers1To30;
  $("#trailNumbers").innerHTML = selected.map((value) => `<option>${value}</option>`).join("");
}

export function updateWorkType() {
  const input = $("#weeklyWorkingHours");
  if ($("#workType").value === "puno") {
    input.min = "40";
    input.max = "56";
    input.value = clamp(Number(input.value || 40), 40, 56).toFixed(1);
  } else {
    input.min = "0.5";
    input.max = "39.5";
    input.value = clamp(Number(input.value || 20), 0.5, 39.5).toFixed(1);
  }
}

export function updateWorkingShift() {
  const value = $("#workingShift").value;
  const usesTime = value === "jednokratno" || value === "klizno";
  $$(".shift-time-field").forEach((element) => element.classList.toggle("hidden", !usesTime));
  $$(".shift-description-field").forEach((element) => element.classList.toggle("hidden", usesTime));
}

export function updateContractTermination() {
  const isPartTime = $("#contractType").value === "part_time";
  const canTerminate = !isPartTime || $("#contractTermination").value === "mogu";
  $("#terminationEmployer").disabled = !canTerminate;
  $("#terminationEmployee").disabled = !canTerminate;
  if (!canTerminate) {
    $("#terminationEmployer").value = "0";
    $("#terminationEmployee").value = "0";
  } else if ($("#terminationEmployer").value === "0" && $("#terminationEmployee").value === "0") {
    $("#terminationEmployer").value = "15";
    $("#terminationEmployee").value = "15";
  }
}

export function updateServicesDurationUi() {
  const isFixedTerm = $("#servicesDurationType").value === "određeno vrijeme";
  $$(".services-duration-end").forEach((element) => element.classList.toggle("hidden", !isFixedTerm));
  const endDate = $("#documentForm").elements.services_end_date;
  if (endDate) endDate.disabled = !isFixedTerm;
}

export function updatePairedCheckboxes(pair) {
  const boxes = $$(`.paired-checkbox[data-pair="${pair}"]`);
  if (!boxes.length) return;
  if (!boxes.some((box) => box.checked)) boxes[0].checked = true;
  boxes.forEach((box) => {
    const target = $("#documentForm").elements[box.dataset.target];
    if (target) target.disabled = !box.checked;
  });
}

export function updateErvNonWorkingDays() {
  const year = Number($("#ervYearSelect")?.value || new Date().getFullYear());
  const month = Number($("#ervMonthSelect")?.value || new Date().getMonth() + 1);
  const field = $("#ervNonWorkingDays");
  if (!field) return;
  const days = croatianNonWorkingDays(year).filter((item) => item.month === month);
  field.value = days.length
    ? days.map((item) => `${String(item.day).padStart(2, "0")}.${String(item.month).padStart(2, "0")}.${year}. - ${item.name}`).join("\n")
    : "Nema hrvatskih blagdana ni neradnih dana u odabranom mjesecu.";
}

function updatePartyPickerVisibility() {
  ["pa", "pb"].forEach((prefix) => {
    const sourceEl = $(`#${prefix}Source`);
    if (!sourceEl) return;
    const source = sourceEl.value;
    const isEntity = ["employer", "employee", "accounting"].includes(source);
    const isAdhoc = source === "adhoc_company" || source === "adhoc_person";
    const isCompany = source === "adhoc_company";
    $$(`[data-${prefix}-field="entity"]`).forEach((el) => {
      el.classList.toggle("hidden", !isEntity);
      el.querySelectorAll("input, select, textarea").forEach((c) => { c.disabled = !isEntity; });
    });
    $$(`[data-${prefix}-field="adhoc"]`).forEach((el) => {
      el.classList.toggle("hidden", !isAdhoc);
      el.querySelectorAll("input, select, textarea").forEach((c) => { c.disabled = !isAdhoc; });
    });
    $$(`[data-${prefix}-field="director"]`).forEach((el) => {
      el.classList.toggle("hidden", !isCompany);
      el.querySelectorAll("input, select, textarea").forEach((c) => { c.disabled = !isCompany; });
    });
  });
}

export function updatePartySourceOptions(type) {
  ["pa", "pb"].forEach((prefix) => {
    const select = $(`#${prefix}Source`);
    if (!select) return;
    const sources = (partySourceOptions[prefix] || {})[type] || ["employer"];
    const prev = select.value;
    select.innerHTML = sources.map((s) => `<option value="${s}"${s === prev ? " selected" : ""}>${escapeHtml(sourceLabels[s] || s)}</option>`).join("");
    if (!sources.includes(select.value)) select.value = sources[0];
  });
  renderPartyEntitySelects();
  updatePartyPickerVisibility();
}

// --- Default dates ---

// --- Default dates ---

export function setDefaultDates() {
  const today = formatDate(new Date());
  const df = $("#documentForm").elements;
  df.contract_date.value = today;
  df.end_job_date.value = today;
  df.start_date.value = today;
  df.contract_starting_with.value = today;
  df.a1_contract_date.value = today;
  df.a1_end_date.value = today;
  df.a1_signature_date.value = today;
  df.annex_contract_date.value = today;
  df.annex_effective_date.value = today;
  df.annex_new_end_date.value = today;
  df.annex_start_date.value = today;
  df.annex_signature_date.value = today;
  df.template_document_date.value = today;
  df.business_end_date.value = today;
  df.vehicle_valid_until.value = today;
  df.lease_start_date.value = today;
  df.lease_end_date.value = today;
  df.services_contract_date.value = today;
  df.services_end_date.value = today;
  df.employment_doc_date.value = today;
  df.employment_contract_date.value = today;
  df.employment_start_date.value = today;
  df.employment_end_date.value = today;
  df.employment_vacation_from.value = today;
  df.employment_vacation_to.value = today;
  df.employment_vacation_year.value = new Date().getFullYear();
  const gf = $("#gfiForm").elements;
  gf.report_date.value = today;
  gf.report_year.value = new Date().getFullYear() - 1;
  $$(".date-hr-input").forEach(syncDatePickerFromDisplay);
}

// --- GFI import ---

// --- Selects / display fields ---

export function renderSelects() {
  const employerOptions = state.employers.map((employer) => `<option value="${escapeHtml(employer.company_name)}">${escapeHtml(employer.company_name)}</option>`).join("");
  const employerIdOptions = state.employers.map((employer) => `<option value="${escapeHtml(employer.id)}">${escapeHtml(employer.company_name)}</option>`).join("");
  const accountingIdOptions = state.accounting.map((office) => `<option value="${escapeHtml(office.id)}">${escapeHtml(office.company_name)}</option>`).join("");
  $("#employeeEmployers").innerHTML = employerOptions;
  $("#documentEmployer").innerHTML = employerIdOptions;
  $("#a1Employer").innerHTML = employerIdOptions;
  $("#ervEmployer").innerHTML = employerIdOptions;
  $("#servicesClient").innerHTML = employerIdOptions;
  $("#servicesAccounting").innerHTML = accountingIdOptions;
  renderPartyEntitySelects();
  populateDocumentEmployeeSelect("documentEmployee", $("#documentEmployer").value);
  populateDocumentEmployeeSelect("a1Employee", $("#a1Employer").value);
  populateDocumentEmployeeSelect("ervEmployee", $("#ervEmployer").value);
  updateDocumentDisplayFields();
}

export function populateDocumentEmployeeSelect(selectId, employerId) {
  const employer = state.employers.find((item) => item.id === employerId);
  const employees = employer
    ? state.employees.filter((employee) => employee.employer_names.includes(employer.company_name))
    : state.employees;
  const fallback = employees.length ? employees : state.employees;
  $(`#${selectId}`).innerHTML = fallback.map((employee) => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name)} ${escapeHtml(employee.lastname)}</option>`).join("");
}

export function updateDocumentDisplayFields() {
  const form = $("#documentForm");
  const contractEmployer = state.employers.find((item) => item.id === form.elements.employer_id.value) || {};
  const contractEmployee = state.employees.find((item) => item.id === form.elements.employee_id.value) || {};
  const a1Employer = state.employers.find((item) => item.id === form.elements.a1_employer_id.value) || {};
  const a1Employee = state.employees.find((item) => item.id === form.elements.a1_employee_id.value) || {};
  if (form.elements.employer_info_display) {
    form.elements.employer_info_display.value = `${formatAddress(contractEmployer)}${contractEmployer.vat ? `, OIB: ${contractEmployer.vat}` : ""}`;
  }
  if (form.elements.director_display) {
    form.elements.director_display.value = contractEmployer.director || "";
  }
  if (form.elements.employee_personal_id_display) {
    form.elements.employee_personal_id_display.value = contractEmployee.personal_id ? `OIB/Putovnica: ${contractEmployee.personal_id}` : "";
  }
  if (form.elements.a1_employer_info_display) {
    form.elements.a1_employer_info_display.value = `${formatAddress(a1Employer)}${a1Employer.vat ? `, OIB: ${a1Employer.vat}` : ""}`;
  }
  if (form.elements.a1_director_display) {
    form.elements.a1_director_display.value = a1Employer.director || "";
  }
  if (form.elements.a1_employee_personal_id_display) {
    form.elements.a1_employee_personal_id_display.value = a1Employee.personal_id ? `OIB/Putovnica: ${a1Employee.personal_id}` : "";
  }
}

function renderPartyEntitySelects() {
  ["pa", "pb"].forEach((prefix) => {
    const sourceEl = $(`#${prefix}Source`);
    const entitySelect = $(`#${prefix}Entity`);
    if (!sourceEl || !entitySelect) return;
    const source = sourceEl.value;
    const prev = entitySelect.value;
    if (source === "employer") {
      entitySelect.innerHTML = state.employers.map((e) => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.company_name || "")}</option>`).join("");
    } else if (source === "employee") {
      entitySelect.innerHTML = state.employees.map((e) => `<option value="${escapeHtml(e.id)}">${escapeHtml(`${e.name} ${e.lastname}`.trim())}</option>`).join("");
    } else if (source === "accounting") {
      entitySelect.innerHTML = state.accounting.map((a) => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.company_name || "")}</option>`).join("");
    } else {
      entitySelect.innerHTML = "";
    }
    if (prev && entitySelect.querySelector(`option[value="${CSS.escape(prev)}"]`)) entitySelect.value = prev;
  });
}

// --- Document picker ---

export function renderDocumentPicker() {
  const container = $("#documentCategoryList");
  if (!container) return;
  const query = ($("#documentSearch")?.value || "").trim().toLowerCase();
  const draftCountByType = {};
  state.drafts.forEach((d) => { draftCountByType[d.type] = (draftCountByType[d.type] || 0) + 1; });
  const categoriesHtml = documentCategories.map((category) => {
    const matchingTypes = category.types.filter((type) => {
      if (!query) return true;
      return `${category.title} ${documentTypeLabels[type] || type}`.toLowerCase().includes(query);
    });
    if (!matchingTypes.length) return "";
    return `
      <div class="doc-category">
        <h3 class="doc-category-title">${escapeHtml(category.title)}</h3>
        <div class="doc-type-grid">
          ${matchingTypes.map((type) => {
            const count = draftCountByType[type] || 0;
            const badge = count ? `<span class="doc-type-badge">${count} nacrt${count === 1 ? "" : "a"}</span>` : "";
            return `<button class="doc-type-card" data-doc-type="${escapeHtml(type)}" type="button">
              <span class="doc-type-name">${escapeHtml(documentTypeLabels[type] || type)}</span>${badge}
              <span class="doc-type-updated">Ažurirano: ${escapeHtml(formatDate(getTemplateLastUpdated(type)))}</span>
            </button>`;
          }).join("")}
        </div>
      </div>
    `;
  }).filter(Boolean).join("");
  container.innerHTML = categoriesHtml || `<p class="drafts-empty">Nema predložaka koji odgovaraju pretrazi „${escapeHtml(query)}”.</p>`;
  $$("[data-doc-type]").forEach((btn) => {
    btn.addEventListener("click", () => showDocumentForm(btn.dataset.docType));
  });
}

// --- Draft loading support ---

export function fillFormFromObject(form, data) {
  Array.from(form.elements).forEach((el) => {
    if (el.type === "checkbox") el.checked = false;
  });
  Object.entries(data).forEach(([key, value]) => {
    const el = form.elements[key];
    if (!el || el.name === "type") return;
    if (el.type === "checkbox") {
      el.checked = value === "on";
    } else if (!Array.isArray(value)) {
      el.value = value ?? "";
    }
  });
  ["endJob", "startJob", "contractStart"].forEach(updatePairedCheckboxes);
  updateTrailNumbers();
  updateWorkType();
  updateWorkingShift();
  updateContractTermination();
  updateServicesDurationUi();
  updateStandardAnnexUi();
  updateTemplateDocumentFields();
  updateEmploymentDocumentFields(data.type || "full_time");
}

// --- Bindings ---

export function bindDocumentForm() {
  $("#documentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) return;
    await downloadPrintableHtml(buildDocument());
  });
  $("#documentForm").addEventListener("input", clearFieldInvalid);
  $("#documentForm").addEventListener("change", clearFieldInvalid);
  $("#downloadDocumentButton").addEventListener("click", (event) => withBusyButton(event.currentTarget, async () => {
    if (!validateForm($("#documentForm"))) return;
    await downloadPrintableHtml(buildDocument());
  }));
  $("#downloadBlankDocumentButton").addEventListener("click", (event) => withBusyButton(event.currentTarget, async () => {
    await downloadPrintableHtml(buildBlankDocumentFromForm($("#documentForm"), $("#documentForm h2").textContent, $("#contractType").value));
  }));
  $("#previewButton").addEventListener("click", () => {
    $("#documentPreview").innerHTML = buildDocument().html;
  });
  $("#resetContractButton").addEventListener("click", resetContractForm);
  $("#saveDraftButton").addEventListener("click", saveDraft);
  $("#backToPickerButton").addEventListener("click", () => {
    showView("documents");
  });
  $("#contractType").addEventListener("change", updateContractUi);
  $("#documentEmployer").addEventListener("change", () => {
    populateDocumentEmployeeSelect("documentEmployee", $("#documentEmployer").value);
    updateDocumentDisplayFields();
  });
  $("#documentEmployee").addEventListener("change", updateDocumentDisplayFields);
  $("#a1Employer").addEventListener("change", () => {
    populateDocumentEmployeeSelect("a1Employee", $("#a1Employer").value);
    updateDocumentDisplayFields();
  });
  $("#a1Employee").addEventListener("change", updateDocumentDisplayFields);
  $("#ervEmployer").addEventListener("change", () => {
    populateDocumentEmployeeSelect("ervEmployee", $("#ervEmployer").value);
    updateDocumentDisplayFields();
  });
  $("#ervEmployee").addEventListener("change", updateDocumentDisplayFields);
  $("#trailOption").addEventListener("change", updateTrailNumbers);
  $("#workType").addEventListener("change", updateWorkType);
  $("#workingShift").addEventListener("change", updateWorkingShift);
  $("#contractTermination").addEventListener("change", updateContractTermination);
  $("#annexNewContractType").addEventListener("change", updateStandardAnnexUi);
  $("#ervYearSelect").addEventListener("change", updateErvNonWorkingDays);
  $("#ervMonthSelect").addEventListener("change", updateErvNonWorkingDays);
  $("#servicesClient").addEventListener("change", updateDocumentDisplayFields);
  $("#servicesAccounting").addEventListener("change", updateDocumentDisplayFields);
  $("#servicesDurationType").addEventListener("change", updateServicesDurationUi);
  ["#paSource", "#pbSource"].forEach((id) => {
    $(id)?.addEventListener("change", () => {
      renderPartyEntitySelects();
      updatePartyPickerVisibility();
      updateDocumentDisplayFields();
    });
  });
  $$(".paired-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => updatePairedCheckboxes(checkbox.dataset.pair));
  });
  $("#documentSearch")?.addEventListener("input", renderDocumentPicker);
}

