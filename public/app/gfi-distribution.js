// Builds "Odluka o raspodjeli dobiti i pokriću gubitka" HTML from parsed GFI-POD data (see gfi-parser.js)
// and the loss/gain fields the user fills in on the GFI form (see ui.js updateGfiDistributionUi).
import { escapeHtml, htmlToText, parseMoney, formatMoney } from "./utils.js";

function p(value, className = "") {
  return `<p class="${className}">${value}</p>`;
}
function centerTitle(value) {
  return p(value, "center title");
}
function b(value) {
  return `<strong>${escapeHtml(value)}</strong>`;
}

function eur(value) {
  return `${formatMoney(parseMoney(value))} EUR`;
}

export function buildGfiDistributionDocument(gfiData, formValues = {}) {
  const { company, rdg } = gfiData;
  const year = company.year || new Date().getFullYear();
  const result = rdg[186];
  const isLoss = !!(result && result.curr < 0);
  const signPlace = formValues.signPlace || company.city || "";
  const signDate = formValues.signDate || "";
  const heading = isLoss ? "ODLUKA O POKRIĆU GUBITKA" : "ODLUKA O UPORABI DOBITI";

  const bodyHtml = isLoss
    ? `
      ${p(`Uprava društva ${b(company.companyName)} donijela je odluku o pokriću gubitka koji je nastao u poslovnoj ${year}. godini u iznosu od ${b(eur(Math.abs(result ? result.curr : 0)))}.`)}
      ${p(escapeHtml(formValues.lossCoverageText || "Gubitak se prenosi u sljedeće razdoblje.").replace(/\n/g, "<br>"))}
    `
    : `
      ${p(`Uprava društva ${b(company.companyName)} donijela je odluku o uporabi ostvarene dobiti za poslovnu ${year}. godinu, kako slijedi:`)}
      ${p(`Dobit prije poreza: ${eur(formValues.gainBeforeTax)}`)}
      ${p(`Porez na dobit: ${eur(formValues.gainTax)}`)}
      ${p(`Dobit nakon poreza: ${eur(formValues.gainAfterTax)}`)}
      ${p(`Isplata članovima društva: ${eur(formValues.payoutToMembers)}`)}
      ${p(`Zadržana dobit za pokriće gubitka iz prethodnih godina: ${eur(formValues.retainedForLossCoverage)}`)}
      ${p(`Zadržana dobit: ${eur(formValues.retainedGain)}`)}
    `;

  const html = `
    ${p(b(company.companyName))}
    ${p(`${company.street}`)}
    ${p(`${company.postal} ${company.city}`)}
    ${p(`OIB: ${company.oib}`)}
    ${centerTitle(heading)}
    ${bodyHtml}
    ${p("* * *")}
    ${p(`${signPlace}, dana ${signDate || "____________"} godine`)}
    ${p(`Za ${company.companyName}, ovlaštena osoba Društva`)}
    <div class="signature-block single-signature">
      <div class="signature-card">
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(company.director)}</div>
      </div>
    </div>
  `;
  const parties = [company.companyName].filter(Boolean);
  return {
    title: `${heading} ZA ${year}. GODINU`,
    html,
    body: htmlToText(html),
    parties
  };
}
