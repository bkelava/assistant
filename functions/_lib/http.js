export const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type"
};

export function send(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders
  });
}

export function text(value) {
  return value == null ? "" : String(value).trim();
}

export function required(value, label) {
  const normalized = text(value);
  if (!normalized) throw new Error(`${label} is required.`);
  return normalized;
}

export function createId(prefix, value) {
  const slug = String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return `${prefix}_${slug || crypto.randomUUID()}`;
}

export function safeJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// functions/api/[[id]].js catch-all segments arrive as an array (zero or more
// path parts); a single dynamic [id] segment would arrive as a string instead.
export function firstParam(param) {
  return Array.isArray(param) ? param[0] || "" : param || "";
}
