import { $ } from "../core/constants.js";
import { escapeHtml, formatDate, formatMoney, parseMoney, htmlToText, formToObject } from "../core/utils.js";
import { p, b, centerTitle } from "../documents/shared.js";

function gfiEur(value) {
  return `${formatMoney(parseMoney(value))} EUR`;
}

export function buildGfiDocument() {
  const data = formToObject($("#gfiForm"));
  const year = data.report_year || new Date().getFullYear();
  const html = `
    ${p(b(data.company_name || ""))}
    ${p(`${data.address || ""}, ${data.city || ""}`)}
    ${p(`OIB: ${b(data.oib || "")}`)}
    ${centerTitle("ODLUKA O UTVRĐIVANJU GODIŠNJIH FINANCIJSKIH IZVJEŠTAJA")}
    ${p(`Na dan ${b(formatDate(data.report_date))} direktor ${b(data.director || "")} donosi odluku za poslovnu godinu ${b(String(year))}.`)}
    ${p(`Dobit prije poreza: ${b(gfiEur(data.gain_before_tax))}`)}
    ${p(`Porez na dobit: ${b(gfiEur(data.gain_tax))}`)}
    ${p(`Dobit nakon poreza: ${b(gfiEur(data.gain_after_tax))}`)}
    ${p(data.loss_coverage ? `Pokriće gubitka: ${b(data.loss_coverage)}` : "Dobit se raspoređuje sukladno odluci članova društva.")}
    <div class="signature-block single-signature">
      <div class="signature-card">
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(data.director || "")}</div>
      </div>
    </div>
  `;
  return {
    title: "GFI dokument",
    hideHeading: true,
    html,
    body: htmlToText(html),
    parties: [data.company_name].filter(Boolean)
  };
}
