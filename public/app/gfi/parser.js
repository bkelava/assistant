// Parser for the official FINA GFI-POD Excel export (RefStr / Bilanca / RDG sheets).
// The workbook layout is a fixed government form, so cell addresses are stable across companies and years.

const REFSTR_MAP = {
  periodFrom: [3, 2],
  periodTo: [3, 5],
  subjectTypeCode: [6, 2],
  subjectTypeLabel: [6, 3],
  year: [11, 5],
  reportTypeCode: [16, 2],
  reportTypeLabel: [16, 3],
  purposeCode: [18, 2],
  purposeLabel: [18, 3],
  standard: [18, 13],
  consolidated: [20, 2],
  audited: [20, 8],
  auditOpinionCode: [22, 2],
  auditOpinionLabel: [22, 3],
  oib: [26, 2],
  mb: [26, 7],
  mbs: [26, 12],
  companyName: [28, 2],
  postal: [30, 2],
  city: [30, 5],
  street: [32, 2],
  email: [34, 2],
  phone: [34, 11],
  municipalityCode: [38, 2],
  municipality: [38, 3],
  countyCode: [38, 9],
  county: [38, 10],
  nkdCode: [41, 2],
  nkd: [41, 3],
  autonomyCode: [43, 2],
  autonomy: [43, 3],
  sizeCode: [49, 2],
  size: [49, 3],
  ownershipCode: [51, 2],
  ownership: [51, 3],
  capitalDomesticPct: [53, 2],
  capitalForeignPct: [53, 5],
  employeesPrev: [55, 2],
  employeesCurr: [55, 5],
  employeesHoursPrev: [57, 2],
  employeesHoursCurr: [57, 5],
  monthsPrev: [59, 2],
  monthsCurr: [59, 5],
  accountingServiceMb: [63, 1],
  accountingServiceName: [65, 1],
  contactPerson: [67, 2],
  contactPhone: [69, 2],
  contactEmail: [71, 2],
  director: [74, 0]
};

function cellAt(rows, r, c) {
  const row = rows[r];
  if (!row) return "";
  const value = row[c];
  return value === undefined || value === null ? "" : value;
}

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function cleanId(value) {
  const text = cleanText(value);
  return text.replace(/\.0$/, "");
}

function toNumber(value) {
  if (typeof value === "number") return value;
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sheetRows(workbook, name) {
  const sheet = workbook.Sheets[name];
  if (!sheet) throw new Error(`Datoteka ne sadrži list "${name}" – ovo ne izgleda kao GFI-POD obrazac.`);
  return window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true });
}

function extractCompany(rows) {
  const company = {};
  Object.entries(REFSTR_MAP).forEach(([key, [r, c]]) => {
    company[key] = cellAt(rows, r, c);
  });
  ["oib", "mb", "mbs", "accountingServiceMb"].forEach((key) => {
    company[key] = cleanId(company[key]);
  });
  ["companyName", "postal", "city", "street", "email", "phone", "municipality", "county", "nkd", "nkdCode",
    "director", "contactPerson", "contactPhone", "contactEmail", "accountingServiceName", "size", "ownership",
    "autonomy", "standard", "subjectTypeLabel", "reportTypeLabel", "purposeLabel", "auditOpinionLabel",
    "consolidated", "audited", "periodFrom", "periodTo"].forEach((key) => {
    company[key] = cleanText(company[key]);
  });
  ["year", "capitalDomesticPct", "capitalForeignPct", "employeesPrev", "employeesCurr",
    "employeesHoursPrev", "employeesHoursCurr", "monthsPrev", "monthsCurr"].forEach((key) => {
    company[key] = toNumber(company[key]);
  });
  company.phone = company.phone.replace(/^\/+/, "");
  return company;
}

function extractAopTable(rows) {
  const table = {};
  rows.forEach((row) => {
    const name = row[0];
    const aopRaw = row[6];
    if (typeof name !== "string" || !name.trim()) return;
    if (aopRaw === "" || aopRaw === undefined || aopRaw === null) return;
    const aop = Number(aopRaw);
    if (!Number.isFinite(aop) || aop <= 0) return;
    table[aop] = {
      name: cleanText(name),
      prev: toNumber(row[8]),
      curr: toNumber(row[9])
    };
  });
  return table;
}

export function parseGfiWorkbook(arrayBuffer) {
  if (!window.XLSX) throw new Error("XLSX biblioteka nije učitana.");
  const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
  const company = extractCompany(sheetRows(workbook, "RefStr"));
  const bilanca = extractAopTable(sheetRows(workbook, "Bilanca"));
  const rdg = extractAopTable(sheetRows(workbook, "RDG"));
  return { company, bilanca, rdg };
}

export async function parseGfiFile(file) {
  const buffer = await file.arrayBuffer();
  return parseGfiWorkbook(buffer);
}
