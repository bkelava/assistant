import { escapeHtml } from "../core/utils.js";

// --- HTML primitives ---

export function p(value, className = "") {
  return `<p class="${className}">${value}</p>`;
}

export function center(value) {
  return p(value, "center");
}

export function centerTitle(value) {
  return p(value, "center title");
}

export function b(value) {
  return `<strong>${escapeHtml(value)}</strong>`;
}

export function ul(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function ol(items) {
  return `<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
}

// --- Signature helpers ---

export function signatureHtml(context) {
  return `
    <div class="signature-block">
      <div class="signature-card">
        <div class="signature-role">Poslodavac</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.director)}</div>
      </div>
      <div class="signature-card">
        <div class="signature-role">Radnik</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.employeeName)}</div>
      </div>
    </div>
  `;
}

export function twoPartySignature(leftRole, leftName, rightRole, rightName) {
  return `
    <div class="signature-block">
      <div class="signature-card">
        <div class="signature-role">${escapeHtml(leftRole)}</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(leftName)}</div>
      </div>
      <div class="signature-card">
        <div class="signature-role">${escapeHtml(rightRole)}</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(rightName)}</div>
      </div>
    </div>
  `;
}

export function singleSignature(name) {
  return `
    <div class="signature-block single-signature">
      <div class="signature-card">
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(name)}</div>
      </div>
    </div>
  `;
}
