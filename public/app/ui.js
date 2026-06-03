import {
  $, $$, state, views, documentTypeLabels, documentCategories,
  numbers1To30, numbers1To12, vacationOptions, courtOptions,
  monthNamesHr, ervColumnDescriptions, ervColumns,
  employmentDocumentDefinitions, employmentDocumentFieldSets, templateDocumentFieldSets,
  partySourceOptions, sourceLabels
} from "./constants.js";
import {
  escapeHtml, toast, formatDate, normalizeCroatianDate, normalizeTime24,
  normalizeMoney, normalizePercent, syncDatePickerFromDisplay, numberOptions,
  formToObject, objectToForm, formatAddress, createId, clamp,
  croatianNonWorkingDays, titleCaseDocument
} from "./utils.js";
import { loadData, persist, writeSessionData, writeDrafts, importJsonData } from "./storage.js";
import { buildDocument, buildGfiDocument, buildBlankDocumentFromForm } from "./documents.js";
import { downloadPrintableHtml } from "./print.js";

// --- Initialization ---

export async function init() {
  hydrateContractControls();
  enhanceCroatianDatePickers();
  enhanceCroatianTimePickers();
  setDefaultDates();
  bindNavigation();
  bindForms();
  bindActions();
  await loadData();
  render();
}

// --- Navigation ---

function bindNavigation() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.view === "documents" && state.currentView === "documents") {
        showDocumentPicker();
      } else {
        showView(button.dataset.view);
      }
    });
  });
}

function showView(name) {
  state.currentView = name;
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${name}View`).classList.add("active");
  $("#viewTitle").textContent = views[name][0];
  $("#viewSubtitle").textContent = views[name][1];
  if (name === "documents") showDocumentPicker();
}

function showDocumentPicker() {
  $("#documentsPickerView")?.classList.remove("hidden");
  $("#documentsFormView")?.classList.add("hidden");
  renderDocumentPicker();
}

function showDocumentForm(type) {
  $("#documentsPickerView")?.classList.add("hidden");
  $("#documentsFormView")?.classList.remove("hidden");
  $("#contractType").value = type;
  updateContractUi();
  updatePartySourceOptions(type);
  renderSelects();
  renderCurrentTypeDrafts(type);
}

// --- Form bindings ---

function bindForms() {
  $("#employerForm").addEventListener("submit", saveEmployer);
  $("#accountingForm").addEventListener("submit", saveAccounting);
  $("#employeeForm").addEventListener("submit", saveEmployee);
  $("#documentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await downloadPrintableHtml(buildDocument());
  });
  $("#gfiForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await downloadPrintableHtml(buildGfiDocument());
  });
  $("#downloadDocumentButton").addEventListener("click", async () => {
    await downloadPrintableHtml(buildDocument());
  });
  $("#downloadBlankDocumentButton").addEventListener("click", async () => {
    await downloadPrintableHtml(buildBlankDocumentFromForm($("#documentForm"), $("#documentForm h2").textContent, $("#contractType").value));
  });
  $("#downloadGfiButton").addEventListener("click", async () => {
    await downloadPrintableHtml(buildGfiDocument());
  });
  $("#downloadBlankGfiButton").addEventListener("click", async () => {
    await downloadPrintableHtml(buildBlankDocumentFromForm($("#gfiForm"), "GFI ODLUKA / IZVJEŠTAJ", "gfi"));
  });
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
  $$(".money-input").forEach((input) => input.addEventListener("blur", () => { input.value = normalizeMoney(input.value); }));
  $$(".percent-input").forEach((input) => input.addEventListener("blur", () => { input.value = normalizePercent(input.value, Number(input.dataset.minimum)); }));
  $$(".date-hr-input").forEach((input) => {
    input.addEventListener("blur", () => {
      input.value = normalizeCroatianDate(input.value);
      syncDatePickerFromDisplay(input);
    });
  });
  $("#employerSearch").addEventListener("input", renderEmployers);
  $("#accountingSearch").addEventListener("input", renderAccounting);
  $("#employeeSearch").addEventListener("input", renderEmployees);
  $$("[data-reset-form]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = document.getElementById(button.dataset.resetForm);
      form.reset();
      form.elements.id.value = "";
      renderSelects();
    });
  });
}

// --- Action bindings ---

function bindActions() {
  $("#refreshButton").addEventListener("click", async () => {
    await loadData(true);
    render();
    toast("Podaci sesije su osvježeni.");
  });
  $("#nacrtiSearch")?.addEventListener("input", renderDrafts);
  $("#importButton").addEventListener("click", () => $("#importFile").click());
  $("#importFile").addEventListener("change", (event) => importJsonData(event, () => render()));
  $("#exportButton").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({
      employers: state.employers,
      accounting: state.accounting,
      employees: state.employees,
      drafts: state.drafts
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `knjigovodstveni-asistent-izvoz-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

// --- Date / time pickers ---

function enhanceCroatianDatePickers() {
  $$(".date-hr-input").forEach((displayInput) => {
    if (displayInput.dataset.enhanced === "true") return;
    displayInput.dataset.enhanced = "true";
    displayInput.readOnly = true;
    displayInput.classList.add("date-picker-display");

    const picker = document.createElement("input");
    picker.type = "date";
    picker.className = "native-date-picker";
    picker.tabIndex = -1;
    picker.setAttribute("aria-hidden", "true");
    displayInput.insertAdjacentElement("afterend", picker);

    const openPicker = () => {
      syncDatePickerFromDisplay(displayInput);
      if (typeof picker.showPicker === "function") picker.showPicker();
      else picker.click();
    };

    displayInput.addEventListener("click", openPicker);
    displayInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPicker(); }
    });
    picker.addEventListener("change", () => {
      if (picker.value) displayInput.value = formatDate(picker.value);
    });
  });
}

function enhanceCroatianTimePickers() {
  $$(".time-hr-input").forEach((displayInput) => {
    if (displayInput.dataset.enhanced === "true") return;
    displayInput.dataset.enhanced = "true";
    displayInput.readOnly = true;
    displayInput.classList.add("time-picker-display");

    const picker = document.createElement("input");
    picker.type = "time";
    picker.className = "native-time-picker";
    picker.step = "60";
    picker.tabIndex = -1;
    picker.setAttribute("aria-hidden", "true");
    displayInput.insertAdjacentElement("afterend", picker);

    const openPicker = () => {
      picker.value = normalizeTime24(displayInput.value);
      if (typeof picker.showPicker === "function") picker.showPicker();
      else picker.click();
    };

    displayInput.addEventListener("click", openPicker);
    displayInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPicker(); }
    });
    picker.addEventListener("change", () => {
      if (picker.value) displayInput.value = normalizeTime24(picker.value);
    });
  });
}

// --- Contract control hydration ---

function hydrateContractControls() {
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

function hydrateErvControls() {
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

function resetContractForm() {
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

function updateContractUi() {
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

function updateStandardAnnexUi() {
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

function updateTrailNumbers() {
  const selected = $("#trailOption").value === "mjesec/a/i" ? numbers1To12 : numbers1To30;
  $("#trailNumbers").innerHTML = selected.map((value) => `<option>${value}</option>`).join("");
}

function updateWorkType() {
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

function updateWorkingShift() {
  const value = $("#workingShift").value;
  const usesTime = value === "jednokratno" || value === "klizno";
  $$(".shift-time-field").forEach((element) => element.classList.toggle("hidden", !usesTime));
  $$(".shift-description-field").forEach((element) => element.classList.toggle("hidden", usesTime));
}

function updateContractTermination() {
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

function updateServicesDurationUi() {
  const isFixedTerm = $("#servicesDurationType").value === "određeno vrijeme";
  $$(".services-duration-end").forEach((element) => element.classList.toggle("hidden", !isFixedTerm));
  const endDate = $("#documentForm").elements.services_end_date;
  if (endDate) endDate.disabled = !isFixedTerm;
}

function updatePairedCheckboxes(pair) {
  const boxes = $$(`.paired-checkbox[data-pair="${pair}"]`);
  if (!boxes.length) return;
  if (!boxes.some((box) => box.checked)) boxes[0].checked = true;
  boxes.forEach((box) => {
    const target = $("#documentForm").elements[box.dataset.target];
    if (target) target.disabled = !box.checked;
  });
}

function updateErvNonWorkingDays() {
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

function updatePartySourceOptions(type) {
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

function setDefaultDates() {
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

// --- Data operations (entity save/remove) ---

async function saveEmployer(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const employer = formToObject(form);
  employer.id = employer.id || createId("employer", employer.company_name);
  await persist("employers", employer);
  form.reset();
  render();
  toast("Poslodavac je spremljen.");
}

async function saveAccounting(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const office = formToObject(form);
  office.id = office.id || createId("accounting", office.company_name);
  await persist("accounting", office);
  form.reset();
  render();
  toast("Knjigovodstveni ured je spremljen.");
}

async function saveEmployee(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const employee = formToObject(form);
  employee.employer_names = Array.from(form.elements.employer_names.selectedOptions).map((option) => option.value);
  employee.id = employee.id || createId("employee", `${employee.name}-${employee.lastname}-${employee.personal_id}`);
  await persist("employees", employee);
  form.reset();
  render();
  toast("Radnik je spremljen.");
}

async function removeRecord(resource, id) {
  if (!confirm("Izbrisati zapis?")) return;
  if (!state[resource]) return;
  state[resource] = state[resource].filter((item) => item.id !== id);
  writeSessionData();
  render();
  toast("Zapis je izbrisan.");
}

// --- Edit helpers ---

function editEmployer(id) {
  const employer = state.employers.find((item) => item.id === id);
  if (!employer) return;
  objectToForm($("#employerForm"), employer);
  showView("employers");
}

function editAccounting(id) {
  const office = state.accounting.find((item) => item.id === id);
  if (!office) return;
  objectToForm($("#accountingForm"), office);
  showView("accounting");
}

function editEmployee(id) {
  const employee = state.employees.find((item) => item.id === id);
  if (!employee) return;
  objectToForm($("#employeeForm"), employee);
  Array.from($("#employeeEmployers").options).forEach((option) => {
    option.selected = employee.employer_names.includes(option.value);
  });
  showView("employees");
}

// --- Rendering ---

function render() {
  $("#employerCount").textContent = state.employers.length;
  $("#accountingCount").textContent = state.accounting.length;
  $("#employeeCount").textContent = state.employees.length;
  renderEmployers();
  renderAccounting();
  renderEmployees();
  renderSelects();
  renderDrafts();
  $("#documentPreview").innerHTML = buildDocument().html;
}

function renderEmployers() {
  const query = $("#employerSearch").value.trim().toLowerCase();
  const rows = state.employers
    .filter((employer) => [employer.company_name, employer.city, employer.vat].join(" ").toLowerCase().includes(query))
    .map((employer) => `
      <tr>
        <td><strong>${escapeHtml(employer.company_name)}</strong><br><small>${escapeHtml(formatAddress(employer))}</small></td>
        <td>${escapeHtml(employer.city)}</td>
        <td>${escapeHtml(employer.vat)}</td>
        <td>
          <div class="row-actions">
            <button class="ghost-button" data-edit-employer="${escapeHtml(employer.id)}" type="button">Uredi</button>
            <button class="danger-button" data-delete-employer="${escapeHtml(employer.id)}" type="button">Izbriši</button>
          </div>
        </td>
      </tr>
    `).join("");
  $("#employerRows").innerHTML = rows || `<tr><td colspan="4">Nema zapisa.</td></tr>`;
  $$("[data-edit-employer]").forEach((button) => button.addEventListener("click", () => editEmployer(button.dataset.editEmployer)));
  $$("[data-delete-employer]").forEach((button) => button.addEventListener("click", () => removeRecord("employers", button.dataset.deleteEmployer)));
}

function renderAccounting() {
  const query = $("#accountingSearch").value.trim().toLowerCase();
  const rows = state.accounting
    .filter((office) => [office.company_name, office.city, office.vat, office.email].join(" ").toLowerCase().includes(query))
    .map((office) => `
      <tr>
        <td><strong>${escapeHtml(office.company_name)}</strong><br><small>${escapeHtml(formatAddress(office))}</small></td>
        <td>${escapeHtml(office.city)}</td>
        <td>${escapeHtml(office.vat)}</td>
        <td>
          <div class="row-actions">
            <button class="ghost-button" data-edit-accounting="${escapeHtml(office.id)}" type="button">Uredi</button>
            <button class="danger-button" data-delete-accounting="${escapeHtml(office.id)}" type="button">Izbriši</button>
          </div>
        </td>
      </tr>
    `).join("");
  $("#accountingRows").innerHTML = rows || `<tr><td colspan="4">Nema zapisa.</td></tr>`;
  $$("[data-edit-accounting]").forEach((button) => button.addEventListener("click", () => editAccounting(button.dataset.editAccounting)));
  $$("[data-delete-accounting]").forEach((button) => button.addEventListener("click", () => removeRecord("accounting", button.dataset.deleteAccounting)));
}

function renderEmployees() {
  const query = $("#employeeSearch").value.trim().toLowerCase();
  const rows = state.employees
    .filter((employee) => [employee.name, employee.lastname, employee.personal_id, employee.employer_names.join(" ")].join(" ").toLowerCase().includes(query))
    .map((employee) => `
      <tr>
        <td><strong>${escapeHtml(employee.name)} ${escapeHtml(employee.lastname)}</strong><br><small>${escapeHtml(formatAddress(employee))}</small></td>
        <td>${escapeHtml(employee.personal_id)}</td>
        <td>${escapeHtml(employee.employer_names.join(", "))}</td>
        <td>
          <div class="row-actions">
            <button class="ghost-button" data-edit-employee="${escapeHtml(employee.id)}" type="button">Uredi</button>
            <button class="danger-button" data-delete-employee="${escapeHtml(employee.id)}" type="button">Izbriši</button>
          </div>
        </td>
      </tr>
    `).join("");
  $("#employeeRows").innerHTML = rows || `<tr><td colspan="4">Nema zapisa.</td></tr>`;
  $$("[data-edit-employee]").forEach((button) => button.addEventListener("click", () => editEmployee(button.dataset.editEmployee)));
  $$("[data-delete-employee]").forEach((button) => button.addEventListener("click", () => removeRecord("employees", button.dataset.deleteEmployee)));
}

function renderSelects() {
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

function populateDocumentEmployeeSelect(selectId, employerId) {
  const employer = state.employers.find((item) => item.id === employerId);
  const employees = employer
    ? state.employees.filter((employee) => employee.employer_names.includes(employer.company_name))
    : state.employees;
  const fallback = employees.length ? employees : state.employees;
  $(`#${selectId}`).innerHTML = fallback.map((employee) => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name)} ${escapeHtml(employee.lastname)}</option>`).join("");
}

function updateDocumentDisplayFields() {
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

function renderDocumentPicker() {
  const container = $("#documentCategoryList");
  if (!container) return;
  const draftCountByType = {};
  state.drafts.forEach((d) => { draftCountByType[d.type] = (draftCountByType[d.type] || 0) + 1; });
  container.innerHTML = documentCategories.map((category) => `
    <div class="doc-category">
      <h3 class="doc-category-title">${escapeHtml(category.title)}</h3>
      <div class="doc-type-grid">
        ${category.types.map((type) => {
          const count = draftCountByType[type] || 0;
          const badge = count ? `<span class="doc-type-badge">${count} nacrt${count === 1 ? "" : "a"}</span>` : "";
          return `<button class="doc-type-card" data-doc-type="${escapeHtml(type)}" type="button">
            <span class="doc-type-name">${escapeHtml(documentTypeLabels[type] || type)}</span>${badge}
          </button>`;
        }).join("")}
      </div>
    </div>
  `).join("");
  $$("[data-doc-type]").forEach((btn) => {
    btn.addEventListener("click", () => showDocumentForm(btn.dataset.docType));
  });
}

function renderCurrentTypeDrafts(type) {
  const container = $("#currentTypeDraftsList");
  const panel = $("#currentTypeDraftsPanel");
  if (!container || !panel) return;
  const matching = state.drafts.filter((d) => d.type === type);
  if (!matching.length) { panel.classList.add("hidden"); return; }
  panel.classList.remove("hidden");
  container.innerHTML = matching.map((draft) => `
    <div class="draft-row">
      <div class="draft-info">
        <strong class="draft-name">${escapeHtml(draft.name)}</strong>
        <small class="draft-meta">${escapeHtml(new Date(draft.savedAt).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" }))}</small>
      </div>
      <div class="draft-actions">
        <button class="ghost-button" data-load-draft="${escapeHtml(draft.id)}" type="button">Učitaj</button>
        <button class="ghost-button" data-rename-draft="${escapeHtml(draft.id)}" type="button">Preimenuj</button>
        <button class="danger-button" data-delete-draft="${escapeHtml(draft.id)}" type="button">Izbriši</button>
      </div>
    </div>
  `).join("");
  container.querySelectorAll("[data-load-draft]").forEach((btn) => btn.addEventListener("click", () => loadDraft(btn.dataset.loadDraft)));
  container.querySelectorAll("[data-rename-draft]").forEach((btn) => btn.addEventListener("click", () => renameDraft(btn.dataset.renameDraft)));
  container.querySelectorAll("[data-delete-draft]").forEach((btn) => btn.addEventListener("click", () => deleteDraft(btn.dataset.deleteDraft)));
}

// --- Draft management ---

function saveDraft() {
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
  const autoName = partyParts.length ? `${docTypeLabel} – ${partyParts.join(", ")}` : docTypeLabel;
  const draft = {
    id: createId("draft", `${type}-${Date.now()}`),
    name: autoName,
    type,
    formData: data,
    savedAt: new Date().toISOString()
  };
  state.drafts.unshift(draft);
  writeDrafts();
  renderDrafts();
  renderCurrentTypeDrafts(type);
  toast("Nacrt je spremljen.");
}

function loadDraft(id) {
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

function renameDraft(id) {
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

function deleteDraft(id) {
  if (!window.confirm("Izbrisati nacrt?")) return;
  const type = state.drafts.find((d) => d.id === id)?.type;
  state.drafts = state.drafts.filter((d) => d.id !== id);
  writeDrafts();
  renderDrafts();
  if (type) renderCurrentTypeDrafts(type);
  toast("Nacrt je izbrisan.");
}

function renderDrafts() {
  const countEl = $("#draftCount");
  if (countEl) countEl.textContent = state.drafts.length;
  renderDocumentPicker();
  const list = $("#nacrtiList");
  if (!list) return;
  const query = ($("#nacrtiSearch")?.value || "").trim().toLowerCase();
  const filtered = query
    ? state.drafts.filter((d) => `${d.name} ${documentTypeLabels[d.type] || d.type}`.toLowerCase().includes(query))
    : state.drafts;
  if (!filtered.length) {
    list.innerHTML = `<p class="drafts-empty">${query ? "Nema nacrta koji odgovaraju pretrazi." : "Nema spremljenih nacrta. Otvorite dokument i kliknite <strong>Spremi nacrt</strong>."}</p>`;
    return;
  }
  list.innerHTML = filtered.map((draft) => `
    <div class="draft-row">
      <div class="draft-info">
        <strong class="draft-name">${escapeHtml(draft.name)}</strong>
        <small class="draft-meta">${escapeHtml(documentTypeLabels[draft.type] || draft.type)} · ${escapeHtml(new Date(draft.savedAt).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" }))}</small>
      </div>
      <div class="draft-actions">
        <button class="ghost-button" data-load-draft="${escapeHtml(draft.id)}" type="button">Učitaj</button>
        <button class="ghost-button" data-rename-draft="${escapeHtml(draft.id)}" type="button">Preimenuj</button>
        <button class="danger-button" data-delete-draft="${escapeHtml(draft.id)}" type="button">Izbriši</button>
      </div>
    </div>
  `).join("");
  list.querySelectorAll("[data-load-draft]").forEach((btn) => btn.addEventListener("click", () => loadDraft(btn.dataset.loadDraft)));
  list.querySelectorAll("[data-rename-draft]").forEach((btn) => btn.addEventListener("click", () => renameDraft(btn.dataset.renameDraft)));
  list.querySelectorAll("[data-delete-draft]").forEach((btn) => btn.addEventListener("click", () => deleteDraft(btn.dataset.deleteDraft)));
}

// --- Form fill from draft ---

function fillFormFromObject(form, data) {
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
