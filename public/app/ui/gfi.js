import { $, $$ } from "../core/constants.js";
import { toast, formatDate, formatMoney, parseMoney, syncDatePickerFromDisplay, croatianDateTimeFromDate } from "../core/utils.js";
import { clearFieldInvalid, withBusyButton, validateForm } from "./shared.js";
import { buildGfiDocument } from "../documents/index.js";
import { downloadPrintableHtml } from "../io/print.js";
import { parseGfiFile } from "../gfi/parser.js";
import { buildGfiNotesDocument } from "../gfi/notes.js";
import { buildGfiDistributionDocument } from "../gfi/distribution.js";

let gfiParsedData = null;

export function fillGfiFormFromParsedData(gfiData) {
  const { company, rdg } = gfiData;
  const gf = $("#gfiForm").elements;
  gf.company_name.value = company.companyName;
  gf.address.value = company.street;
  gf.city.value = `${company.postal} ${company.city}`.trim();
  gf.oib.value = company.oib;
  gf.director.value = company.director;
  gf.report_year.value = company.year;
  gf.report_date.value = formatDate(company.periodTo);
  const result = rdg[186];
  gf.gain_before_tax.value = rdg[182] ? formatMoney(rdg[182].curr) : "";
  gf.gain_tax.value = rdg[185] ? formatMoney(rdg[185].curr) : "";
  gf.gain_after_tax.value = result ? formatMoney(result.curr) : "";
  gf.loss_coverage.value = result && result.curr < 0
    ? `Gubitak u iznosu ${formatMoney(Math.abs(result.curr))} EUR prenosi se u sljedeće razdoblje.`
    : "";
  $$(".date-hr-input").forEach(syncDatePickerFromDisplay);
  updateGfiDistributionUi(gfiData);
}

export function recalcGfiRetainedGain() {
  const gf = $("#gfiForm").elements;
  const total = parseMoney(gf.gain_after_tax.value);
  const payout = parseMoney(gf.payout_to_members.value);
  const coverage = parseMoney(gf.retained_for_loss_coverage.value);
  gf.retained_gain.value = formatMoney(total - payout - coverage);
}

export function updateGfiDistributionUi(gfiData) {
  const box = $("#gfiDistributionBox");
  const statusEl = $("#gfiDistributionStatus");
  const lossFields = $("#gfiLossFields");
  const gainFields = $("#gfiGainFields");
  const gainSummaryFields = $("#gfiGainSummaryFields");
  if (!gfiData || !gfiData.rdg) {
    box.classList.add("hidden");
    gainSummaryFields.classList.remove("hidden");
    return;
  }
  const result = gfiData.rdg[186];
  const isLoss = !!(result && result.curr < 0);
  box.classList.remove("hidden");
  if (isLoss) {
    statusEl.textContent = `Utvrđen je GUBITAK u iznosu ${formatMoney(Math.abs(result.curr))} EUR. Unesite kako će gubitak biti pokriven.`;
    statusEl.classList.remove("success");
    statusEl.classList.add("warning");
    lossFields.classList.remove("hidden");
    gainFields.classList.add("hidden");
    gainSummaryFields.classList.add("hidden");
  } else {
    const gain = result ? result.curr : 0;
    statusEl.textContent = `Utvrđena je DOBIT u iznosu ${formatMoney(gain)} EUR. Rasporedite iznos na isplatu članovima i/ili zadržanu dobit.`;
    statusEl.classList.remove("warning");
    statusEl.classList.add("success");
    gainFields.classList.remove("hidden");
    lossFields.classList.add("hidden");
    gainSummaryFields.classList.remove("hidden");
    const gf = $("#gfiForm").elements;
    gf.payout_to_members.value = "0,00";
    gf.retained_for_loss_coverage.value = "0,00";
    recalcGfiRetainedGain();
  }
}

// --- Data operations (entity save/remove) ---

// --- Bindings ---

export function bindGfi() {
  $("#gfiForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) return;
    await downloadPrintableHtml(buildGfiDocument());
  });
  $("#gfiForm").addEventListener("input", clearFieldInvalid);
  $("#gfiForm").addEventListener("change", clearFieldInvalid);
  $("#gfiFileInput").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const statusEl = $("#gfiImportStatus");
    try {
      gfiParsedData = await parseGfiFile(file);
      fillGfiFormFromParsedData(gfiParsedData);
      statusEl.textContent = `Učitano: ${gfiParsedData.company.companyName} (OIB ${gfiParsedData.company.oib}), razdoblje ${gfiParsedData.company.periodFrom}–${gfiParsedData.company.periodTo}.`;
      statusEl.classList.add("success");
      toast("GFI podaci su učitani i polja su popunjena.");
    } catch (error) {
      gfiParsedData = null;
      statusEl.textContent = `Greška pri čitanju datoteke: ${error.message}`;
      statusEl.classList.remove("success");
      updateGfiDistributionUi(null);
      toast("Neuspješno učitavanje GFI datoteke.");
    }
  });
  $("#gfiForm").elements.payout_to_members.addEventListener("input", recalcGfiRetainedGain);
  $("#gfiForm").elements.retained_for_loss_coverage.addEventListener("input", recalcGfiRetainedGain);
  $("#downloadGfiButton").addEventListener("click", (event) => withBusyButton(event.currentTarget, async () => {
    if (!validateForm($("#gfiForm"))) return;
    await downloadPrintableHtml(buildGfiDocument());
  }));
  $("#downloadGfiNotesButton").addEventListener("click", (event) => withBusyButton(event.currentTarget, async () => {
    if (!gfiParsedData) {
      toast("Prvo učitajte GFI-POD Excel datoteku.");
      return;
    }
    await downloadPrintableHtml(buildGfiNotesDocument(gfiParsedData, {
      signPlace: gfiParsedData.company.city,
      signDate: croatianDateTimeFromDate(new Date())
    }));
  }));
  $("#downloadGfiDistributionButton").addEventListener("click", (event) => withBusyButton(event.currentTarget, async () => {
    if (!gfiParsedData) {
      toast("Prvo učitajte GFI-POD Excel datoteku.");
      return;
    }
    const gf = $("#gfiForm").elements;
    const result = gfiParsedData.rdg[186];
    const isLoss = !!(result && result.curr < 0);
    if (isLoss && !gf.loss_coverage.value.trim()) {
      toast("Unesite opis pokrića gubitka prije preuzimanja odluke.");
      gf.loss_coverage.focus();
      return;
    }
    await downloadPrintableHtml(buildGfiDistributionDocument(gfiParsedData, {
      signPlace: gfiParsedData.company.city,
      signDate: croatianDateTimeFromDate(new Date()),
      lossCoverageText: gf.loss_coverage.value,
      gainBeforeTax: gf.gain_before_tax.value,
      gainTax: gf.gain_tax.value,
      gainAfterTax: gf.gain_after_tax.value,
      payoutToMembers: gf.payout_to_members.value,
      retainedForLossCoverage: gf.retained_for_loss_coverage.value,
      retainedGain: gf.retained_gain.value
    }));
  }));
}

