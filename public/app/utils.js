import { $, state } from "./constants.js";

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  window.setTimeout(() => element.classList.remove("show"), 2200);
}

export function createId(prefix, value) {
  const slug = String(value || crypto.randomUUID())
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return `${prefix}_${slug}`;
}

export function htmlToText(html) {
  const element = document.createElement("div");
  element.innerHTML = html.replace(/<\/p>/g, "\n").replace(/<br>/g, "\n");
  return element.textContent.trim();
}

export function formatAddress(item = {}) {
  return [item.street, [item.postal, item.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

export function getEmployer(id) {
  return state.employers.find((item) => item.id === id) || state.employers[0] || {};
}

export function getEmployee(id) {
  return state.employees.find((item) => item.id === id) || state.employees[0] || {};
}

export function partyDisplayName(party = {}) {
  return party.company_name || `${party.name || ""} ${party.lastname || ""}`.trim();
}

export function partyOib(party = {}) {
  return party.vat || party.personal_id || "";
}

export function formatDate(value) {
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

export function croatianDateFromDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}.`;
}

export function croatianDateTimeFromDate(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${croatianDateFromDate(date)} u ${hours}:${minutes}:${seconds}`;
}

export function normalizeCroatianDate(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  const padded = digits.padEnd(8, "0").slice(0, 8);
  const day = clamp(Number(padded.slice(0, 2)) || 1, 1, 31);
  const month = clamp(Number(padded.slice(2, 4)) || 1, 1, 12);
  const year = clamp(Number(padded.slice(4, 8)) || new Date().getFullYear(), 1900, 2100);
  const maxDay = new Date(year, month, 0).getDate();
  return `${String(Math.min(day, maxDay)).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}.`;
}

export function croatianDateToIso(value) {
  const normalized = normalizeCroatianDate(value);
  const match = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})\.$/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function syncDatePickerFromDisplay(displayInput) {
  const picker = displayInput.nextElementSibling;
  if (!picker || picker.type !== "date") return;
  picker.value = croatianDateToIso(displayInput.value);
}

export function normalizeTime24(value) {
  const raw = String(value || "00:00").trim();
  const match = raw.match(/^(\d{1,2})(?::?(\d{0,2}))?$/);
  if (!match) return "00:00";
  const hours = clamp(Number(match[1] || 0), 0, 23);
  const minutes = clamp(Number((match[2] || "0").padEnd(2, "0")), 0, 59);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Formats a JS number as Croatian money text: "." groups thousands, "," is the decimal mark.
export function formatMoney(value) {
  const number = Number(value) || 0;
  const rounded = Math.abs(number) < 0.005 ? 0 : number;
  return rounded.toLocaleString("hr-HR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Parses Croatian-formatted money text ("1.234,56") back into a JS number.
// Numbers pass through unchanged (they're never in "." = thousands notation).
export function parseMoney(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const negative = raw.startsWith("-");
  const cleaned = raw.replace(/[^\d,]/g, "").replace(",", ".");
  const number = Number(cleaned);
  return Number.isFinite(number) ? (negative ? -Math.abs(number) : number) : 0;
}

// Onblur normalizer for <input class="money-input">. Pure-digit typing keeps the
// existing keypad-style "last two digits are cents" convenience (e.g. "150000" ->
// "1.500,00"); anything already containing "," or "." is treated as an explicit
// Croatian-formatted value and just reformatted, not re-masked.
export function normalizeMoney(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "0,00";
  if (/[.,]/.test(raw)) return formatMoney(parseMoney(raw));
  const negative = raw.startsWith("-");
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "0,00";
  const padded = digits.padStart(3, "0");
  const number = Number(`${padded.slice(0, -2)}.${padded.slice(-2)}`);
  return formatMoney(negative ? -number : number);
}

export function normalizePercent(value, minimum) {
  const numeric = Math.max(minimum, Number(String(value || "").replace(/\D/g, "")) || minimum);
  return `${numeric}%`;
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function croatianNonWorkingDays(year) {
  const easter = calculateEaster(year);
  const easterMonday = addDays(year, easter, 1);
  const corpusChristi = addDays(year, easter, 60);
  return [
    { day: 1,  month: 1,  name: "Nova godina" },
    { day: 6,  month: 1,  name: "Bogojavljenje / Sveta tri kralja" },
    { day: easter.day,       month: easter.month,       name: "Uskrs" },
    { day: easterMonday.day, month: easterMonday.month, name: "Uskrsni ponedjeljak" },
    { day: 1,  month: 5,  name: "Praznik rada" },
    { day: 30, month: 5,  name: "Dan državnosti" },
    { day: corpusChristi.day, month: corpusChristi.month, name: "Tijelovo" },
    { day: 22, month: 6,  name: "Dan antifašističke borbe" },
    { day: 5,  month: 8,  name: "Dan pobjede i domovinske zahvalnosti" },
    { day: 15, month: 8,  name: "Velika Gospa" },
    { day: 1,  month: 11, name: "Svi sveti" },
    { day: 18, month: 11, name: "Dan sjećanja" },
    { day: 25, month: 12, name: "Božić" },
    { day: 26, month: 12, name: "Sveti Stjepan" }
  ].sort((a, b) => a.month - b.month || a.day - b.day);
}

export function calculateEaster(year) {
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

export function addDays(year, dayMonth, offset) {
  const date = new Date(year, dayMonth.month - 1, dayMonth.day);
  date.setDate(date.getDate() + offset);
  return { day: date.getDate(), month: date.getMonth() + 1 };
}

export function joinDateOrDescription(dateValue, description) {
  return [dateValue, description].filter(Boolean).join(" - ");
}

export function fileSlug(value) {
  return String(value || "dokument")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "dokument";
}

export function titleCaseDocument(value) {
  return String(value || "")
    .toLocaleLowerCase("hr-HR")
    .replace(/(^|\s)(\p{L})/gu, (_, space, letter) => `${space}${letter.toLocaleUpperCase("hr-HR")}`);
}

export function numberWordHr(value) {
  return { 2: "dva", 3: "tri", 4: "četiri", 5: "pet", 6: "šest" }[Number(value)] || String(value);
}

export function numberOptions(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const value = start + index;
    return `<option value="${value}">${value}</option>`;
  }).join("");
}

export function vacationDaysText(value, description = "") {
  const days = `${value || "0"} dana`;
  const cleanDescription = String(description || "").trim();
  return cleanDescription && cleanDescription !== "(-)" ? `${days} ${cleanDescription}` : days;
}

export function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function objectToForm(form, object) {
  Object.entries(object).forEach(([key, value]) => {
    if (form.elements[key] && !Array.isArray(value)) form.elements[key].value = value ?? "";
  });
}

export function safeMultiline(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

export function linesToListItems(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

export function humanizeFieldName(name) {
  return String(name || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
