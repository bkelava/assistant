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
      ${p(`<strong>${escapeHtml(formValues.lossCoverageText || "Gubitak se prenosi u sljedeće razdoblje.").replace(/\n/g, "<br>")}</strong>`)}
    `
    : `
      ${p(`Uprava društva ${b(company.companyName)} donijela je odluku o uporabi ostvarene dobiti za poslovnu ${year}. godinu, kako slijedi:`)}
      ${p(`Dobit prije poreza: ${b(eur(formValues.gainBeforeTax))}`)}
      ${p(`Porez na dobit: ${b(eur(formValues.gainTax))}`)}
      ${p(`Dobit nakon poreza: ${b(eur(formValues.gainAfterTax))}`)}
      ${p(`Isplata članovima društva: ${b(eur(formValues.payoutToMembers))}`)}
      ${p(`Zadržana dobit za pokriće gubitka iz prethodnih godina: ${b(eur(formValues.retainedForLossCoverage))}`)}
      ${p(`Zadržana dobit: ${b(eur(formValues.retainedGain))}`)}
    `;

  const html = `
    ${p(b(company.companyName))}
    ${p(b(company.street))}
    ${p(b(`${company.postal} ${company.city}`))}
    ${p(`OIB: ${b(company.oib)}`)}
    ${centerTitle(heading)}
    ${bodyHtml}
    ${p("* * *")}
    ${p(`${b(signPlace)}, dana ${signDate ? b(signDate) : "____________"}`)}
    ${p(`Za ${b(company.companyName)}, ovlaštena osoba Društva`)}
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
    hideHeading: true,
    html,
    body: htmlToText(html),
    parties
  };
}
