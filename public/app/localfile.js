// Local-file persistence modeled after draw.io: open a JSON file once, then every
// subsequent save writes straight back into that same file (no re-download, no dialog).
import { state } from "./constants.js";
import { applyImportedData, markSaved } from "./storage.js";

let fileHandle = null;
let fileName = null;

export function isFileSystemAccessSupported() {
  return typeof window.showOpenFilePicker === "function" && typeof window.showSaveFilePicker === "function";
}

export function currentFileName() {
  return fileName;
}

export function hasOpenFile() {
  return Boolean(fileHandle);
}

function snapshotData() {
  return {
    employers: state.employers,
    accounting: state.accounting,
    employees: state.employees,
    drafts: state.drafts
  };
}

const jsonFileType = {
  description: "JSON datoteka",
  accept: { "application/json": [".json"] }
};

export async function openLocalFile() {
  const [handle] = await window.showOpenFilePicker({
    types: [jsonFileType],
    excludeAcceptAllOption: false,
    multiple: false
  });
  const file = await handle.getFile();
  const parsed = JSON.parse(await file.text());
  const summary = applyImportedData(parsed);
  fileHandle = handle;
  fileName = file.name;
  markSaved();
  return { fileName, summary };
}

export async function saveLocalFile({ saveAs = false } = {}) {
  if (saveAs || !fileHandle) {
    fileHandle = await window.showSaveFilePicker({
      suggestedName: fileName || `knjigovodstveni-asistent-${new Date().toISOString().slice(0, 10)}.json`,
      types: [jsonFileType]
    });
  }
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(snapshotData(), null, 2));
  await writable.close();
  fileName = fileHandle.name;
  markSaved();
  return { fileName };
}
