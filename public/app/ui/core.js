import { $, $$, state, appVersion, changelog } from "../core/constants.js";
import { escapeHtml, toast, formatDate, createId, normalizeMoney, normalizePercent, normalizeCroatianDate, syncDatePickerFromDisplay } from "../core/utils.js";
import { loadData, importJsonData, isDirty } from "../core/storage.js";
import { isFileSystemAccessSupported, openLocalFile, saveLocalFile, currentFileName } from "../io/localfile.js";
import { enhanceCroatianDatePickers, enhanceCroatianTimePickers, focusForm } from "./shared.js";
import { bindNavigation, showView } from "./nav.js";
import { employerRepository, employeeRepository } from "../core/repository.js";
import { bindEmployers, renderEmployers } from "./employers.js";
import { bindAccounting, renderAccounting } from "./accounting.js";
import { bindEmployees, renderEmployees } from "./employees.js";
import { hydrateContractControls, setDefaultDates, bindDocumentForm, renderSelects } from "./documents.js";
import { bindGfi } from "./gfi.js";
import { bindDrafts, renderDrafts } from "./drafts.js";
import { buildDocument } from "../documents/index.js";

// --- Initialization ---

export async function init() {
  hydrateContractControls();
  enhanceCroatianDatePickers();
  enhanceCroatianTimePickers();
  setDefaultDates();
  bindNavigation();
  bindEmployers(render);
  bindAccounting(render);
  bindEmployees(render);
  bindDocumentForm();
  bindGfi();
  bindDrafts();
  bindGlobalFormBehaviors();
  bindDashboardActions();
  $("#sidebarFooter").textContent = `v${appVersion}`;
  $("#footerVersion").textContent = appVersion;
  await loadData();
  render();
}

// --- Global render ---

function render() {
  $("#employerCount").textContent = state.employers.length;
  $("#accountingCount").textContent = state.accounting.length;
  $("#employeeCount").textContent = state.employees.length;
  $("#onboardingPanel").hidden = state.employers.length > 0;
  renderEmployers(render);
  renderAccounting(render);
  renderEmployees(render);
  renderSelects();
  renderDrafts();
  $("#documentPreview").innerHTML = buildDocument().html;
  updateFileStatus();
}

// --- File status / local file controls ---

function updateFileStatus() {
  const el = $("#fileStatus");
  const name = currentFileName();
  if (!name) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  el.textContent = isDirty() ? `${name} (nespremljene izmjene)` : `${name} (spremljeno)`;
  el.classList.toggle("dirty", isDirty());
}

function bindLocalFileControls() {
  if (!isFileSystemAccessSupported()) return;
  $("#openFileButton").hidden = false;
  $("#saveFileButton").hidden = false;
  $("#saveAsFileButton").hidden = false;

  $("#openFileButton").addEventListener("click", async () => {
    try {
      const { fileName, summary } = await openLocalFile();
      render();
      const draftMsg = summary.draftCount ? `, ${summary.draftCount} nacrta` : "";
      toast(`Otvoreno ${fileName}: ${summary.employerCount} poslodavaca, ${summary.employeeCount} radnika${draftMsg}.`);
    } catch (error) {
      if (error.name !== "AbortError") toast("Otvaranje datoteke nije uspjelo.");
    }
  });

  const save = async (saveAs) => {
    try {
      const { fileName } = await saveLocalFile({ saveAs });
      updateFileStatus();
      toast(`Spremljeno u ${fileName}.`);
    } catch (error) {
      if (error.name !== "AbortError") toast("Spremanje nije uspjelo.");
    }
  };
  $("#saveFileButton").addEventListener("click", () => save(false));
  $("#saveAsFileButton").addEventListener("click", () => save(true));

  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      save(event.shiftKey);
    }
  });
}

// --- Date / time pickers ---

// --- Global form behaviors (cross-view input normalizers) ---

function bindGlobalFormBehaviors() {
  $$(".money-input").forEach((input) => input.addEventListener("blur", () => { input.value = normalizeMoney(input.value); }));
  $$(".percent-input").forEach((input) => input.addEventListener("blur", () => { input.value = normalizePercent(input.value, Number(input.dataset.minimum)); }));
  $$(".date-hr-input").forEach((input) => {
    input.addEventListener("blur", () => {
      input.value = normalizeCroatianDate(input.value);
      syncDatePickerFromDisplay(input);
    });
  });
  $$("[data-reset-form]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = document.getElementById(button.dataset.resetForm);
      form.reset();
      form.elements.id.value = "";
      renderSelects();
    });
  });
}


// --- Dashboard / top-bar actions ---

function bindDashboardActions() {
  $("#refreshButton").addEventListener("click", async () => {
    await loadData(true);
    render();
    toast("Podaci sesije su osvježeni.");
  });
  bindLocalFileControls();
  $("#onboardingAddEmployerButton").addEventListener("click", () => {
    showView("employers");
    focusForm("employerForm", "company_name");
  });
  $("#onboardingDemoButton").addEventListener("click", loadDemoData);
  $("#changelogToggleButton")?.addEventListener("click", () => {
    const panel = $("#changelogPanel");
    const isHidden = panel.classList.contains("hidden");
    if (isHidden) renderChangelog();
    panel.classList.toggle("hidden", !isHidden);
  });
  $("#changelogCloseButton")?.addEventListener("click", () => {
    $("#changelogPanel").classList.add("hidden");
  });
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


function renderChangelog() {
  const list = $("#changelogList");
  if (!list) return;
  list.innerHTML = changelog.map((entry) => `
    <div class="changelog-entry">
      <span class="changelog-date">${escapeHtml(formatDate(entry.date))}</span>
      <span>${escapeHtml(entry.summary)}</span>
    </div>
  `).join("");
}

async function loadDemoData() {
  const employer = {
    id: createId("employer", "demo-obrt"),
    company_name: "Demo Obrt d.o.o.",
    street: "Ilica 10",
    city: "Zagreb",
    postal: "10000",
    vat: "12345678901",
    director: "Ana Anić"
  };
  const employee = {
    id: createId("employee", "demo-marko-maric"),
    name: "Marko",
    lastname: "Marić",
    street: "Ilica 10",
    city: "Zagreb",
    postal: "10000",
    personal_id: "98765432101",
    employer_names: [employer.company_name]
  };
  await employerRepository.save(employer);
  await employeeRepository.save(employee);
  render();
  toast("Demo podaci su dodani. Slobodno ih uredite ili izbrišite kad više ne trebaju.");
}
