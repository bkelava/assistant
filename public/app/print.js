import { escapeHtml, fileSlug, toast } from "./utils.js";

const PAGE_LAYOUTS = {
  narrow: { widthMm: 210, heightMm: 297, marginMm: [16, 16, 20] },
  wide: { widthMm: 297, heightMm: 210, marginMm: [10, 10, 18] }
};

const CANVAS_ROOT_CLASS = "pdf-canvas-source";

function pageLayoutFor(documentData) {
  if (documentData.orientation === "landscape") return PAGE_LAYOUTS.wide;
  if (documentData.orientation === "portrait") return PAGE_LAYOUTS.narrow;
  return documentData.html?.includes("erv-table") ? PAGE_LAYOUTS.wide : PAGE_LAYOUTS.narrow;
}

// `rootSelector` is "body" for the standalone print document, or "&" (CSS nesting
// parent selector) when this is wrapped inside a scoped `.pdf-canvas-source { }`
// block for the html2canvas capture path — see buildScopedFragment().
function sharedStyleRules(logoSrc, rootSelector) {
  return `
    * { box-sizing: border-box; }
    html { background: #eef2f6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    ${rootSelector} { width: min(100%, 210mm); margin: 0 auto; padding: 14mm 18mm 18mm; font: 13.5px/1.38 Arial, sans-serif; color: #111827; background: #ffffff; }
    ${rootSelector}.wide-document { width: min(100%, 297mm); padding: 12mm; }
    .print-header { position: relative; z-index: 1; display: flex; justify-content: flex-end; align-items: flex-start; min-height: 22mm; margin-bottom: 2mm; }
    h1 { position: relative; z-index: 1; text-align: center; font-size: 17px; line-height: 1.22; margin: 0 0 16px; text-transform: uppercase; }
    main { position: relative; z-index: 1; text-align: justify; }
    .watermark { position: fixed; top: 50%; left: 50%; width: 160mm; height: 160mm; background-image: url('${logoSrc}'); background-repeat: no-repeat; background-size: contain; background-position: center; opacity: 0.12; pointer-events: none; z-index: 0; transform: translate(-50%, -50%) rotate(-30deg); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-brand { width: 22mm; height: 22mm; text-align: right; }
    .print-brand img { display: block; width: 22mm; height: 22mm; object-fit: contain; margin-left: auto; }
    p { margin: 0 0 6px; text-align: justify; orphans: 3; widows: 3; break-inside: avoid; page-break-inside: avoid; }
    ul, ol { margin: 0 0 8px 22px; padding: 0; }
    li { margin: 0 0 3px; text-align: justify; break-inside: avoid; page-break-inside: avoid; }
    .center { text-align: center; font-weight: 700; }
    .title { font-weight: 700; }
    strong { font-weight: 700; }
    .signature-block { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 28px; align-items: end; break-inside: avoid; page-break-inside: avoid; }
    .single-signature { grid-template-columns: minmax(0, 1fr); max-width: 76mm; margin-left: auto; }
    .signature-card { text-align: center; }
    .signature-role { color: #667085; font-size: 11px; margin-bottom: 28px; text-transform: uppercase; }
    .signature-line { border-top: 1.5px solid #111827; margin-bottom: 8px; }
    .signature-name { font-weight: 700; min-height: 24px; }
    .blank-row { display: grid; grid-template-columns: 42mm minmax(0, 1fr); gap: 8px; align-items: end; margin-bottom: 8px; text-align: left; }
    .blank-row span { font-weight: 700; }
    .blank-row i { display: block; min-height: 11mm; border: 1px solid #9aa6b2; background: #ffffff; }
    .blank-box { margin: 0 0 10px; padding: 8px; border: 1px solid #9aa6b2; background: #ffffff; text-align: left; break-inside: avoid; }
    .blank-box strong { display: block; margin-bottom: 5px; color: #475467; }
    .erv-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 7px; table-layout: fixed; }
    .erv-table th, .erv-table td { border: 1px solid #9aa6b2; padding: 3px 2px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
    .erv-table .blocked-cell { background: #eef2f6; }
    .erv-acronyms { font-size: 8px; line-height: 1.35; }
    .gfi-chart-block { margin: 0 0 18px; break-inside: avoid; page-break-inside: avoid; }
    pre { white-space: pre-wrap; font: inherit; text-align: justify; }
    .actions { position: fixed; right: 16px; top: 16px; z-index: 5; display: flex; justify-content: flex-end; max-width: calc(100vw - 32px); }
    .actions button { border: 0; background: #0b6bcb; color: #ffffff; border-radius: 8px; min-height: 42px; padding: 0 16px; font: 700 14px Arial, sans-serif; box-shadow: 0 8px 24px rgba(11, 107, 203, 0.22); white-space: normal; }
    .actions button:hover { background: #084d93; }
    @media screen and (max-width: 720px) {
      ${rootSelector},
      ${rootSelector}.wide-document { padding: 10mm 7mm 14mm; }
      .actions { left: 12px; right: 12px; top: auto; bottom: 12px; }
      .actions button { width: 100%; }
    }
    @media print {
      html { background: #ffffff; }
      ${rootSelector},
      ${rootSelector}.wide-document { width: auto; max-width: none; margin: 0; padding: 0; }
      .print-header { min-height: 20mm; margin-bottom: 2mm; }
      .print-brand,
      .print-brand img { width: 20mm; height: 20mm; }
      .actions { display: none; }
    }
  `;
}

function documentBodyHtml(documentData, logoSrc) {
  return `
    <div class="watermark" aria-hidden="true"></div>
    <div class="actions"><button onclick="window.print()">Ispiši / spremi PDF</button></div>
    <header class="print-header"><div class="print-brand"><img src="${escapeHtml(logoSrc)}" alt=""></div></header>
    <h1>${escapeHtml(documentData.title)}</h1>
    <main>${documentData.html || `<pre>${escapeHtml(documentData.body)}</pre>`}</main>
  `;
}

export function buildPrintableHtml(documentData, logoSrc) {
  const layout = pageLayoutFor(documentData);
  const isWideDocument = layout === PAGE_LAYOUTS.wide;
  const bodyClass = isWideDocument ? "wide-document" : "";
  const pageRule = `@page { size: auto; margin: ${layout.marginMm[0]}mm ${layout.marginMm[1]}mm ${layout.marginMm[2]}mm; }`;
  return `
    <!doctype html>
    <html lang="hr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(documentData.title)}</title>
        <style>
          ${pageRule}
          ${sharedStyleRules(logoSrc, "body")}
        </style>
      </head>
      <body class="${bodyClass}">
        ${documentBodyHtml(documentData, logoSrc)}
      </body>
    </html>
  `;
}

export async function logoDataUrl() {
  try {
    const response = await fetch("logo.png");
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return "logo.png";
  }
}

function downloadFilename(documentData, ext) {
  const uid = Math.random().toString(36).slice(2, 8);
  const partySlugs = (documentData.parties || []).map((p) => fileSlug(p).slice(0, 28)).filter(Boolean);
  return [fileSlug(documentData.title), ...partySlugs, new Date().toISOString().slice(0, 10), uid].join("-") + `.${ext}`;
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Renders directly into the main document (off-screen) rather than an iframe:
// html2canvas resolves the capture window from the target element's own document,
// and an iframe's nested Document/Window confused that resolution, producing blank
// captures. Styles are scoped under CANVAS_ROOT_CLASS (via CSS nesting) so neither
// this stylesheet's bare selectors (h1/p/...) leak into the app UI, nor the app's
// own global styles.css bleed into the rendered document.
//
// The captured node itself must stay `position: static` (default flow) — html2canvas
// measures/paints it via the *original* element before any clone/onclone adjustment
// runs, and both `position: absolute|fixed` and `visibility: hidden` on that element
// make it measure as zero-height (confirmed empirically: only a normal in-flow,
// visible element renders correctly). So the offscreen placement instead goes on a
// zero-size `position: absolute` *wrapper* around it.
function appendHiddenRenderNode(documentData, logoSrc, layout) {
  const isWideDocument = layout === PAGE_LAYOUTS.wide;
  const style = document.createElement("style");
  style.textContent = `.${CANVAS_ROOT_CLASS} { ${sharedStyleRules(logoSrc, "&")} }`;
  const node = document.createElement("div");
  node.className = `${CANVAS_ROOT_CLASS}${isWideDocument ? " wide-document" : ""}`;
  node.innerHTML = documentBodyHtml(documentData, logoSrc);
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:absolute; left:-10000px; top:0; width:0; height:0; overflow:visible;";
  wrapper.appendChild(node);
  document.head.appendChild(style);
  document.body.appendChild(wrapper);
  return { style, wrapper, node };
}

// html2canvas can't reproduce a `position: fixed` watermark repeating on every
// printed page, so it's excluded from the capture and drawn once per PDF page here instead.
function drawWatermarkOnAllPages(pdf, logoSrc) {
  const pageCount = pdf.internal.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const size = Math.min(pageWidth, pageHeight) * 0.75;
  const x = (pageWidth - size) / 2;
  const y = (pageHeight - size) / 2;
  for (let i = 1; i <= pageCount; i += 1) {
    pdf.setPage(i);
    pdf.saveGraphicsState();
    pdf.setGState(pdf.GState({ opacity: 0.12 }));
    pdf.addImage(logoSrc, x, y, size, size);
    pdf.restoreGraphicsState();
  }
}

export async function downloadPdf(documentData) {
  if (!window.html2pdf) {
    toast("PDF biblioteka nije učitana.");
    return;
  }
  const logo = await logoDataUrl();
  const layout = pageLayoutFor(documentData);
  let rendered;
  try {
    rendered = appendHiddenRenderNode(documentData, logo, layout);
    const pdf = await window.html2pdf()
      .set({
        margin: [layout.marginMm[0], layout.marginMm[1], layout.marginMm[2], layout.marginMm[1]],
        image: { type: "jpeg", quality: 0.92 },
        html2canvas: {
          scale: 2,
          backgroundColor: "#ffffff",
          ignoreElements: (el) => el.classList?.contains("actions") || el.classList?.contains("watermark")
        },
        jsPDF: { unit: "mm", format: [layout.widthMm, layout.heightMm] },
        pagebreak: { mode: ["css"], avoid: ["tr"] }
      })
      .from(rendered.node)
      .toPdf()
      .get("pdf");
    drawWatermarkOnAllPages(pdf, logo);
    triggerBlobDownload(pdf.output("blob"), downloadFilename(documentData, "pdf"));
    toast("PDF dokument je preuzet.");
  } catch (error) {
    toast("Generiranje PDF-a nije uspjelo.");
  } finally {
    rendered?.wrapper.remove();
    rendered?.style.remove();
  }
}

export function openDocument(documentData) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    toast("Preglednik je blokirao novi prozor.");
    return;
  }
  win.document.write(buildPrintableHtml(documentData, new URL("logo.png", window.location.href).href));
  win.document.close();
}
