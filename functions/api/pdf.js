import puppeteer from "@cloudflare/puppeteer";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.BROWSER) {
    return json({ error: "Browser Rendering binding (BROWSER) is not configured." }, 500);
  }

  const { html } = await request.json();
  if (!html) {
    return json({ error: "Missing html in request body." }, 400);
  }

  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });
    return new Response(pdf, {
      headers: { ...corsHeaders, "content-type": "application/pdf" }
    });
  } finally {
    await browser.close();
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" }
  });
}
