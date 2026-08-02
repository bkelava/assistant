import { send, createId, firstParam } from "../../_lib/http.js";
import { mapEmployer, normalizeEmployer, listEmployers } from "../../_lib/employers.js";

export async function onRequestGet(context) {
  const db = context.env.CONTRACT_DB;
  const id = firstParam(context.params.id);
  if (!id) return send(await listEmployers(db));
  const employer = await db.prepare("SELECT * FROM employers WHERE id = ?").bind(id).first();
  return employer ? send(mapEmployer(employer)) : send({ error: "Employer not found." }, 404);
}

export async function onRequestPost(context) {
  const db = context.env.CONTRACT_DB;
  const input = await context.request.json();
  const employer = normalizeEmployer(input);
  employer.id = employer.id || createId("employer", employer.company_name || crypto.randomUUID());
  await db.prepare(
    `INSERT INTO employers (id, company_name, street, city, postal, vat, director, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(employer.id, employer.company_name, employer.street, employer.city, employer.postal, employer.vat, employer.director).run();
  return send(employer, 201);
}

export async function onRequestPut(context) {
  const id = firstParam(context.params.id);
  if (!id) return send({ error: "Method not allowed." }, 405);
  const db = context.env.CONTRACT_DB;
  const employer = normalizeEmployer(await context.request.json());
  employer.id = id;
  await db.prepare(
    `UPDATE employers
     SET company_name = ?, street = ?, city = ?, postal = ?, vat = ?, director = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(employer.company_name, employer.street, employer.city, employer.postal, employer.vat, employer.director, id).run();
  return send(employer);
}

export async function onRequestDelete(context) {
  const id = firstParam(context.params.id);
  if (!id) return send({ error: "Method not allowed." }, 405);
  const db = context.env.CONTRACT_DB;
  await db.prepare("DELETE FROM employers WHERE id = ?").bind(id).run();
  return send({ ok: true });
}
