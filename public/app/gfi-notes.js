// Builds "Bilješke uz financijske izvještaje" HTML from parsed GFI-POD data (see gfi-parser.js).
import { escapeHtml, htmlToText } from "./utils.js";
import { buildGfiChartsHtml } from "./gfi-charts.js";

function p(value, className = "") {
  return `<p class="${className}">${value}</p>`;
}
function center(value) {
  return p(value, "center");
}
function centerTitle(value) {
  return p(value, "center title");
}
function b(value) {
  return `<strong>${escapeHtml(value)}</strong>`;
}

function eur(value) {
  const number = Number(value || 0);
  const rounded = Math.abs(number) < 0.005 ? 0 : number;
  return `${rounded.toLocaleString("hr-HR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function pctFmt(value) {
  const rounded = Math.round(Number(value || 0) * 100) / 100;
  return (rounded === 0 ? 0 : rounded).toLocaleString("hr-HR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function changeSentence(label, prev, curr, year) {
  const prevYear = year - 1;
  if (prev === 0 && curr === 0) {
    return `Pozicija „${label}” u ${year}. i ${prevYear}. godini iznosi ${eur(0)} (nepromijenjeno).`;
  }
  if (prev === 0) {
    return `Pozicija „${label}” u ${year}. godini iznosi ${eur(curr)}. U ${prevYear}. godini ova pozicija nije bila iskazana (iznosila je ${eur(0)}).`;
  }
  const diff = curr - prev;
  const pct = Math.abs(diff) < 0.005 ? 0 : (diff / Math.abs(prev)) * 100;
  return `Pozicija „${label}” u ${year}. godini iznosi ${eur(curr)} (u ${prevYear}. godini iznosila je ${eur(prev)}), što predstavlja promjenu od ${pctFmt(pct)} % odnosno ${eur(diff)}.`;
}

function sectionParagraphs(table, items, year) {
  return items
    .map(([aop, label]) => {
      const row = table[aop];
      if (!row) return "";
      return p(changeSentence(label, row.prev, row.curr, year));
    })
    .filter(Boolean)
    .join("");
}

const REVENUE_ITEMS = [
  [180, "Ukupni prihodi"],
  [128, "Poslovni prihodi"],
  [157, "Financijski prihodi"]
];
const EXPENSE_ITEMS = [
  [181, "Ukupni rashodi"],
  [134, "Poslovni rashodi"],
  [136, "Materijalni troškovi"],
  [140, "Troškovi osoblja"],
  [144, "Amortizacija"],
  [168, "Financijski rashodi"]
];
const RESULT_ITEMS = [
  [182, "Dobit ili gubitak prije oporezivanja"],
  [185, "Porez na dobit"],
  [186, "Dobit ili gubitak razdoblja"]
];
const ASSET_ITEMS = [
  [65, "Ukupna aktiva"],
  [2, "Dugotrajna imovina"],
  [3, "Nematerijalna imovina"],
  [10, "Materijalna imovina"],
  [31, "Dugotrajna potraživanja"],
  [37, "Kratkotrajna imovina"],
  [38, "Zalihe"],
  [46, "Kratkotrajna potraživanja"],
  [63, "Novac u banci i blagajni"]
];
const LIABILITY_ITEMS = [
  [126, "Ukupno pasiva"],
  [67, "Kapital i rezerve"],
  [68, "Temeljni (upisani) kapital"],
  [84, "Zadržana dobit ili preneseni gubitak"],
  [87, "Dobit ili gubitak poslovne godine"],
  [91, "Rezerviranja"],
  [98, "Dugoročne obveze"],
  [110, "Kratkoročne obveze"],
  [118, "Obveze prema dobavljačima (kratkoročne)"],
  [120, "Obveze prema zaposlenicima"],
  [121, "Obveze za poreze, doprinose i slična davanja"],
  [125, "Odgođeno plaćanje troškova i prihod budućeg razdoblja"]
];

function basicCompanyDataHtml(company) {
  const year = company.year || new Date().getFullYear();
  const prevYear = year - 1;
  return `
    ${center("OSNOVNI PODACI O TRGOVAČKOM DRUŠTVU")}
    ${p(`Sjedište trgovačkog društva ${b(company.companyName)} (u daljnjem tekstu: „Društvo”) nalazi se na adresi ${b(company.street)}, ${b(`${company.postal} ${company.city}`)}, u općini ${b(company.municipality)}, županija ${b(company.county)}.`)}
    ${p(`Ovlaštena osoba za zastupanje je ${b(company.director)}.`)}
    ${p(`Matični broj (MB), dodijeljen od DZS-a, je ${b(company.mb)}, a matični broj subjekta (MBS), dodijeljen od nadležnog trgovačkog suda, je ${b(company.mbs)}. OIB Društva je ${b(company.oib)}.`)}
    ${p(`Društvo je ${b(company.ownership)}, a sukladno članku 5. Zakona o računovodstvu razvrstano je u kategoriju ${b(company.size)}.`)}
    ${p(`Društvo sastavlja financijske izvještaje primjenom ${b(company.standard)} računovodstvenih standarda.`)}
    ${p(`Kapital Društva je ${b(`${pctFmt(company.capitalDomesticPct)} %`)} domaći te ${b(`${pctFmt(company.capitalForeignPct)} %`)} strani.`)}
    ${p("Temeljem Obavijesti o razvrstavanju poslovnog subjekta prema Nacionalnoj klasifikaciji djelatnosti, koju je izdao Državni zavod za statistiku, osnovna djelatnost Društva je:")}
    ${center(b(`${company.nkd} (NKD ${company.nkdCode})`))}
    ${p(`Status autonomnosti Društva: ${b(company.autonomy)}.`)}
    ${p(`Prosječan broj zaposlenih tijekom prethodne, ${prevYear}. godine, bio je ${b(company.employeesPrev)}, a prosječan broj zaposlenih tijekom tekuće ${year}. godine je ${b(company.employeesCurr)} zaposlenih.`)}
    ${p(`U ${prevYear}. godini Društvo je poslovalo ${b(`${company.monthsPrev} mjeseci`)}, a u ${year}. godini ${b(`${company.monthsCurr} mjeseci`)}.`)}
    ${p(`Godišnji financijski izvještaji Društva sastavljeni su za razdoblje ${b(company.periodFrom)} do ${b(company.periodTo)} godine, ${company.audited === "DA" ? "izvještaji su revidirani" : "izvještaji nisu revidirani"}, a predaju se sukladno svrsi: ${company.purposeLabel.toLowerCase()}.`)}
  `;
}

function accountingBasisHtml(company) {
  const year = company.year || new Date().getFullYear();
  return `
    ${center("OSNOVE ZA SASTAVLJANJE FINANCIJSKIH IZVJEŠTAJA")}
    ${center("Regularni okvir sastavljanja GFI-a")}
    ${p("Zakon o računovodstvu (NN 85/24, 145/24, 151/25)")}
    ${p("Pravilnik o strukturi i sadržaju godišnjih financijskih izvještaja (NN 107/25)")}
    ${p("Hrvatski standardi financijskog izvještavanja – HSFI (NN 84/24)")}
    ${center("Izjava o usklađenosti")}
    ${p(`Financijski izvještaji Društva za ${year}. godinu izrađeni su u skladu s Hrvatskim standardima financijskog izvještavanja (HSFI), koje je donio Odbor za standarde financijskog izvještavanja na temelju ovlasti iz članka 17., stavka 1., točke 1. Zakona o računovodstvu.`)}
    ${center("RAČUNOVODSTVENE POLITIKE")}
    ${p("Računovodstvene politike Društva usklađene su sa Zakonom o računovodstvu i Hrvatskim standardima financijskog izvještavanja. Financijski izvještaji sastavljeni su prema zahtjevima Pravilnika o strukturi i sadržaju financijskih izvještaja na temelju članka 18. Zakona o računovodstvu.")}
    ${p("Financijski izvještaji pripremljeni su po načelu povijesnog troška, sastavljeni po načelu nastanka poslovnog događaja te pod pretpostavkom vremenske neograničenosti poslovanja. Uprava Društva je na datum sastavljanja financijskih izvještaja ocijenila da ne postoje okolnosti koje bi ukazivale na vremensku ograničenost poslovanja.")}
  `;
}

function significantPoliciesHtml() {
  return `
    ${center("ZNAČAJNE RAČUNOVODSTVENE POLITIKE")}
    ${center("Priznavanje prihoda")}
    ${p("Prihodi nastaju kao posljedica povećanja imovine ili smanjenja obveza te se priznaju u skladu s HSFI 15. Prihodi se sastoje od fer vrijednosti primljene naknade ili potraživanja za prodane proizvode, robu ili usluge tijekom redovnog poslovanja Društva, iskazani u iznosima umanjenim za porez na dodanu vrijednost, procijenjene povrate, rabate i diskonte. Društvo priznaje prihode kada se njihov iznos može pouzdano mjeriti, kada će imati buduće ekonomske koristi i kada su zadovoljeni specifični kriteriji priznavanja.")}
    ${center("Rashodi")}
    ${p("Rashodi nastaju kao posljedica smanjenja imovine ili povećanja obveza. Sučeljavaju se s pripadajućim prihodima i priznaju se u skladu s HSFI 16.")}
    ${center("Porez na dobit")}
    ${p("Društvo obračunava obvezu poreza na dobit u skladu sa Zakonom o porezu na dobit (NN 151/25).")}
    ${center("Dugotrajna imovina")}
    ${p("Dugotrajna imovina obuhvaća materijalnu i nematerijalnu imovinu čiji je korisni vijek upotrebe duži od jedne godine. Dugotrajna imovina čiji je trošak nabave viši od 665,00 € priznaje se kao dugotrajna imovina i amortizira se tijekom procijenjenog vijeka trajanja, dok se imovina niže vrijednosti otpisuje jednokratno prilikom stavljanja u uporabu (sitni inventar).")}
    ${p("Dugotrajna materijalna imovina priznaje se i mjeri po trošku nabave u skladu s HSFI 6. Dugotrajna nematerijalna imovina priznaje se ako se očekuje buduća gospodarska korist i trošak nabave se može pouzdano izmjeriti, a iskazuje se prema trošku nabave u skladu s HSFI 5.")}
    ${center("Amortizacija")}
    ${p("Obračun amortizacije započinje kada je imovina spremna za uporabu. Imovina u izgradnji i zemljišta se ne amortiziraju. Amortizacija se obračunava linearnom metodom tijekom procijenjenog vijeka trajanja, a godišnje stope utvrđuju se prema članku 12. Zakona o porezu na dobit.")}
    ${center("Zalihe")}
    ${p("Zalihe se iskazuju po trošku nabave ili neto utrživoj vrijednosti, ovisno o tome koja je niža, u skladu s HSFI 10. Sitni inventar se otpisuje u 100 %-tnom iznosu prilikom stavljanja u uporabu.")}
    ${center("Potraživanja od kupaca")}
    ${p("Potraživanja od kupaca predstavljaju pravo na naplatu iznosa od kupaca kao rezultat poslovnih aktivnosti. Početno se mjere po fer vrijednosti dane naknade, a umanjuju se za gubitak od umanjenja vrijednosti ako postoje objektivni dokazi nenaplativosti, u skladu s HSFI 11.")}
    ${center("Novac")}
    ${p("Novac i novčani ekvivalenti obuhvaćaju gotovinu, depozite po viđenju i kratkoročna visokolikvidna ulaganja s izvornim dospijećem do tri mjeseca, koja podliježu neznatnom riziku promjene vrijednosti.")}
    ${center("Kapital i rezerve")}
    ${p("Kapital Društva sastoji se od upisanog (temeljnog) kapitala i kapitalnih rezervi. Dobit se raspoređuje, odnosno gubitak pokriva, temeljem odluke članova/skupštine Društva.")}
    ${center("Krediti i obveze")}
    ${p("Krediti se inicijalno priznaju po trošku koji odgovara fer vrijednosti primljenih sredstava, a naknadno se vrednuju po amortiziranom trošku. Obveze s dospijećem do godine dana klasificiraju se kao kratkoročne, a one s dospijećem duljim od godine dana kao dugoročne, te se iskazuju po nominalnoj vrijednosti.")}
  `;
}

function financialResultsHtml(rdg, year) {
  return `
    ${centerTitle("BILJEŠKE UZ RAČUN DOBITI I GUBITKA")}
    ${center("Prihodi")}
    ${sectionParagraphs(rdg, REVENUE_ITEMS, year)}
    ${center("Rashodi")}
    ${sectionParagraphs(rdg, EXPENSE_ITEMS, year)}
    ${center("Poslovni rezultat")}
    ${sectionParagraphs(rdg, RESULT_ITEMS, year)}
  `;
}

function balanceSheetHtml(bilanca, year) {
  return `
    ${centerTitle("BILJEŠKE UZ BILANCU")}
    ${center("Aktiva")}
    ${sectionParagraphs(bilanca, ASSET_ITEMS, year)}
    ${center("Pasiva")}
    ${sectionParagraphs(bilanca, LIABILITY_ITEMS, year)}
  `;
}

function chartsSectionHtml(rdg, bilanca, year) {
  const charts = buildGfiChartsHtml(rdg, bilanca, year);
  if (!charts) return "";
  return `
    ${centerTitle("GRAFIČKI PRIKAZI")}
    ${charts}
  `;
}

export function buildGfiNotesDocument(gfiData, options = {}) {
  const { company, bilanca, rdg } = gfiData;
  const year = company.year || new Date().getFullYear();
  const place = options.signPlace || company.city || "";
  const signDate = options.signDate || "";
  const html = `
    ${p(`${b(company.companyName)}`)}
    ${p(`${company.street}`)}
    ${p(`${company.postal} ${company.city}`)}
    ${p(`OIB: ${company.oib}`)}
    ${centerTitle("BILJEŠKE")}
    ${centerTitle("UZ GODIŠNJE FINANCIJSKE IZVJEŠTAJE")}
    ${centerTitle(`ZA ${year}. GODINU`)}
    ${basicCompanyDataHtml(company)}
    ${accountingBasisHtml(company)}
    ${significantPoliciesHtml()}
    ${financialResultsHtml(rdg, year)}
    ${balanceSheetHtml(bilanca, year)}
    ${chartsSectionHtml(rdg, bilanca, year)}
    ${p("* * *")}
    ${p(`${place}, dana ${signDate || "____________"} godine`)}
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
    title: `BILJEŠKE UZ GODIŠNJE FINANCIJSKE IZVJEŠTAJE ZA ${year}. GODINU`,
    html,
    body: htmlToText(html),
    parties
  };
}
