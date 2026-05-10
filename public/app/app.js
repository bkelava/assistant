const emptySessionData = {
  employers: [],
  accounting: [],
  employees: []
};

const state = {
  employers: [],
  accounting: [],
  employees: [],
  currentView: "dashboard"
};

const sessionDataKey = "contract-office-session-data-v2";

const numbers1To30 = Array.from({ length: 31 }, (_, index) => String(index + 1));
const numbers1To12 = Array.from({ length: 12 }, (_, index) => String(index + 1));
const vacationOptions = [
  "-", "1 dan", "2 dana", "3 dana", "4 dana", "5 dana", "6 dana", "8 dana", "9 dana",
  "10 dana", "11 dana", "12 dana", "13 dana", "1 tjedan", "2 tjedna", "3 tjedna",
  "4 tjedna", "5 tjedana", "6 tjedana"
];
const courtOptions = [
  "Bjelovaru", "Dubrovniku", "Karlovcu", "Osijeku", "Puli", "Rijeci", "Sisku",
  "Slavonskom Brodu", "Splitu", "Šibeniku", "Varaždinu", "Velikoj Gorici",
  "Vukovaru", "Zadru", "Zagrebu"
];
const monthNamesHr = [
  "siječanj", "veljača", "ožujak", "travanj", "svibanj", "lipanj",
  "srpanj", "kolovoz", "rujan", "listopad", "studeni", "prosinac"
];
const dayNamesHr = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
const ervColumns = ["Datum", "Dut", "Dol", "Odl", "Uks", "RR", "B-DP", "GO", "BOL-PO", "BOL-HZZO", "P", "SP", "PD", "SR", "DR", "RuK", "RnD"];
const ervColumnDescriptions = {
  Dut: "Dan u tjednu",
  Dol: "Dolazak sati",
  Odl: "Odlazak sati",
  Uks: "Ukupno sati",
  RR: "Redovni rad",
  "B-DP": "Blagdan, državni praznik",
  GO: "Godišnji odmor",
  "BOL-PO": "Bolovanje na teret poslodavca",
  "BOL-HZZO": "Bolovanje na teret HZZO-a",
  P: "Prekovremeni rad",
  SP: "Službeni put",
  PD: "Plaćeni dopust",
  SR: "Smjenski rad",
  DR: "Dvokratni rad",
  RuK: "Rad u kombinaciji",
  RnD: "Rad na daljinu"
};

const labels = {
  full_time: {
    title: "UGOVOR O RADU NA NEODREĐENO VRIJEME",
    l1: "Između", l2: "kojeg zastupa", l3: "(dalje: Poslodavac) i", l4: "(dalje: Radnik) dana", l5: "sklopljen je",
    s1: "I. Opće odredbe",
    p1: "1. Ovim se Ugovorom utvrđuju međusobna prava, obveze i odgovornosti na radu između Poslodavca i Radnika.",
    p2: "2. Ovim Ugovorom Radnik zasniva radni odnos na neodređeno vrijeme za obavljanje poslova",
    p3: "3. Ugovorne stranke ugovaraju probni rad Radnika u trajanju od",
    p4: "4. Mjesto rada Radnika je u",
    p4b: ", a u slučaju potrebe Poslodavca i u nekom drugom mjestu na području Republike Hrvatske.",
    p5: "5. Pored poslova navedenih u točki 2. ovog Ugovora, Radnik će obavljati i druge poslove prema nalogu Poslodavca, a koji su u skladu naravi i vrsti posla za koje je zasnovan radni odnos.",
    p6: "6. Radnik počinje s radom",
    salaryCopies: "4 jednaka primjerka od kojih Poslodavac zadržava tri, a Radnik jedan primjerak."
  },
  part_time: {
    title: "UGOVOR O RADU NA ODREĐENO VRIJEME",
    l1: "Između", l2: "kojeg zastupa", l3: "(dalje: Poslodavac) i", l4: "(dalje: Radnik) dana", l5: "sklopljen je",
    s1: "I. Opće odredbe",
    p1: "1. Ovim se Ugovorom utvrđuju međusobna prava, obveze i odgovornosti na radu između Poslodavca i Radnika.",
    p2: "2. Ovim Ugovorom Radnik zasniva radni odnos na određeno vrijeme do",
    p2b: "za obavljanje poslova",
    p3: "3. Ugovorne stranke ugovaraju probni rad Radnika u trajanju od",
    p4: "4. Mjesto rada Radnika je u",
    p4b: ", a u slučaju potrebe Poslodavca i u nekom drugom mjestu na području Republike Hrvatske.",
    p5: "5. Pored poslova navedenih u točki 2. ovog Ugovora, Radnik će obavljati i druge poslove prema nalogu Poslodavca, a koji su u skladu naravi i vrsti posla za koje je zasnovan radni odnos.",
    p6: "6. Radnik počinje s radom",
    salaryCopies: "3 jednaka primjerka od kojih Poslodavac zadržava dva, a Radnik jedan primjerak."
  }
};

const employmentDocumentDefinitions = {
  confirmation_indefinite: {
    title: "POTVRDA O SKLOPLJENOM UGOVORU O RADU NA NEODREĐENO VRIJEME",
    category: "confirmation"
  },
  mutual_termination: {
    title: "SPORAZUM O PRESTANKU UGOVORA O RADU",
    category: "mutual"
  },
  probation_unsatisfactory: {
    title: "OTKAZ ZBOG NEZADOVOLJAVANJA RADNIKA NA PROBNOM RADU",
    category: "probation"
  },
  work_obligation_warning: {
    title: "UPOZORENJE NA OBVEZE IZ RADNOG ODNOSA",
    category: "warning"
  },
  misconduct_notice: {
    title: "REDOVITI OTKAZ UGOVORA O RADU ZBOG SKRIVLJENOG PONAŠANJA",
    category: "misconduct"
  },
  personal_notice: {
    title: "REDOVITI OSOBNO UVJETOVANI OTKAZ UGOVORA O RADU",
    category: "personal"
  },
  business_economic_notice: {
    title: "REDOVITI POSLOVNO UVJETOVANI OTKAZ ZBOG GOSPODARSKIH RAZLOGA",
    category: "business",
    businessReason: "gospodarskih razloga"
  },
  business_organizational_notice: {
    title: "REDOVITI POSLOVNO UVJETOVANI OTKAZ ZBOG ORGANIZACIJSKIH RAZLOGA",
    category: "business",
    businessReason: "organizacijskih razloga"
  },
  business_technological_notice: {
    title: "REDOVITI POSLOVNO UVJETOVANI OTKAZ ZBOG TEHNOLOŠKIH RAZLOGA",
    category: "business",
    businessReason: "tehnoloških razloga"
  },
  changed_contract_offer: {
    title: "OTKAZ S PONUDOM IZMIJENJENOG UGOVORA",
    category: "changed"
  },
  employee_regular_notice: {
    title: "REDOVITI OTKAZ ZAPOSLENIKA",
    category: "employee_regular"
  },
  employer_extraordinary_notice: {
    title: "IZVANREDNI OTKAZ UGOVORA O RADU OD STRANE POSLODAVCA",
    category: "employer_extraordinary"
  },
  employee_extraordinary_notice: {
    title: "IZVANREDNI OTKAZ ZAPOSLENIKA",
    category: "employee_extraordinary"
  },
  fixed_term_expiry_notice: {
    title: "OBAVIJEST O PRESTANKU UGOVORA O RADU NA ODREĐENO VRIJEME",
    category: "fixed_expiry"
  },
  retirement_65_15_notice: {
    title: "OBAVIJEST O PRESTANKU UGOVORA O RADU RADI 65 GODINA ŽIVOTA I 15 GODINA MIROVINSKOG STAŽA",
    category: "retirement"
  },
  housing_statement: {
    title: "IZJAVA O STANOVANJU",
    category: "housing"
  }
};

const views = {
  dashboard: ["Pregled", "Uredi podatke i generiraj dokumente u pregledniku."],
  employers: ["Poslodavci", "Dodaj, uredi i izbriši poslodavce."],
  accounting: ["Knjigovodstvo", "Dodaj knjigovodstvene urede za ugovore o uslugama."],
  employees: ["Radnici", "Dodaj radnike i povezi ih s poslodavcima."],
  documents: ["Generiranje dokumenata", "Generiraj ugovore, anekse i evidenciju radnog vremena."],
  gfi: ["GFI", "Pripremi osnovnu odluku i izvještaj za GFI."]
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

init();

async function init() {
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

function bindNavigation() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });
}

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
  $("#downloadGfiButton").addEventListener("click", async () => {
    await downloadPrintableHtml(buildGfiDocument());
  });
  $("#previewButton").addEventListener("click", () => {
    $("#documentPreview").innerHTML = buildDocument().html;
  });
  $("#resetContractButton").addEventListener("click", resetContractForm);
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
  $("#ervYearSelect").addEventListener("change", updateErvNonWorkingDays);
  $("#ervMonthSelect").addEventListener("change", updateErvNonWorkingDays);
  $("#servicesClient").addEventListener("change", updateDocumentDisplayFields);
  $("#servicesAccounting").addEventListener("change", updateDocumentDisplayFields);
  $("#servicesDurationType").addEventListener("change", updateServicesDurationUi);
  $$(".paired-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => updatePairedCheckboxes(checkbox.dataset.pair));
  });
  $$(".money-input").forEach((input) => input.addEventListener("blur", () => input.value = normalizeMoney(input.value)));
  $$(".percent-input").forEach((input) => input.addEventListener("blur", () => input.value = normalizePercent(input.value, Number(input.dataset.minimum))));
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

function bindActions() {
  $("#refreshButton").addEventListener("click", async () => {
    await loadData(true);
    render();
    toast("Podaci sesije su osvježeni.");
  });
  $("#importButton").addEventListener("click", () => $("#importFile").click());
  $("#importFile").addEventListener("change", importJsonData);
  $("#exportButton").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ employers: state.employers, accounting: state.accounting, employees: state.employees }, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `knjigovodstveni-asistent-izvoz-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

async function importJsonData(event) {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const parsed = JSON.parse(await file.text());
    const employers = Array.isArray(parsed.employers) ? parsed.employers : [];
    const accounting = Array.isArray(parsed.accounting) ? parsed.accounting : [];
    const employees = Array.isArray(parsed.employees) ? parsed.employees : [];

    state.employers = employers.map((employer, index) => ({
      id: employer.id || createId("employer", employer.company_name || `poslodavac-${index + 1}`),
      company_name: employer.company_name || "",
      street: employer.street || "",
      city: employer.city || "",
      postal: employer.postal || "",
      vat: employer.vat || "",
      director: employer.director || ""
    }));
    state.accounting = accounting.map((office, index) => ({
      id: office.id || createId("accounting", office.company_name || `knjigovodstvo-${index + 1}`),
      company_name: office.company_name || "",
      street: office.street || "",
      city: office.city || "",
      postal: office.postal || "",
      vat: office.vat || "",
      director: office.director || "",
      email: office.email || ""
    }));
    state.employees = employees.map((employee, index) => ({
      id: employee.id || createId("employee", `${employee.name || "radnik"}-${employee.lastname || index + 1}`),
      name: employee.name || "",
      lastname: employee.lastname || "",
      street: employee.street || "",
      city: employee.city || "",
      postal: employee.postal || "",
      personal_id: employee.personal_id || "",
      employer_names: Array.isArray(employee.employer_names) ? employee.employer_names : []
    }));

    writeSessionData();
    render();
    toast("JSON podaci su uvezeni u ovu sesiju.");
  } catch {
    toast("Uvoz nije uspio. Provjerite JSON datoteku.");
  } finally {
    input.value = "";
  }
}

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
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
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
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
    });

    picker.addEventListener("change", () => {
      if (picker.value) displayInput.value = normalizeTime24(picker.value);
    });
  });
}

function hydrateContractControls() {
  $("#trailNumbers").innerHTML = numbers1To30.map((value) => `<option>${value}</option>`).join("");
  $("#trailNumbers").value = "1";
  $("#vacationSelect").innerHTML = vacationOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#vacationSelect").value = "4 tjedna";
  $("#courtSelect").innerHTML = courtOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#courtSelect").value = "Zagrebu";
  $("#a1CourtSelect").innerHTML = courtOptions.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  $("#a1CourtSelect").value = "Zagrebu";
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
  const form = $("#documentForm");
  form.reset();
  hydrateContractControls();
  setDefaultDates();
  renderSelects();
  $("#documentPreview").innerHTML = buildDocument().html;
}

function updateContractUi() {
  const type = $("#contractType").value;
  const isPartTime = type === "part_time";
  const isContract = type === "full_time" || type === "part_time";
  const isAnnex = type === "annex_a1";
  const isErv = type === "erv";
  const isAccountingServices = type === "accounting_services";
  const isEmploymentDocument = Boolean(employmentDocumentDefinitions[type]);
  const titles = {
    full_time: "Ugovor o radu na neodređeno vrijeme",
    part_time: "Ugovor o radu na određeno vrijeme",
    annex_a1: "Aneks ugovora o radu za A1",
    erv: "Evidencija radnog vremena",
    accounting_services: "Ugovor o knjigovodstveno-računovodstvenim uslugama",
    ...Object.fromEntries(Object.entries(employmentDocumentDefinitions).map(([key, value]) => [key, titleCaseDocument(value.title)]))
  };
  $("#documentForm h2").textContent = titles[type] || "Dokumenti";
  $$(".contract-party-section").forEach((element) => element.classList.toggle("hidden", !(isContract || isEmploymentDocument)));
  $$(".annex-party-section").forEach((element) => element.classList.toggle("hidden", !isAnnex));
  $$(".contract-doc-section").forEach((element) => element.classList.toggle("hidden", !isContract));
  $$(".annex-doc-section").forEach((element) => element.classList.toggle("hidden", !isAnnex));
  $$(".erv-doc-section").forEach((element) => element.classList.toggle("hidden", !isErv));
  $$(".accounting-services-section").forEach((element) => element.classList.toggle("hidden", !isAccountingServices));
  $$(".employment-doc-section").forEach((element) => element.classList.toggle("hidden", !isEmploymentDocument));
  $$(".only-ptc").forEach((element) => element.classList.toggle("hidden", !isPartTime));
  $$(".full-time-intro").forEach((element) => element.classList.toggle("hidden", isPartTime));
  updateContractTermination();
  updateDocumentDisplayFields();
  updateErvNonWorkingDays();
  $("#documentPreview").innerHTML = buildDocument().html;
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

  if (!boxes.some((box) => box.checked)) {
    boxes[0].checked = true;
  }

  boxes.forEach((box) => {
    const target = $("#documentForm").elements[box.dataset.target];
    if (target) target.disabled = !box.checked;
  });
}

async function loadData() {
  const cached = readSessionData();
  state.employers = cached.employers;
  state.accounting = cached.accounting;
  state.employees = cached.employees;
  writeSessionData();
}

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

async function persist(resource, record) {
  const collection = state[resource];
  if (!collection) return;
  const existingIndex = collection.findIndex((item) => item.id === record.id);

  if (existingIndex >= 0) collection.splice(existingIndex, 1, record);
  else collection.push(record);
  writeSessionData();
}

async function removeRecord(resource, id) {
  if (!confirm("Izbrisati zapis?")) return;
  if (!state[resource]) return;
  state[resource] = state[resource].filter((item) => item.id !== id);
  writeSessionData();
  render();
  toast("Zapis je izbrisan.");
}

function render() {
  $("#employerCount").textContent = state.employers.length;
  $("#accountingCount").textContent = state.accounting.length;
  $("#employeeCount").textContent = state.employees.length;
  renderEmployers();
  renderAccounting();
  renderEmployees();
  renderSelects();
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
    `)
    .join("");
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
    `)
    .join("");
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
    `)
    .join("");
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

function showView(name) {
  state.currentView = name;
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${name}View`).classList.add("active");
  $("#viewTitle").textContent = views[name][0];
  $("#viewSubtitle").textContent = views[name][1];
}

function buildDocument() {
  const form = $("#documentForm");
  const data = formToObject(form);
  if (data.type === "accounting_services") return buildAccountingServicesDocument(data);
  if (employmentDocumentDefinitions[data.type]) return buildEmploymentDocument(data);
  const employerId = data.type === "annex_a1" ? data.a1_employer_id : data.type === "erv" ? data.erv_employer_id : data.employer_id;
  const employeeId = data.type === "annex_a1" ? data.a1_employee_id : data.type === "erv" ? data.erv_employee_id : data.employee_id;
  const employer = state.employers.find((item) => item.id === employerId) || state.employers[0] || {};
  const employee = state.employees.find((item) => item.id === employeeId) || state.employees[0] || {};
  const employeeName = `${employee.name || ""} ${employee.lastname || ""}`.trim();
  const employerInfo = `${formatAddress(employer)}${employer.vat ? `, OIB: ${employer.vat}` : ""}`;
  const context = {
    ...data,
    contract_date: formatDate(data.contract_date),
    end_job_date: data.end_job_use_date ? formatDate(data.end_job_date) : "",
    end_job_description: data.end_job_use_description ? data.end_job_description : "",
    start_date: data.start_use_date ? formatDate(data.start_date) : "",
    start_date_description: data.start_use_description ? data.start_date_description : "",
    contract_starting_with: data.contract_start_use_date ? formatDate(data.contract_starting_with) : "",
    contract_start_with_description: data.contract_start_use_description ? data.contract_start_with_description : "",
    working_time_start: normalizeTime24(data.working_time_start),
    working_time_end: normalizeTime24(data.working_time_end),
    employer,
    employee,
    employeeName,
    employerInfo,
    employeePersonalId: employee.personal_id || "",
    director: employer.director || ""
  };

  if (data.type === "annex_a1") return buildAnnexA1Exact(context);
  if (data.type === "erv") return buildErvDocument(context);
  return data.type === "part_time" ? buildPartTimeContractExact(context) : buildFullTimeContractExact(context);
}

function buildFullTimeContractExact(context) {
  const l = labels.full_time;
  return makeContractDocument(l.title, [
    p(`${l.l1} ${b(`${context.employer.company_name || ""}, ${context.employerInfo}`)}, ${l.l2} ${b(context.director)}, ${l.l3} ${b(`${context.employeeName}, OIB/Putovnica: ${context.employeePersonalId}`)} ${l.l4} ${b(context.contract_date)} ${l.l5}`),
    centerTitle(l.title),
    center(l.s1),
    p(l.p1),
    p(l.p2),
    center(b(context.job_description)),
    p(`${l.p3} ${b(`${context.trail_numbers} ${context.trail_option}`)}`),
    p(`${l.p4} ${b(context.working_place)}${l.p4b}`),
    p(l.p5),
    p(`${l.p6} ${b(joinDateOrDescription(context.start_date, context.start_date_description))}`),
    salaryAndWorkSections(context),
    center("VI. Otkaz ugovora o radu"),
    p("1. Ovaj Ugovor mogu redovito otkazati i Poslodavac i Radnik pod uvjetima propisanim zakonom."),
    p(`2. U slučaju kad Poslodavac redovito otkazuje, otkazni rok iznosi ${b(context.contract_termination_employer)} dana, a su slučaju kad redovito otokazuje Radnik, otkazni rok je ${b(context.contract_termination_employee)} dana.`),
    closingSections(context, l.salaryCopies),
    signatureHtml(context)
  ]);
}

function buildPartTimeContractExact(context) {
  const l = labels.part_time;
  return makeContractDocument(l.title, [
    p(`${l.l1} ${b(`${context.employer.company_name || ""}, ${context.employerInfo}`)}, ${l.l2} ${b(context.director)}, ${l.l3} ${b(`${context.employeeName}, OIB/Putovnica: ${context.employeePersonalId}`)} ${l.l4} ${b(context.contract_date)} ${l.l5}`),
    centerTitle(l.title),
    center(l.s1),
    p(l.p1),
    p(`${l.p2} ${b(joinDateOrDescription(context.end_job_date, context.end_job_description))} ${l.p2b}`),
    center(b(context.job_description)),
    p(`${l.p3} ${b(`${context.trail_numbers} ${context.trail_option}`)}`),
    p(`${l.p4} ${b(context.working_place)}${l.p4b}`),
    p(l.p5),
    p(`${l.p6} ${b(joinDateOrDescription(context.start_date, context.start_date_description))}.`),
    salaryAndWorkSections(context),
    center("VI. Otkaz ugovora o radu"),
    p(`1. Ovaj Ugovor ${b(context.contract_termination)} redovito otkazati i Poslodavac i Radnik pod uvjetima propisanim zakonom, i prije isteka vremena na  koji je  sklopljen.`),
    p(`2. U slučaju kad Poslodavac redovito otkazuje, otkazni rok iznosi ${b(context.contract_termination_employer)} dana, a su slučaju kad redovito otokazuje Radnik, otkazni rok je ${b(context.contract_termination_employee)} dana.`),
    closingSections(context, l.salaryCopies),
    signatureHtml(context)
  ]);
}

function buildAnnexA1Exact(context) {
  const d = formToObject($("#documentForm"));
  return makeContractDocument("ANEKS UGOVORA O RADU", [
    p(`${b(context.employer.company_name || "")} , zastupano po direktoru ${b(context.director)} (u daljnjem tekstu: Poslodavac) i`),
    p(`${b(context.employeeName)}, OIB/Putovnica: ${b(context.employeePersonalId)}, (u daljnjem tekstu: radnik), zaključili su sljedeći:`),
    centerTitle("ANEKS UGOVORA O RADU"),
    center("Članak I."),
    p("1. Ugovorne strane suglasno utvrđuju da ovim Aneksom ugovaraju prava i obveze za vrijeme trajanja rada u inozemstvu."),
    center("Članak II."),
    p(`1. Ugovorne strane suglasno utvrđuju da su dana ${b(formatDate(d.a1_contract_date))} sklopile Ugovor o radu na ${b(`${d.a1_contract_type}.`)}`),
    p(`2. Predviđeno trajanje radnika u inozemstvu biti će do ${b(formatDate(d.a1_end_date))}, odnosno do završetka projekta/radova.`),
    p("3. Nakon završetka razdoblja iz članka 2. stavak 2. poslodavac će osigurati radniku povratak u Hrvatsku."),
    center("Članak III."),
    p(`1. Mjesto rada radnika biti će  u pravilu u ${b(d.a1_working_place)}, ali je suglasan da po i sukladno te potrebama poslodavca poslove obavlja i na drugim mjestima na čitavom teritoriju Europske unije kao i da putuje u inozemstvo radi izvršavanja povjerenih mu poslova.`),
    center("Članak IV."),
    p("1. Radnik će obavljati poslove koji s obzirom na organizaciju rada, interna pravila, upute korisnika, poslovna pravila i standarde struke u skladu s naravi i vrstom posla za koje je zasnovan radni odnos, kao sve poslove koji mu je privremeno ili trajno, povjeri naručitelj ili koji mu u ime naručitelja naloži radnik naručitelja."),
    p(`2. Radnik će obavljati poslove ${b(d.a1_job_description)}, ali je dužan obavljati i sve ostale poslove koji su s obzirom na organizaciju rada, interna pravila, upute korisnika, poslovna pravila i standarde struke u skladu s naravi iv vrstom posla za koje je zasnovan radni odnos, kao sve poslove koji mu privremeno ili trajno povjeri naručitelj ili kojih mu u ime naručitelja naloži nadređeni radnik naručitelja.`),
    center("Članak V."),
    p("1. Radnik je za vrijeme trajanja rada u državi izaslanja dužan poštivati propise, običaje i okruženje države u koju je izaslan."),
    p("2. Radnik potpisom ovog aneksa potvrđujem da je upoznat s radnom, uvjetima rada, pravima i obvezama radnika u državi izaslanja."),
    center("Članak VI."),
    p("1. Radnik će raditi u punom radnom vremenu u trajanju od 40 sati tjedno, a koje je raspoređeno u pravilu od ponedjeljka do petak/subote te se prilagođava organizaciji rada na radilištu."),
    p("2.Pravo na stanku određuje se u trajanju od 30 minuta te će se korištenjem iste prilagoditi organizaciji i potrebama rada na radilištu."),
    center("Članak VII."),
    p("1. Za vrijeme trajanja rada u inozemstvu te na području gdje će radnik obavljati rad, neradni dani i blagdani su NERADNI."),
    center("Članak VIII."),
    p("1. Za obavljeni rad za vrijeme trajanja izaslanja poslodavac će isplaćivati radniku mjesečnu plaću u kunama koja se sastoji od bruto plaće sukladno Ugovoru o radu te će se mjesečna osnovica za plaćanje doprinosa uvećati za 20% i ostala primanja u novcu i naravi na koja radnik ima pravo za vrijeme rada u inozemstvu (ili minimalne stanice/plaće koja se isplaćuje sukladno zakonodavstvu države u kojoj radnik obavlja rad)."),
    center("Članak IX."),
    p("1. U slučaju da se za vrijeme trajanja ovog aneksa radnik privremeno ne obavlja rad u državi izaslanja te se vrati u RH, istom za to vrijeme pripada samo bruto plaća iz Ugovora o radu."),
    p("2. U slučaju da radnik, iz bolo kojeg razloga, trajno ne obavlja rad u državi izaslanja te se vrati u RH smatra se da ovaj aneks prestaje vrijediti s danom prestanka rada u državi u koju je izaslan."),
    center("Članak X."),
    p("1. Ugovorne strane suglasno utvrđuju da će sve izmjene i dopune ovog ugovora sastaviti u pisanom obliku."),
    center("Članak XI."),
    p(`1. Ugovorne strane suglasne su da će sve eventualne sporove glede odredbi ovog ugovora riješiti sporazumno, a ukoliko to nije moguće ugovaraju nadležnost Općinskog suda u ${b(`${d.a1_court}.`)}`),
    center("Članak XII."),
    p("1. Ovaj ugovor sastavljen je u dva istovjetna primjerka od kojih svaka ugovorna strana zadržava po jedan primjerak"),
    center("Članak XIII."),
    p("1. Strane su suglasne da je u odredbama ovog ugovora sadržana njihova stvarna bolja, očitovana slobodno i ozbiljno, te ga u znak prihvata prava i obveza koje iz njega proizlaze vlastoručno potpisuju."),
    p(`U ${b(d.a1_signature_place)} , dana ${b(formatDate(d.a1_signature_date))} godine.`),
    signatureHtml(context)
  ]);
}

function buildErvDocument(context) {
  const d = formToObject($("#documentForm"));
  const year = Number(d.erv_year);
  const month = Number(d.erv_month);
  const days = daysInMonth(year, month);
  const holidays = croatianNonWorkingDays(year).filter((item) => item.month === month);
  const holidayByDay = new Map(holidays.map((item) => [item.day, item.name]));
  const headers = ervColumns.map((column) => `<th title="${escapeHtml(column === "Datum" ? "Datum" : ervColumnDescriptions[column] || "")}">${escapeHtml(column)}</th>`).join("");
  const rows = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month - 1, day);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const holiday = holidayByDay.get(day);
    const values = {
      Datum: `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}.`,
      Dut: dayNamesHr[date.getDay()],
      "B-DP": holiday || (weekend ? "Vikend" : "")
    };
    const isNonWorking = Boolean(values["B-DP"]);
    return `<tr>${ervColumns.map((column) => {
      const blockCell = isNonWorking && !["Datum", "Dut", "B-DP"].includes(column);
      return `<td class="${blockCell ? "blocked-cell" : ""}">${escapeHtml(values[column] || "")}</td>`;
    }).join("")}</tr>`;
  }).join("");
  const explanation = Object.entries(ervColumnDescriptions)
    .map(([key, value]) => `${key} - ${value}`)
    .join("; ");
  const html = `
    ${centerTitle("EVIDENCIJA O RADNOM VREMENU")}
    ${p(`Poslodavac: ${b(`${context.employer.company_name || ""}, ${context.employerInfo}`)}`)}
    ${p(`Radnik: ${b(`${context.employeeName}, OIB/Putovnica: ${context.employeePersonalId}`)}`)}
    ${p(`ZA RAZDOBLJE OD ${b(`01.${String(month).padStart(2, "0")}.${year}.`)} DO ${b(`${days}.${String(month).padStart(2, "0")}.${year}.`)}`)}
    ${p(`Hrvatski neradni dani: ${b(holidays.length ? holidays.map((item) => `${String(item.day).padStart(2, "0")}.${String(item.month).padStart(2, "0")}. - ${item.name}`).join("; ") : "nema u odabranom mjesecu")}`)}
    <table class="erv-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
    ${p("Za točnost i istinitost podataka iz ovog izvješća zaposlenik jamči potpisom pod punom kaznenom i materijalnom odgovornošću.")}
    ${p(`Datum podnošenja izvješća: ____________________`)}
    <p class="erv-acronyms"><strong>Akronimi:</strong> ${escapeHtml(explanation)}</p>
    ${signatureHtml(context)}
  `;
  return { title: "EVIDENCIJA O RADNOM VREMENU", html, body: htmlToText(html) };
}

function buildAccountingServicesDocument(data) {
  const client = state.employers.find((item) => item.id === data.services_client_id) || {};
  const accounting = state.accounting.find((item) => item.id === data.services_accounting_id) || {};
  const clientEmail = data.services_client_email || client.email || "";
  const accountingEmail = data.services_accounting_email || accounting.email || "";
  const serviceItems = linesToListItems(data.services_scope);
  const excludedItems = linesToListItems(data.services_excluded);
  const clientAddress = formatAddress(client);
  const accountingAddress = formatAddress(accounting);
  const monthlyFee = feeWithVatStatus(data.services_monthly_fee, data.services_vat_status);
  const annualFee = feeWithVatStatus(data.services_annual_fee, data.services_annual_vat_status);
  const durationText = data.services_duration_type === "određeno vrijeme"
    ? `određeno vrijeme do ${formatDate(data.services_end_date)}`
    : "neodređeno vrijeme";
  const copiesText = `${data.services_copies} (${numberWordHr(data.services_copies)}) istovjetna primjerka`;

  const html = `
    ${centerTitle("UGOVOR O OBAVLJANJU KNJIGOVODSTVENIH I RAČUNOVODSTVENIH USLUGA")}
    ${p(`sklopljen dana ${b(formatDate(data.services_contract_date))} u ${b(data.services_contract_place)}`)}
    ${center("1. UGOVORNE STRANE")}
    ${center("Naručitelj (Klijent)")}
    ${p(`${b(client.company_name || "")}<br>Sjedište: ${b(clientAddress)}<br>OIB: ${b(client.vat || "")}<br>zastupa: ${b(client.director || "")}<br>(u daljnjem tekstu: ${b("Klijent")})`)}
    ${center("Izvršitelj (Knjigovodstveni ured)")}
    ${p(`${b(accounting.company_name || "")}<br>Sjedište: ${b(accountingAddress)}<br>OIB: ${b(accounting.vat || "")}<br>zastupa: ${b(accounting.director || "")}<br>(u daljnjem tekstu: ${b("Knjigovodstveni ured")})`)}
    ${p(`zajednički dalje u tekstu: ${b("Ugovorne strane")}.`)}
    ${center("Članak 1.")}
    ${center("Predmet ugovora")}
    ${p("Ovim Ugovorom uređuju se međusobna prava i obveze Ugovornih strana vezano uz pružanje knjigovodstvenih, računovodstvenih, poreznih i administrativnih usluga koje Knjigovodstveni ured obavlja za Klijenta.")}
    ${p("Knjigovodstveni ured obvezuje se za Klijenta obavljati osobito sljedeće usluge:")}
    ${ul(serviceItems)}
    ${p("Opseg usluga može se dodatno definirati posebnim prilogom ili ponudom koja čini sastavni dio ovog Ugovora.")}
    ${center("Članak 2.")}
    ${center("Obveze Knjigovodstvenog ureda")}
    ${ol([
      "obavljati ugovorene usluge stručno, savjesno i u skladu s važećim propisima Republike Hrvatske",
      "pravodobno voditi poslovne evidencije temeljem dostavljene dokumentacije",
      "čuvati poslovnu tajnu i povjerljivost svih podataka Klijenta",
      "upozoriti Klijenta na moguće nepravilnosti ili zakonske obveze",
      "čuvati dokumentaciju i elektroničke podatke u skladu sa zakonskim rokovima",
      "omogućiti Klijentu uvid u poslovne evidencije na njegov zahtjev",
      "koristiti digitalne alate i sustave za sigurnu razmjenu dokumentacije kada je to moguće"
    ])}
    ${p("Knjigovodstveni ured ne odgovara za posljedice koje proizlaze iz netočne, nepotpune ili zakašnjele dokumentacije dostavljene od strane Klijenta.")}
    ${center("Članak 3.")}
    ${center("Obveze Klijenta")}
    ${ol([
      "dostavljati potpunu, točnu i vjerodostojnu dokumentaciju",
      `dokumentaciju dostavljati najkasnije do ${b(`${data.services_document_delivery_day}. dana u mjesecu`)} za prethodni mjesec`,
      "pravodobno obavještavati Knjigovodstveni ured o svim promjenama bitnim za poslovanje",
      "osigurati pristup potrebnim informacijama i poslovnim evidencijama",
      "čuvati originale dokumentacije ako se ista dostavlja elektroničkim putem",
      "podmirivati ugovorenu naknadu u rokovima definiranima ovim Ugovorom"
    ])}
    ${p("Klijent snosi odgovornost za zakonitost poslovnih događaja i vjerodostojnost dostavljene dokumentacije.")}
    ${center("Članak 4.")}
    ${center("Način dostave dokumentacije")}
    ${p("Dokumentacija se može dostavljati osobno, putem elektroničke pošte, putem cloud servisa, putem računovodstvenih aplikacija ili putem integriranih digitalnih sustava. Elektronički dostavljena dokumentacija smatra se vjerodostojnom osim ako postoji osnovana sumnja u njezinu ispravnost.")}
    ${center("Članak 5.")}
    ${center("Naknada za usluge")}
    ${p(`Klijent se obvezuje za ugovorene usluge plaćati mjesečnu naknadu u iznosu od ${b(monthlyFee)}.`)}
    ${p(`Izrada završnog računa, godišnjih financijskih izvještaja, prijave poreza na dobit/dohodak i pripadajućih godišnjih obrazaca naplaćuje se posebno u iznosu od ${b(annualFee)}, osim ako Ugovorne strane pisanim putem ne ugovore drugačije.`)}
    ${p("U cijenu nisu uključene:")}
    ${ul(excludedItems)}
    ${p("Dodatne usluge obračunavaju se prema važećem cjeniku Knjigovodstvenog ureda. Naknada se može korigirati u slučaju značajnog povećanja opsega dokumentacije, povećanja broja zaposlenih, promjene zakonskih obveza ili promjene poslovnog modela Klijenta.")}
    ${center("Članak 6.")}
    ${center("Rok i način plaćanja")}
    ${p(`Knjigovodstveni ured izdaje račun jednom mjesečno. Klijent se obvezuje račun podmiriti u roku od ${b(`${data.services_payment_due_days} dana od dana izdavanja računa`)}. Plaćanje se vrši na poslovni račun Knjigovodstvenog ureda naveden na računu.`)}
    ${p("U slučaju kašnjenja plaćanja, Knjigovodstveni ured ima pravo obračunati zakonske zatezne kamate te privremeno obustaviti pružanje usluga do podmirenja dospjelih obveza.")}
    ${center("Članak 7.")}
    ${center("Povjerljivost i zaštita podataka")}
    ${p("Ugovorne strane obvezuju se čuvati sve poslovne, financijske i osobne podatke kao povjerljive. Knjigovodstveni ured obvezuje se postupati u skladu s GDPR uredbom, Zakonom o računovodstvu, Zakonom o provedbi Opće uredbe o zaštiti podataka te propisima o sprječavanju pranja novca i financiranja terorizma.")}
    ${center("Članak 8.")}
    ${center("Odgovornost")}
    ${p("Knjigovodstveni ured odgovara isključivo za štetu nastalu namjernim postupanjem ili grubom nepažnjom. Knjigovodstveni ured ne odgovara za posljedice zakašnjele dostave dokumentacije, netočne podatke dostavljene od strane Klijenta, odluke poslovodstva Klijenta ni privremene nedostupnosti državnih sustava.")}
    ${center("Članak 9.")}
    ${center("Trajanje ugovora")}
    ${p(`Ovaj Ugovor sklapa se na ${b(durationText)} i stupa na snagu danom potpisa obiju Ugovornih strana.`)}
    ${center("Članak 10.")}
    ${center("Otkaz ugovora")}
    ${p(`Svaka Ugovorna strana može otkazati ovaj Ugovor uz ${b(`otkazni rok od ${data.services_notice_period_days} dana`)}. Otkaz mora biti dostavljen u pisanom obliku putem e-maila ili preporučenom poštom. U slučaju grubog kršenja ugovornih obveza, Ugovor se može raskinuti odmah.`)}
    ${center("Članak 11.")}
    ${center("Elektronička komunikacija")}
    ${p(`Ugovorne strane suglasne su da se komunikacija i razmjena dokumentacije mogu obavljati elektroničkim putem. E-mail komunikacija smatra se službenom poslovnom komunikacijom.`)}
    ${p(`Službene e-mail adrese:<br>Klijent: ${b(clientEmail)}<br>Knjigovodstveni ured: ${b(accountingEmail)}`)}
    ${center("Članak 12.")}
    ${center("Završne odredbe")}
    ${p(`Sve izmjene i dopune ovog Ugovora valjane su isključivo ako su sastavljene u pisanom obliku. Na ovaj Ugovor primjenjuje se pravo Republike Hrvatske. U slučaju spora, nadležan je stvarno nadležni sud u ${b(`${data.services_court}.`)}`)}
    ${center("Članak 13.")}
    ${center("Broj primjeraka")}
    ${p(`Ovaj Ugovor sastavljen je u ${b(copiesText)}, od kojih svaka Ugovorna strana zadržava po jedan primjerak.`)}
    ${serviceSignatureHtml(client, accounting)}
  `;

  return {
    title: "UGOVOR O KNJIGOVODSTVENO-RAČUNOVODSTVENIM USLUGAMA",
    html,
    body: htmlToText(html)
  };
}

function buildEmploymentDocument(data) {
  const definition = employmentDocumentDefinitions[data.type];
  const employer = state.employers.find((item) => item.id === data.employer_id) || state.employers[0] || {};
  const employee = state.employees.find((item) => item.id === data.employee_id) || state.employees[0] || {};
  const context = employmentDocumentContext(data, employer, employee);
  const builders = {
    confirmation: buildEmploymentConfirmation,
    mutual: buildMutualTermination,
    probation: buildProbationTermination,
    warning: buildWorkObligationWarning,
    misconduct: buildMisconductNotice,
    personal: buildPersonalNotice,
    business: buildBusinessNotice,
    changed: buildChangedContractOffer,
    employee_regular: buildEmployeeRegularNotice,
    employer_extraordinary: buildEmployerExtraordinaryNotice,
    employee_extraordinary: buildEmployeeExtraordinaryNotice,
    fixed_expiry: buildFixedTermExpiryNotice,
    retirement: buildRetirementNotice,
    housing: buildHousingStatement
  };
  const html = builders[definition.category](context, definition);
  return { title: definition.title, html, body: htmlToText(html) };
}

function employmentDocumentContext(data, employer, employee) {
  const employeeName = `${employee.name || ""} ${employee.lastname || ""}`.trim();
  const employeeAddress = formatAddress(employee);
  const employerInfo = `${formatAddress(employer)}${employer.vat ? `, OIB: ${employer.vat}` : ""}`;
  return {
    data,
    employer,
    employee,
    employeeName,
    employeeAddress,
    employeeInfo: `${employeeName}${employeeAddress ? `, ${employeeAddress}` : ""}${employee.personal_id ? `, OIB/Putovnica: ${employee.personal_id}` : ""}`,
    employerInfo,
    director: employer.director || "",
    place: data.employment_doc_place || employer.city || "",
    documentDate: formatDate(data.employment_doc_date || data.contract_date),
    contractDate: formatDate(data.employment_contract_date || data.contract_date),
    contractType: data.employment_contract_type || "neodređeno vrijeme",
    jobTitle: data.employment_job_title || data.job_description || "",
    workPlace: data.employment_work_place || data.working_place || "",
    startDate: formatDate(data.employment_start_date || data.start_date),
    endDate: formatDate(data.employment_end_date || data.end_job_date),
    noticePeriod: data.employment_notice_period || `${data.contract_termination_employer || "15"} dana`,
    vacationYear: data.employment_vacation_year || new Date().getFullYear(),
    vacationTotal: data.employment_vacation_total || "0",
    vacationUsed: data.employment_vacation_used || "0",
    vacationRemaining: data.employment_vacation_remaining || "0",
    vacationFrom: formatDate(data.employment_vacation_from),
    vacationTo: formatDate(data.employment_vacation_to),
    paymentAmount: data.employment_payment_amount || "0,00 EUR",
    probationPeriod: data.employment_probation_period || "1 mjesec",
    probationNotice: data.employment_probation_notice || "7 dana",
    employeeAge: data.employment_employee_age || "65",
    pensionYears: data.employment_pension_years || "15",
    reason: data.employment_reason || "",
    violation: data.employment_violation || "",
    changedContractSummary: data.employment_changed_contract_summary || "",
    housingAddress: data.housing_address || "",
    housingDescription: data.housing_description || "soba, kuhinja, kupaonica i sanitarni čvor"
  };
}

function buildEmploymentConfirmation(context) {
  return makeEmploymentDocument(context, [
    employerActIntro(context, "izdaje sljedeću"),
    centerTitle("POTVRDU"),
    center(b(`o sklopljenom Ugovoru o radu na neodređeno vrijeme sa zaposlenikom ${context.employeeName}`)),
    p(`1. Dana ${b(context.contractDate)} sa zaposlenikom ${b(context.employeeInfo)} sklopljen je Ugovor o radu na neodređeno vrijeme za obavljanje poslova ${b(context.jobTitle)}.`),
    p(`2. Zaposlenik počinje s radom kod Poslodavca dana ${b(context.startDate)}.`),
    p("3. Zaposlenik će ugovorene poslove obavljati osobno, prema uputama Poslodavca."),
    p(`4. Zaposlenik će poslove obavljati u ${b(context.workPlace)}, a u slučaju potrebe, po nalogu Poslodavca, privremeno i u drugim mjestima.`),
    p(`5. Ugovoren je probni rad u trajanju od ${b(context.probationPeriod)} i otkazni rok tijekom probnog rada od ${b(context.probationNotice)}.`),
    p(`6. Mjesečna osnovna bruto plaća iznosi ${b(context.data.salary || "0,00 EUR")}. Plaća se isplaćuje najkasnije do 15-og u mjesecu za prethodni mjesec.`),
    p(`7. Zaposlenik ima pravo na godišnji odmor u trajanju od ${b(context.data.vacation || `${context.vacationTotal} dana`)}.`),
    p(`8. Za slučaj spora ugovara se nadležnost stvarno nadležnog suda u ${b(`${context.data.court || "Zagrebu"}.`)}`),
    employerOnlySignature(context)
  ]);
}

function buildMutualTermination(context) {
  return makeEmploymentDocument(context, [
    p(`${employerParty(context)} i ${employeeParty(context)} zaključili su u ${b(context.place)}, dana ${b(context.documentDate)} sljedeći`),
    centerTitle("SPORAZUM O PRESTANKU UGOVORA O RADU"),
    center("Članak 1."),
    p(`Strane ovog Sporazuma utvrđuju da su dana ${b(context.contractDate)} sklopile Ugovor o radu na ${b(context.contractType)} radi obavljanja poslova ${b(context.jobTitle)}.`),
    p(`Ugovorne strane suglasno utvrđuju da Ugovor o radu prestaje dana ${b(context.endDate)}.`),
    center("Članak 2."),
    vacationParagraph(context),
    center("Članak 3."),
    p("Radnik je dužan do dana prestanka radnog odnosa predati sredstva rada, dokumentaciju i drugu imovinu Poslodavca koju je koristio u radu."),
    center("Članak 4."),
    p("Ovaj Sporazum sastavljen je u dva istovjetna primjerka od kojih svaka strana zadržava po jedan primjerak."),
    p(`U ${b(context.place)}, ${b(context.documentDate)} godine.`),
    signatureHtml(context)
  ]);
}

function buildProbationTermination(context) {
  return makeEmployerDecision(context, "ODLUKU", "O OTKAZU UGOVORA O RADU ZBOG NEZADOVOLJAVANJA RADNIKA NA PROBNOM RADU", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, jer tijekom probnog rada nije zadovoljio očekivanja radnog mjesta.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.probationNotice)}, koji počinje teći danom dostave ove Odluke.`),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || `Tijekom probnog rada u trajanju od ${context.probationPeriod} utvrđeno je da radnik ne ostvaruje očekivane rezultate i ne zadovoljava zahtjeve radnog mjesta.`))
  ]);
}

function buildWorkObligationWarning(context) {
  return makeEmployerDecision(context, "UPOZORENJE", "NA OBVEZE IZ RADNOG ODNOSA", [
    p(`Radnik ${b(context.employeeInfo)}, zaposlen na temelju Ugovora o radu sklopljenog dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, upozorava se da je povrijedio obveze iz radnog odnosa.`),
    p(safeMultiline(context.violation)),
    p("U slučaju nastavka povrede radnih obveza radniku prijeti mogućnost otkaza Ugovora o radu zbog skrivljenog ponašanja."),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || "Na temelju raspoložive dokumentacije i saznanja Poslodavca utvrđeno je postojanje opisane povrede obveza iz radnog odnosa."))
  ]);
}

function buildMisconductNotice(context) {
  return makeEmployerDecision(context, "ODLUKU", "O REDOVITOM OTKAZU UGOVORA O RADU ZBOG SKRIVLJENOG PONAŠANJA", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu na ${b(context.contractType)} sklopljen dana ${b(context.contractDate)} radi obavljanja poslova ${b(context.jobTitle)}, zbog skrivljenog ponašanja.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.noticePeriod)}, koji počinje teći danom dostave ove Odluke.`),
    vacationParagraph(context),
    center("Obrazloženje"),
    p(safeMultiline(context.violation)),
    p(safeMultiline(context.reason || "Radnik je prethodno upozoren na obveze iz radnog odnosa i mogućnost otkaza u slučaju nastavka povrede tih obveza."))
  ]);
}

function buildPersonalNotice(context) {
  return makeEmployerDecision(context, "ODLUKU", "O REDOVITOM OSOBNO UVJETOVANOM OTKAZU UGOVORA O RADU", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu na ${b(context.contractType)} sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, zbog osobno uvjetovanih razloga.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.noticePeriod)}, koji počinje teći danom dostave ove Odluke.`),
    vacationParagraph(context),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || "Zbog trajnih osobina ili sposobnosti radnika isti nije u mogućnosti uredno izvršavati svoje obveze iz radnog odnosa."))
  ]);
}

function buildBusinessNotice(context, definition) {
  return makeEmployerDecision(context, "ODLUKU", `O REDOVITOM POSLOVNO UVJETOVANOM OTKAZU UGOVORA O RADU ZBOG ${definition.businessReason.toUpperCase()}`, [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu na ${b(context.contractType)} sklopljen dana ${b(context.contractDate)} radi obavljanja poslova ${b(context.jobTitle)}, zbog ${b(definition.businessReason)}.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.noticePeriod)}, koji počinje teći danom dostave ove Odluke.`),
    vacationParagraph(context),
    p(`Radnik ima pravo na otpremninu odnosno drugu pripadajuću isplatu u iznosu od ${b(context.paymentAmount)}, ako su za to ispunjene zakonske pretpostavke.`),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || `Zbog ${definition.businessReason} prestala je potreba za obavljanjem poslova radnika pod uvjetima iz sklopljenog ugovora o radu.`))
  ]);
}

function buildChangedContractOffer(context) {
  return makeEmployerDecision(context, "ODLUKU", "O OTKAZU S PONUDOM IZMIJENJENOG UGOVORA O RADU", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, uz istodobnu ponudu sklapanja izmijenjenog ugovora o radu.`),
    p(`Ako radnik prihvati ponudu, radni odnos nastavlja se pod uvjetima iz izmijenjenog ugovora. Ako radnik ponudu ne prihvati, radni odnos prestaje istekom otkaznog roka od ${b(context.noticePeriod)}.`),
    p(safeMultiline(context.changedContractSummary)),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || "Zbog promijenjenih potreba organizacije rada potrebno je izmijeniti ugovorene uvjete rada."))
  ]);
}

function buildEmployeeRegularNotice(context) {
  return makeEmploymentDocument(context, [
    p(`${employeeParty(context)} daje Poslodavcu ${b(context.employer.company_name || "")} sljedeći`),
    centerTitle("REDOVITI OTKAZ UGOVORA O RADU"),
    p(`Radnik redovito otkazuje Ugovor o radu sklopljen dana ${b(context.contractDate)} za obavljanje poslova ${b(context.jobTitle)}.`),
    p(`Otkazni rok iznosi ${b(context.noticePeriod)} i počinje teći danom dostave ovog otkaza Poslodavcu.`),
    p(`Radni odnos prestaje dana ${b(context.endDate)}.`),
    p(safeMultiline(context.reason || "Radnik otkazuje ugovor o radu iz osobnih razloga.")),
    employeeOnlySignature(context)
  ]);
}

function buildEmployerExtraordinaryNotice(context) {
  return makeEmployerDecision(context, "ODLUKU", "O IZVANREDNOM OTKAZU UGOVORA O RADU", [
    p(`Radniku ${b(context.employeeInfo)} izvanredno se otkazuje Ugovor o radu sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}.`),
    p(`Radni odnos prestaje danom dostave ove Odluke, odnosno dana ${b(context.endDate)}.`),
    center("Obrazloženje"),
    p(safeMultiline(context.violation)),
    p(safeMultiline(context.reason || "Zbog osobito teške povrede obveze iz radnog odnosa nastavak radnog odnosa nije moguć."))
  ]);
}

function buildEmployeeExtraordinaryNotice(context) {
  return makeEmploymentDocument(context, [
    p(`${employeeParty(context)} daje Poslodavcu ${b(context.employer.company_name || "")} sljedeći`),
    centerTitle("IZVANREDNI OTKAZ UGOVORA O RADU"),
    p(`Radnik izvanredno otkazuje Ugovor o radu sklopljen dana ${b(context.contractDate)} za obavljanje poslova ${b(context.jobTitle)}.`),
    p(`Radni odnos prestaje danom dostave ovog otkaza, odnosno dana ${b(context.endDate)}.`),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || "Zbog osobito važne činjenice nastavak radnog odnosa nije moguć.")),
    employeeOnlySignature(context)
  ]);
}

function buildFixedTermExpiryNotice(context) {
  return makeEmploymentDocument(context, [
    employerActIntro(context, "daje sljedeću"),
    centerTitle("OBAVIJEST O PRESTANKU UGOVORA O RADU NA ODREĐENO VRIJEME"),
    p(`Obavještava se radnik ${b(context.employeeInfo)} da Ugovor o radu na određeno vrijeme sklopljen dana ${b(context.contractDate)} za obavljanje poslova ${b(context.jobTitle)} prestaje istekom vremena na koje je sklopljen, dana ${b(context.endDate)}.`),
    vacationParagraph(context),
    p("Radnik je dužan do dana prestanka radnog odnosa vratiti sredstva rada i uredno izvršiti primopredaju poslova."),
    employerOnlySignature(context)
  ]);
}

function buildRetirementNotice(context) {
  return makeEmploymentDocument(context, [
    employerActIntro(context, "daje sljedeću"),
    centerTitle("OBAVIJEST O PRESTANKU UGOVORA O RADU RADI 65 GODINA ŽIVOTA I 15 GODINA MIROVINSKOG STAŽA"),
    p(`Obavještava se radnik ${b(context.employeeInfo)} da mu Ugovor o radu sklopljen dana ${b(context.contractDate)} prestaje dana ${b(context.endDate)} jer radnik ima navršenih ${b(context.employeeAge)} godina života i ${b(context.pensionYears)} godina mirovinskog staža.`),
    vacationParagraph(context),
    p("Radnik je dužan do dana prestanka radnog odnosa izvršiti primopredaju poslova i sredstava rada."),
    employerOnlySignature(context)
  ]);
}

function buildHousingStatement(context) {
  return makeEmploymentDocument(context, [
    centerTitle("IZJAVA O STANOVANJU"),
    p(`Izjavljujem u ime poduzeća ${b(context.employer.company_name || "")}, ${b(context.employerInfo)}, da će budući radnik ${b(context.employeeName)} iz ${b(context.employeeAddress || "-")}, OIB/putovnica ${b(context.employee.personal_id || "-")}, imati odgovarajući smještaj na adresi ${b(context.housingAddress)}.`),
    p(`Smještaj će se sastojati od: ${b(context.housingDescription)}.`),
    p(`U ${b(context.place)}, ${b(context.documentDate)} godine.`),
    employerOnlySignature(context)
  ]);
}

function makeEmployerDecision(context, actLabel, title, parts) {
  return makeEmploymentDocument(context, [
    employerActIntro(context, "donosi sljedeću"),
    centerTitle(actLabel),
    center(b(title)),
    ...parts,
    employerOnlySignature(context),
    deliveryList()
  ]);
}

function makeEmploymentDocument(context, parts) {
  return parts.flat().join("");
}

function employerActIntro(context, verb) {
  return p(`Na temelju mjerodavnih odredbi Zakona o radu, ${employerParty(context)} ${verb}`);
}

function employerParty(context) {
  return `${b(`${context.employer.company_name || ""}, ${context.employerInfo}`)}, zastupano po ${b(context.director)}, (u nastavku: Poslodavac)`;
}

function employeeParty(context) {
  return `${b(context.employeeInfo)}, (u nastavku: Radnik)`;
}

function vacationParagraph(context) {
  const usage = context.vacationFrom && context.vacationTo
    ? `koji će koristiti u razdoblju od ${b(context.vacationFrom)} do ${b(context.vacationTo)}`
    : "koji će koristiti u dogovoru s Poslodavcem ili za koji će se obračunati pripadajuća naknada ako ga ne iskoristi";
  return p(`Radnik ima pravo na ${b(context.vacationTotal)} dana godišnjeg odmora za ${b(context.vacationYear)} godinu, od čega je iskoristio ${b(context.vacationUsed)} dana, te mu preostaje ${b(context.vacationRemaining)} dana ${usage}.`);
}

function employerOnlySignature(context) {
  return `
    <div class="signature-block single-signature">
      <div class="signature-card">
        <div class="signature-role">Za poslodavca</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.director)}</div>
      </div>
    </div>
  `;
}

function employeeOnlySignature(context) {
  return `
    <div class="signature-block single-signature">
      <div class="signature-card">
        <div class="signature-role">Radnik</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.employeeName)}</div>
      </div>
    </div>
  `;
}

function deliveryList() {
  return `
    ${p("Dostaviti:")}
    ${ol(["Radniku - 2 primjerka", "Kadrovskoj službi", "Službi nadležnoj za obračun plaća i naknada plaće"])}
  `;
}

function buildAnnexA1(context) {
  return {
    title: "Aneks ugovora o radu za A1",
    body: [
      "ANEKS UGOVORA O RADU ZA A1",
      "",
      `Sastavljen dana ${context.dateLabel}.`,
      "",
      `Poslodavac ${context.employer.company_name || ""} i radnik ${context.employeeName} utvrduju dodatne uvjete rada vezane uz upucivanje i ishodovanje potvrde A1.`,
      "",
      `Radnik obavlja poslove radnog mjesta ${context.job_title}. Poslodavac ostaje odgovoran za obracun place, evidenciju rada i prava iz radnog odnosa.`,
      "",
      "Ovaj aneks cini sastavni dio postojeceg ugovora o radu.",
      "",
      signatureBlock(context)
    ].join("\n")
  };
}

function buildWorkingHoursSheet(context) {
  const date = context.sheet_month ? new Date(`${context.sheet_month}-01T00:00:00`) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const lines = [];
  for (let day = 1; day <= days; day += 1) {
    const current = new Date(year, month, day);
    const weekend = current.getDay() === 0 || current.getDay() === 6;
    lines.push(`${String(day).padStart(2, "0")}. ${weekend ? "Vikend" : "08:00 - 16:00    8 sati"}`);
  }
  return {
    title: "Evidencija radnog vremena",
    body: [
      "EVIDENCIJA RADNOG VREMENA",
      "",
      `Poslodavac: ${context.employer.company_name || ""}`,
      `Radnik: ${context.employeeName}`,
      `Mjesec: ${String(month + 1).padStart(2, "0")}/${year}`,
      "",
      ...lines,
      "",
      signatureBlock(context)
    ].join("\n")
  };
}

function salaryAndWorkSections(context) {
  const shiftText = context.working_shift_description
    ? `${b(`${context.working_shift}: ${context.working_shift_description}.`)}`
    : `${b(context.working_shift)} , te počinje-završava ${b(`${context.working_time_start} - ${context.working_time_end}.`)}`;

  return [
    center("II. Plaće i naknade"),
    p(`1. Za realizaciju preuzetih obveza iz točke I.2. Radniku pripada osnovna bruto plaća u iznosu od ${b(context.salary)} eura.`),
    p("2. Isplata će se obavljati jedanput  mjesečno i to najkasnije do 15-tog u mjesecu za prethodni mjesec."),
    p(`3. Uz plaću navedenu u točki II.1. ovog Ugovora, Radniku pripada i stimulativni dio plaće u iznosu od ${b(context.salary_bonus)} eura bruto mjesečno.`),
    p("4. Radnik ima pravo na povećanu plaću za"),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- otežane uvjete rada ${b(context.salary_increment_1)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- rad u dane blagdana i neradne dane utvrđene zakonom i za rad na dan Uskrsa ${b(context.salary_increment_2)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- rad nedjeljom ${b(context.salary_increment_3)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- noćni rad ${b(context.salary_increment_4)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- prekovremeni rad ${b(context.salary_increment_5)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- za rad u drugoj smjeni u slučaju stalnog smjenskog rada ${b(context.salary_increment_6)}`),
    center("III. Troškovi i naknade"),
    p("1. Radnik ima pravo naknade troškova za službena putovanja u zemlji i inozemstvu, u visini propisanoj zakonom."),
    center("IV. Radno vrijeme i godišnji odmor"),
    p(`1. Radnik će raditi ${b(context.work_type)} radno vrijeme od ${b(context.weekly_working_hours)} sati tjedno.`),
    p(`2. Radno vrijeme određuje se ${shiftText}`),
    p("3. U tijeku rada Radnik ima pravo koristiti dnevni odmor (stanku) u trajanju od 30 minuta."),
    p(`4. Tjedni odmor Radnik će koristiti ${b(`${context.weekly_time_off}.`)}`),
    p(`5. Radnik ima pravo na godišnji odmor u trajanju od ${b(`${context.vacation} ${context.vacation_description}.`)}`),
    center("V. Čuvanje poslovne tajne"),
    p("1, Radnik se obvezuje da će za vrijeme trajnja Ugovora o radu, a i njegovo prestanka, čuvati sve poslovne tajne Poslodavca i njegovih komitenata prema neovlaštenim osobama, koje su po svojoj prirodi povjerene i zaštićene, a koje su mu bile povjerene ili koje je mogao saznati na poslu.")
  ].join("");
}

function closingSections(context, copiesText) {
  const start = joinDateOrDescription(context.contract_starting_with, context.contract_start_with_description);
  return [
    center("VII. Ostala prava i ovbeze Radnika i Poslodavca"),
    center(b(`${context.rights_and_obligations}.`)),
    center("VIII. Zaključne odredbe"),
    p(`1. Za slučaj spora, stranke ugovaraju mjesnu nadležnost suda u ${b(`${context.court}.`)}`),
    p(`2. Ovaj Ugovor stupa na snagu ${b(start.endsWith(".") ? start : `${start}.`)}`),
    p(`3. Ovaj je Ugovor sastavljen u ${copiesText}`)
  ].join("");
}

function signatureHtml(context) {
  return `
    <div class="signature-block">
      <div class="signature-card">
        <div class="signature-role">Poslodavac</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.director)}</div>
      </div>
      <div class="signature-card">
        <div class="signature-role">Radnik</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.employeeName)}</div>
      </div>
    </div>
  `;
}

function serviceSignatureHtml(client, accounting) {
  return `
    <div class="signature-block">
      <div class="signature-card">
        <div class="signature-role">Klijent</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(client.company_name || "")}</div>
        <div>${escapeHtml(client.director || "")}</div>
      </div>
      <div class="signature-card">
        <div class="signature-role">Knjigovodstveni ured</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(accounting.company_name || "")}</div>
        <div>${escapeHtml(accounting.director || "")}</div>
      </div>
    </div>
  `;
}

function makeContractDocument(title, parts) {
  const html = parts.flat().join("");
  return {
    title,
    html,
    body: htmlToText(html)
  };
}

function p(value, className = "") {
  return `<p class="${className}">${value}</p>`;
}

function center(value) {
  return p(value, "center");
}

function centerTitle(value) {
  return p(value, "center title");
}

function b(value) {
  return `<strong>${escapeHtml(value)}</strong>`;
}

function safeMultiline(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function linesToListItems(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

function ul(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function ol(items) {
  return `<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
}

function numberOptions(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const value = start + index;
    return `<option value="${value}">${value}</option>`;
  }).join("");
}

function feeWithVatStatus(amount, vatStatus) {
  const normalized = normalizeMoney(amount);
  const amountLabel = `${normalized.replace(".", ",")} EUR`;
  return vatStatus === "nije u sustavu PDV-a" ? `${amountLabel} (${vatStatus})` : `${amountLabel} ${vatStatus}`;
}

function numberWordHr(value) {
  return {
    2: "dva",
    3: "tri",
    4: "četiri",
    5: "pet",
    6: "šest"
  }[Number(value)] || String(value);
}

function titleCaseDocument(value) {
  return String(value || "")
    .toLocaleLowerCase("hr-HR")
    .replace(/(^|\s)(\p{L})/gu, (_, space, letter) => `${space}${letter.toLocaleUpperCase("hr-HR")}`);
}

function joinDateOrDescription(dateValue, description) {
  return [dateValue, description].filter(Boolean).join(" - ");
}

function buildGfiDocument() {
  const data = formToObject($("#gfiForm"));
  return {
    title: "GFI dokument",
    body: [
      "ODLUKA O UTVRDIVANJU GODISNJIH FINANCIJSKIH IZVJESTAJA",
      "",
      `${data.company_name || ""}`,
      `${data.address || ""}, ${data.city || ""}`,
      `OIB: ${data.oib || ""}`,
      "",
      `Na dan ${formatDate(data.report_date)} direktor ${data.director || ""} donosi odluku za poslovnu godinu ${data.report_year || ""}.`,
      "",
      `Dobit prije poreza: ${data.gain_before_tax || "0,00"}`,
      `Porez na dobit: ${data.gain_tax || "0,00"}`,
      `Dobit nakon poreza: ${data.gain_after_tax || "0,00"}`,
      data.loss_coverage ? `Pokriće gubitka: ${data.loss_coverage}` : "Dobit se raspoređuje sukladno odluci članova društva.",
      "",
      "Direktor:",
      "",
      "____________________________",
      `${data.director || ""}`
    ].join("\n")
  };
}

function openDocument(documentData) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    toast("Preglednik je blokirao novi prozor.");
    return;
  }
  win.document.write(buildPrintableHtml(documentData, new URL("logo.png", window.location.href).href));
  win.document.close();
}

async function downloadPrintableHtml(documentData) {
  const logo = await logoDataUrl();
  const html = buildPrintableHtml(documentData, logo);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileSlug(documentData.title)}-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("HTML dokument je preuzet.");
}

function buildPrintableHtml(documentData, logoSrc) {
  const isWideDocument = documentData.html?.includes("erv-table");
  const bodyClass = isWideDocument ? "wide-document" : "";
  const pageRule = isWideDocument
    ? "@page { size: auto; margin: 10mm 10mm 18mm; }"
    : "@page { size: auto; margin: 16mm 16mm 20mm; }";
  return `
    <!doctype html>
    <html lang="hr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(documentData.title)}</title>
        <style>
          ${pageRule}
          * { box-sizing: border-box; }
          html { background: #eef2f6; }
          body { width: min(100%, 210mm); margin: 0 auto; padding: 14mm 18mm 18mm; font: 13.5px/1.38 Arial, sans-serif; color: #111827; background: #ffffff; }
          body.wide-document { width: min(100%, 297mm); padding: 12mm; }
          .print-header { display: flex; justify-content: flex-end; align-items: flex-start; min-height: 18mm; margin-bottom: 2mm; }
          main { position: relative; z-index: 1; }
          .print-brand { width: 18mm; height: 18mm; text-align: right; }
          .print-brand img { display: block; width: 18mm; height: 18mm; object-fit: contain; margin-left: auto; }
          h1 { text-align: center; font-size: 17px; line-height: 1.22; margin: 0 0 16px; text-transform: uppercase; }
          p { margin: 0 0 6px; orphans: 3; widows: 3; }
          ul, ol { margin: 0 0 8px 22px; padding: 0; }
          li { margin: 0 0 3px; }
          .center { text-align: center; }
          .title { font-weight: 700; }
          strong { font-weight: 700; }
          .signature-block { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 28px; align-items: end; break-inside: avoid; page-break-inside: avoid; }
          .single-signature { grid-template-columns: minmax(0, 1fr); max-width: 76mm; margin-left: auto; }
          .signature-card { text-align: center; }
          .signature-role { color: #667085; font-size: 11px; margin-bottom: 28px; text-transform: uppercase; }
          .signature-line { border-top: 1.5px solid #111827; margin-bottom: 8px; }
          .signature-name { font-weight: 700; min-height: 24px; }
          .erv-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 7px; table-layout: fixed; }
          .erv-table th, .erv-table td { border: 1px solid #9aa6b2; padding: 3px 2px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
          .erv-table .blocked-cell { background: #eef2f6; }
          .erv-acronyms { font-size: 8px; line-height: 1.35; }
          pre { white-space: pre-wrap; font: inherit; }
          .actions { position: fixed; right: 16px; top: 16px; z-index: 5; display: flex; justify-content: flex-end; max-width: calc(100vw - 32px); }
          .actions button { border: 0; background: #0b6bcb; color: #ffffff; border-radius: 8px; min-height: 42px; padding: 0 16px; font: 700 14px Arial, sans-serif; box-shadow: 0 8px 24px rgba(11, 107, 203, 0.22); white-space: normal; }
          .actions button:hover { background: #084d93; }
          @media screen and (max-width: 720px) {
            body,
            body.wide-document { padding: 10mm 7mm 14mm; }
            .actions { left: 12px; right: 12px; top: auto; bottom: 12px; }
            .actions button { width: 100%; }
          }
          @media print {
            html { background: #ffffff; }
            body,
            body.wide-document { width: auto; max-width: none; margin: 0; padding: 0; }
            .print-header { min-height: 16mm; margin-bottom: 2mm; }
            .print-brand,
            .print-brand img { width: 16mm; height: 16mm; }
            .actions { display: none; }
          }
        </style>
      </head>
      <body class="${bodyClass}">
        <div class="actions"><button onclick="window.print()">Ispiši / spremi PDF</button></div>
        <header class="print-header"><div class="print-brand"><img src="${escapeHtml(logoSrc)}" alt=""></div></header>
        <h1>${escapeHtml(documentData.title)}</h1>
        <main>${documentData.html || `<pre>${escapeHtml(documentData.body)}</pre>`}</main>
      </body>
    </html>
  `;
}

async function logoDataUrl() {
  try {
    const response = await fetch("logo.png");
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return "logo.png";
  }
}

function fileSlug(value) {
  return String(value || "dokument")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "dokument";
}

function signatureBlock(context) {
  return [
    `U ${context.place}, ${context.dateLabel}`,
    "",
    "Poslodavac: ____________________________",
    "Radnik: ________________________________"
  ].join("\n");
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function objectToForm(form, object) {
  Object.entries(object).forEach(([key, value]) => {
    if (form.elements[key] && !Array.isArray(value)) form.elements[key].value = value ?? "";
  });
}

function readSessionData() {
  localStorage.removeItem("contract-office-data");
  sessionStorage.removeItem("contract-office-session-data");
  const raw = sessionStorage.getItem(sessionDataKey);
  if (!raw) return structuredClone(emptySessionData);
  try {
    const data = JSON.parse(raw);
    return {
      employers: data.employers || [],
      accounting: data.accounting || [],
      employees: data.employees || []
    };
  } catch {
    return structuredClone(emptySessionData);
  }
}

function writeSessionData() {
  sessionStorage.setItem(sessionDataKey, JSON.stringify({
    employers: state.employers,
    accounting: state.accounting,
    employees: state.employees
  }));
}

function setDefaultDates() {
  const today = formatDate(new Date());
  $("#documentForm").elements.contract_date.value = today;
  $("#documentForm").elements.end_job_date.value = today;
  $("#documentForm").elements.start_date.value = today;
  $("#documentForm").elements.contract_starting_with.value = today;
  $("#documentForm").elements.a1_contract_date.value = today;
  $("#documentForm").elements.a1_end_date.value = today;
  $("#documentForm").elements.a1_signature_date.value = today;
  $("#documentForm").elements.services_contract_date.value = today;
  $("#documentForm").elements.services_end_date.value = today;
  $("#documentForm").elements.employment_doc_date.value = today;
  $("#documentForm").elements.employment_contract_date.value = today;
  $("#documentForm").elements.employment_start_date.value = today;
  $("#documentForm").elements.employment_end_date.value = today;
  $("#documentForm").elements.employment_vacation_from.value = today;
  $("#documentForm").elements.employment_vacation_to.value = today;
  $("#documentForm").elements.employment_vacation_year.value = new Date().getFullYear();
  $("#gfiForm").elements.report_date.value = today;
  $("#gfiForm").elements.report_year.value = new Date().getFullYear() - 1;
  $$(".date-hr-input").forEach(syncDatePickerFromDisplay);
}

function formatAddress(item = {}) {
  return [item.street, [item.postal, item.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

function formatDate(value) {
  if (!value) return "";
  if (value instanceof Date) return croatianDateFromDate(value);
  const raw = String(value).trim();
  if (/^\d{2}\.\d{2}\.\d{4}\.?$/.test(raw)) {
    return raw.endsWith(".") ? raw : `${raw}.`;
  }
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) return normalizeCroatianDate(raw);
  return croatianDateFromDate(date);
}

function croatianDateFromDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}.`;
}

function syncDatePickerFromDisplay(displayInput) {
  const picker = displayInput.nextElementSibling;
  if (!picker || picker.type !== "date") return;
  picker.value = croatianDateToIso(displayInput.value);
}

function croatianDateToIso(value) {
  const normalized = normalizeCroatianDate(value);
  const match = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})\.$/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function normalizeCroatianDate(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  const padded = digits.padEnd(8, "0").slice(0, 8);
  const day = clamp(Number(padded.slice(0, 2)) || 1, 1, 31);
  const month = clamp(Number(padded.slice(2, 4)) || 1, 1, 12);
  const year = clamp(Number(padded.slice(4, 8)) || new Date().getFullYear(), 1900, 2100);
  const maxDay = new Date(year, month, 0).getDate();
  return `${String(Math.min(day, maxDay)).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}.`;
}

function normalizeTime24(value) {
  const raw = String(value || "00:00").trim();
  const match = raw.match(/^(\d{1,2})(?::?(\d{0,2}))?$/);
  if (!match) return "00:00";
  const hours = clamp(Number(match[1] || 0), 0, 23);
  const minutes = clamp(Number((match[2] || "0").padEnd(2, "0")), 0, 59);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function croatianNonWorkingDays(year) {
  const easter = calculateEaster(year);
  const easterMonday = addDays(year, easter, 1);
  const corpusChristi = addDays(year, easter, 60);
  return [
    { day: 1, month: 1, name: "Nova godina" },
    { day: 6, month: 1, name: "Bogojavljenje / Sveta tri kralja" },
    { day: easter.day, month: easter.month, name: "Uskrs" },
    { day: easterMonday.day, month: easterMonday.month, name: "Uskrsni ponedjeljak" },
    { day: 1, month: 5, name: "Praznik rada" },
    { day: 30, month: 5, name: "Dan državnosti" },
    { day: corpusChristi.day, month: corpusChristi.month, name: "Tijelovo" },
    { day: 22, month: 6, name: "Dan antifašističke borbe" },
    { day: 5, month: 8, name: "Dan pobjede i domovinske zahvalnosti" },
    { day: 15, month: 8, name: "Velika Gospa" },
    { day: 1, month: 11, name: "Svi sveti" },
    { day: 18, month: 11, name: "Dan sjećanja" },
    { day: 25, month: 12, name: "Božić" },
    { day: 26, month: 12, name: "Sveti Stjepan" }
  ].sort((a, b) => a.month - b.month || a.day - b.day);
}

function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { day, month };
}

function addDays(year, dayMonth, offset) {
  const date = new Date(year, dayMonth.month - 1, dayMonth.day);
  date.setDate(date.getDate() + offset);
  return { day: date.getDate(), month: date.getMonth() + 1 };
}

function normalizeMoney(value) {
  const digits = String(value || "0").replace(/\D/g, "");
  const padded = digits.padStart(3, "0");
  const whole = String(Number(padded.slice(0, -2)));
  return `${whole}.${padded.slice(-2)}`;
}

function normalizePercent(value, minimum) {
  const numeric = Math.max(minimum, Number(String(value || "").replace(/\D/g, "")) || minimum);
  return `${numeric}%`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function htmlToText(html) {
  const element = document.createElement("div");
  element.innerHTML = html.replace(/<\/p>/g, "\n").replace(/<br>/g, "\n");
  return element.textContent.trim();
}

function createId(prefix, value) {
  const slug = String(value || crypto.randomUUID())
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return `${prefix}_${slug}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  window.setTimeout(() => element.classList.remove("show"), 2200);
}
