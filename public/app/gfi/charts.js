// Builds SVG bar charts for the "Bilješke uz financijske izvještaje" document
// from parsed GFI-POD data (see gfi-parser.js). AOP sub-item codes below are
// verified against the official Bilanca form layout (fixed government form).
import { escapeHtml, formatMoney } from "../core/utils.js";

const COLOR_PREV = "#2a78d6";
const COLOR_CURR = "#eb6834";
const INK_PRIMARY = "#0b0b0b";
const INK_SECONDARY = "#52514e";
const INK_MUTED = "#898781";
const BASELINE_COLOR = "#c3c2b7";

const VIEWBOX_WIDTH = 640;
const LABEL_COL_WIDTH = 230;
const PLOT_WIDTH = 300;
const BAR_THICKNESS = 15;
const BAR_GAP = 3;
const ROW_PADDING = 12;
const LINE_HEIGHT = 13;
const FONT_SIZE_LABEL = 11;
const FONT_SIZE_VALUE = 10.5;
const CHARS_PER_LINE = 40;
const TOP_OFFSET = 40;

const MATERIAL_ASSET_ROWS = [
  [11, "Zemljište"],
  [12, "Građevinski objekti"],
  [13, "Postrojenja i oprema"],
  [14, "Alati, pogonski inventar i transportna imovina"],
  [15, "Biološka imovina"],
  [16, "Predujmovi za materijalnu imovinu"],
  [17, "Materijalna imovina u pripremi"],
  [18, "Ostala materijalna imovina"],
  [19, "Ulaganje u nekretnine"]
];
const RECEIVABLES_ROWS = [
  [47, "Potraživanja od poduzetnika unutar grupe"],
  [48, "Potraživanja od društava povezanih sudjelujućim interesom"],
  [49, "Potraživanja od kupaca"],
  [50, "Potraživanja od zaposlenika i članova poduzetnika"],
  [51, "Potraživanja od države i drugih institucija"],
  [52, "Ostala potraživanja"]
];
const LONG_TERM_LIABILITY_ROWS = [
  [99, "Obveze prema poduzetnicima unutar grupe"],
  [100, "Obveze za zajmove, depozite i slično poduzetnika unutar grupe"],
  [101, "Obveze prema društvima povezanim sudjelujućim interesom"],
  [102, "Obveze za zajmove, depozite i slično društava povezanih sudjelujućim interesom"],
  [103, "Obveze za zajmove, depozite i slično"],
  [104, "Obveze prema bankama i drugim financijskim institucijama"],
  [105, "Obveze za predujmove"],
  [106, "Obveze prema dobavljačima"],
  [107, "Obveze po vrijednosnim papirima"],
  [108, "Ostale dugoročne obveze"],
  [109, "Odgođena porezna obveza"]
];
const SHORT_TERM_LIABILITY_ROWS = [
  [111, "Obveze prema poduzetnicima unutar grupe"],
  [112, "Obveze za zajmove, depozite i slično poduzetnika unutar grupe"],
  [113, "Obveze prema društvima povezanim sudjelujućim interesom"],
  [114, "Obveze za zajmove, depozite i slično društava povezanih sudjelujućim interesom"],
  [115, "Obveze za zajmove, depozite i slično"],
  [116, "Obveze prema bankama i drugim financijskim institucijama"],
  [117, "Obveze za predujmove"],
  [118, "Obveze prema dobavljačima"],
  [119, "Obveze po vrijednosnim papirima"],
  [120, "Obveze prema zaposlenicima"],
  [121, "Obveze za poreze, doprinose i slična davanja"],
  [122, "Obveze s osnove udjela u rezultatu"],
  [123, "Obveze po osnovi dugotrajne imovine namijenjene prodaji"],
  [124, "Ostale kratkoročne obveze"]
];

export { MATERIAL_ASSET_ROWS, RECEIVABLES_ROWS, LONG_TERM_LIABILITY_ROWS, SHORT_TERM_LIABILITY_ROWS };

export function rowsFromAop(table, defs) {
  return defs.map(([aop, label]) => {
    const row = table[aop];
    return { label, prev: row ? row.prev : 0, curr: row ? row.curr : 0 };
  });
}

// Returns a function that hands out sequential chart numbers (1, 2, 3, ...) —
// shared across a whole document so "Grafikon N." stays consistent regardless
// of which charts end up with no data and get skipped.
export function createChartCounter() {
  let n = 0;
  return () => {
    n += 1;
    return n;
  };
}

function wrapLabel(text) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > CHARS_PER_LINE && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function svgText(x, y, text, { anchor = "start", size = FONT_SIZE_LABEL, fill = INK_PRIMARY, weight = 400 } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-family="Arial, sans-serif" font-weight="${weight}" fill="${fill}">${escapeHtml(text)}</text>`;
}

function chartHeader(caption, prevYear, currYear) {
  return `
    ${svgText(0, 14, caption, { size: 13, weight: 700 })}
    <rect x="0" y="21" width="10" height="10" rx="2" fill="${COLOR_PREV}"></rect>
    ${svgText(16, 30, `${prevYear}.`, { size: 10.5, fill: INK_SECONDARY })}
    <rect x="70" y="21" width="10" height="10" rx="2" fill="${COLOR_CURR}"></rect>
    ${svgText(86, 30, `${currYear}.`, { size: 10.5, fill: INK_SECONDARY })}
  `;
}

// rows: [{ label, prev, curr }]. Rows where both years round to zero are dropped.
// `chartNumber` is only called (consuming a sequential number) once the chart is
// confirmed to have data, so numbering has no gaps for skipped/empty charts.
// Returns { svg: "", number: null } when there's nothing to plot.
export function groupedBarChartSvg({ title, rows, year, chartNumber }) {
  const filtered = rows.filter((row) => Math.abs(row.prev) >= 0.005 || Math.abs(row.curr) >= 0.005);
  if (!filtered.length) return { svg: "", number: null, title };
  const number = chartNumber();
  const caption = `Grafikon ${number}. ${title}`;
  const prevYear = year - 1;
  const currYear = year;

  const maxAbs = Math.max(1, ...filtered.flatMap((row) => [Math.abs(row.prev), Math.abs(row.curr)]));
  const hasNegative = filtered.some((row) => row.prev < 0 || row.curr < 0);
  const baselineX = hasNegative ? PLOT_WIDTH / 2 : 0;
  const scale = (hasNegative ? PLOT_WIDTH / 2 : PLOT_WIDTH) / maxAbs;

  let y = TOP_OFFSET;
  const rowsSvg = filtered.map((row) => {
    const lines = wrapLabel(row.label);
    const labelHeight = lines.length * LINE_HEIGHT;
    const barsHeight = BAR_THICKNESS * 2 + BAR_GAP;
    const rowHeight = Math.max(labelHeight, barsHeight);
    const rowTop = y;
    const labelSvg = lines.map((line, i) =>
      svgText(0, rowTop + (rowHeight - labelHeight) / 2 + (i + 1) * LINE_HEIGHT - 3, line)
    ).join("");

    const barsTop = rowTop + (rowHeight - barsHeight) / 2;
    const bar = (value, barY, color) => {
      const w = Math.abs(value) * scale;
      if (w < 0.5) {
        const anchor = value >= 0 ? "start" : "end";
        const x = LABEL_COL_WIDTH + baselineX + (value >= 0 ? 6 : -6);
        return svgText(x, barY + BAR_THICKNESS / 2 + 3.5, formatMoney(value), { size: FONT_SIZE_VALUE, fill: INK_MUTED, anchor });
      }
      const x = value >= 0 ? baselineX : baselineX - w;
      const anchor = value >= 0 ? "start" : "end";
      const valueX = LABEL_COL_WIDTH + (value >= 0 ? baselineX + w + 6 : baselineX - w - 6);
      return `
        <rect x="${LABEL_COL_WIDTH + x}" y="${barY}" width="${w}" height="${BAR_THICKNESS}" rx="3" fill="${color}"></rect>
        ${svgText(valueX, barY + BAR_THICKNESS / 2 + 3.5, formatMoney(value), { size: FONT_SIZE_VALUE, fill: INK_SECONDARY, anchor })}
      `;
    };

    const svgRow = `
      ${labelSvg}
      ${bar(row.prev, barsTop, COLOR_PREV)}
      ${bar(row.curr, barsTop + BAR_THICKNESS + BAR_GAP, COLOR_CURR)}
    `;
    y += rowHeight + ROW_PADDING;
    return svgRow;
  }).join("");

  const totalHeight = y + 4;
  const baselineLineX = LABEL_COL_WIDTH + baselineX;

  const svg = `
    <div class="gfi-chart-block">
      <svg viewBox="0 0 ${VIEWBOX_WIDTH} ${totalHeight}" style="width:100%; height:auto; display:block;" role="img" aria-label="${escapeHtml(caption)}">
        ${chartHeader(caption, prevYear, currYear)}
        <line x1="${baselineLineX}" y1="${TOP_OFFSET - 4}" x2="${baselineLineX}" y2="${totalHeight - 4}" stroke="${BASELINE_COLOR}" stroke-width="1"></line>
        ${rowsSvg}
      </svg>
    </div>
  `;
  return { svg, number, title };
}

// A short paragraph pointing the reader from the surrounding text to the chart
// that was just placed, e.g. "Grafički prikaz je dan na Grafikonu 3.". Returns
// "" when the chart had no data (chart.number is null).
export function chartReferenceHtml(chart) {
  if (!chart || !chart.number) return "";
  return `<p>Grafički prikaz kretanja ovih pozicija dan je na <strong>Grafikonu ${chart.number}.</strong></p>`;
}
