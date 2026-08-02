import { text, required } from "./http.js";

export function mapEmployer(row) {
  return {
    id: row.id,
    company_name: row.company_name,
    street: row.street,
    city: row.city,
    postal: String(row.postal || ""),
    vat: row.vat,
    director: row.director
  };
}

export function normalizeEmployer(input) {
  return {
    id: text(input.id),
    company_name: required(input.company_name, "Company name"),
    street: text(input.street),
    city: text(input.city),
    postal: text(input.postal),
    vat: text(input.vat),
    director: text(input.director)
  };
}

export async function listEmployers(db) {
  const { results } = await db.prepare("SELECT * FROM employers ORDER BY company_name COLLATE NOCASE").all();
  return results.map(mapEmployer);
}
