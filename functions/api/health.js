import { send } from "../_lib/http.js";

export async function onRequestGet() {
  return send({ ok: true, storage: "d1" });
}
