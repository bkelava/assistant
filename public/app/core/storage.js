import { state, emptySessionData, sessionDataKey, draftsKey, defaultStaticDataUrl } from "./constants.js";
import { createId, toast } from "./utils.js";

// --- Session helpers ---

let dirty = false;

export function isDirty() {
  return dirty;
}

export function markSaved() {
  dirty = false;
}

export function snapshotData() {
  return { employers: state.employers, accounting: state.accounting, employees: state.employees };
}

export function readSessionData() {
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

export function writeSessionData() {
  sessionStorage.setItem(sessionDataKey, JSON.stringify(snapshotData()));
  dirty = true;
}

export function hasSessionData() {
  const raw = sessionStorage.getItem(sessionDataKey);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    return ["employers", "accounting", "employees"].some((key) => Array.isArray(data[key]) && data[key].length);
  } catch { return false; }
}

export function readDrafts() {
  try {
    const raw = localStorage.getItem(draftsKey);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function writeDrafts() {
  localStorage.setItem(draftsKey, JSON.stringify(state.drafts));
  dirty = true;
}

// --- Static file (Windows local server) helpers ---

export function getStaticDataUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("uvoz") || params.get("data") || defaultStaticDataUrl;
}

export function hasExplicitStaticDataUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.has("uvoz") || params.has("data");
}

export function applyImportedData(parsed) {
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

  const importedDrafts = Array.isArray(parsed.drafts) ? parsed.drafts : [];
  const validDrafts = importedDrafts.filter((d) => d && d.id && d.formData && d.type);
  if (validDrafts.length) {
    const existingIds = new Set(state.drafts.map((d) => d.id));
    validDrafts.forEach((d) => { if (!existingIds.has(d.id)) state.drafts.push(d); });
    writeDrafts();
  }

  writeSessionData();
  markSaved();
  return { employerCount: state.employers.length, employeeCount: state.employees.length, draftCount: validDrafts.length };
}

export async function loadStaticData(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      if (url === defaultStaticDataUrl && response.status === 404) return false;
      throw new Error(`HTTP ${response.status}`);
    }
    applyImportedData(await response.json());
    return true;
  } catch (error) {
    if (url !== defaultStaticDataUrl) toast("Statički JSON uvoz nije uspio. Provjerite putanju ili datoteku.");
    console.error(error);
    return false;
  }
}

export async function saveStaticDataFile() {
  const url = getStaticDataUrl();
  if (!url) return false;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(snapshotData(), null, 2)
    });
    if (response.ok) return true;
    console.warn(`Static JSON save returned ${response.status}.`);
  } catch (error) {
    console.warn("Static JSON save failed.", error);
  }
  return false;
}

// --- Core data operations ---

export async function loadData(forceStaticImport = false) {
  state.drafts = readDrafts();
  const staticDataUrl = getStaticDataUrl();
  if (staticDataUrl && (forceStaticImport || hasExplicitStaticDataUrl() || !hasSessionData())) {
    const loaded = await loadStaticData(staticDataUrl);
    if (loaded) return;
  }
  const cached = readSessionData();
  state.employers = cached.employers;
  state.accounting = cached.accounting;
  state.employees = cached.employees;
  state.drafts = readDrafts();
  writeSessionData();
  markSaved();
}

export async function persist(resource, record) {
  const collection = state[resource];
  if (!collection) return false;
  const existingIndex = collection.findIndex((item) => item.id === record.id);
  if (existingIndex >= 0) collection.splice(existingIndex, 1, record);
  else collection.push(record);
  writeSessionData();
  return saveStaticDataFile();
}

export async function importJsonData(event, onSuccess) {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const parsed = JSON.parse(await file.text());
    const summary = applyImportedData(parsed);
    const savedToFile = await saveStaticDataFile();
    onSuccess?.();
    const draftMsg = summary.draftCount ? `, ${summary.draftCount} nacrta` : "";
    const baseMsg = `Uvezeno: ${summary.employerCount} poslodavaca, ${summary.employeeCount} radnika${draftMsg}.`;
    toast(savedToFile ? `${baseMsg} Spremljeno u JSON datoteku.` : baseMsg);
  } catch {
    toast("Uvoz nije uspio. Provjerite JSON datoteku.");
  } finally {
    input.value = "";
  }
}
