import { jsonHeaders, send } from "../_lib/http.js";

// Runs before every /api/* route handler: CORS preflight, the D1 binding
// check, and a catch-all error responder that all routes previously repeated.
export async function onRequest(context) {
  const { request, env, next } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: jsonHeaders });
  }

  if (!env.CONTRACT_DB) {
    return send({ error: "D1 binding CONTRACT_DB is not configured." }, 500);
  }

  try {
    return await next();
  } catch (error) {
    return send({ error: error.message || "Unexpected API error." }, 500);
  }
}
