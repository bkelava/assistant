import { text, required, safeJsonArray } from "./http.js";

export function mapEmployee(row) {
  return {
    id: row.id,
    name: row.name,
    lastname: row.lastname,
    street: row.street,
    city: row.city,
    postal: String(row.postal || ""),
    personal_id: row.personal_id,
    employer_names: safeJsonArray(row.employer_names)
  };
}

export function normalizeEmployee(input) {
  return {
    id: text(input.id),
    name: required(input.name, "Name"),
    lastname: required(input.lastname, "Last name"),
    street: text(input.street),
    city: text(input.city),
    postal: text(input.postal),
    personal_id: required(input.personal_id, "Personal ID"),
    employer_names: Array.isArray(input.employer_names) ? input.employer_names.map(text).filter(Boolean) : []
  };
}

export async function listEmployees(db) {
  const { results } = await db.prepare("SELECT * FROM employees ORDER BY lastname COLLATE NOCASE, name COLLATE NOCASE").all();
  return results.map(mapEmployee);
}
