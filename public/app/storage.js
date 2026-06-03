import { state, emptySessionData, sessionDataKey, draftsKey } from "./constants.js";
import { createId, toast } from "./utils.js";

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
  sessionStorage.setItem(sessionDataKey, JSON.stringify({
    employers: state.employers,
    accounting: state.accounting,
    employees: state.employees
  }));
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
}

export async function loadData() {
  const cached = readSessionData();
  state.employers = cached.employers;
  state.accounting = cached.accounting;
  state.employees = cached.employees;
  state.drafts = readDrafts();
  writeSessionData();
}

export async function persist(resource, record) {
  const collection = state[resource];
  if (!collection) return;
  const existingIndex = collection.findIndex((item) => item.id === record.id);
  if (existingIndex >= 0) collection.splice(existingIndex, 1, record);
  else collection.push(record);
  writeSessionData();
}

export async function importJsonData(event, onSuccess) {
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

    const importedDrafts = Array.isArray(parsed.drafts) ? parsed.drafts : [];
    const validDrafts = importedDrafts.filter((d) => d && d.id && d.formData && d.type);
    if (validDrafts.length) {
      const existingIds = new Set(state.drafts.map((d) => d.id));
      validDrafts.forEach((d) => { if (!existingIds.has(d.id)) state.drafts.push(d); });
      writeDrafts();
    }

    writeSessionData();
    onSuccess?.();
    const draftMsg = validDrafts.length ? `, ${validDrafts.length} nacrta` : "";
    toast(`Uvezeno: ${state.employers.length} poslodavaca, ${state.employees.length} radnika${draftMsg}.`);
  } catch {
    toast("Uvoz nije uspio. Provjerite JSON datoteku.");
  } finally {
    input.value = "";
  }
}
