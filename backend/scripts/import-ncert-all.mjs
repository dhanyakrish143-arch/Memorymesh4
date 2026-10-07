import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const ROOT = path.resolve(process.cwd(), "..", "textbooks");
const MANIFEST = path.resolve(process.cwd(), "scripts", "ncert-download-manifest.json");
const NCERT = "https://ncert.nic.in/textbook/pdf";
const FORCE = process.argv.includes("--force");
const CHECK = process.argv.includes("--check");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function safeName(value) {
  return String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "")
    .slice(0, 180);
}

function languageFromCode(code) {
  const second = code[1]?.toLowerCase();

  if (second === "e") return "English";
  if (second === "h") return "Hindi";
  if (second === "u") return "Urdu";

  return "Other";
}

function classFromCode(code) {
  const first = code[0]?.toLowerCase();

  const map = {
    e: 5,
    f: 6,
    g: 7,
    h: 8,
    i: 9,
    j: 10,
    k: 11,
    l: 12,
  };

  return map[first] ?? null;
}

function extractZip(zipPath, destination) {
  fs.mkdirSync(destination, { recursive: true });

  execFileSync(
    "tar",
    ["-xf", zipPath, "-C", destination],
    {
      stdio: "inherit",
    }
  );
}

function findPdfs(dir) {
  const result = [];

  if (!fs.existsSync(dir)) return result;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(...findPdfs(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
      result.push(full);
    }
  }

  return result;
}

async function downloadFile(url, destination) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destination, buffer);
}

if (!fs.existsSync(MANIFEST)) {
  console.error("Manifest not found:", MANIFEST);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

const entries = manifest.filter((x) => {
  const classNumber = Number(x.classNumber);
  return classNumber >= 5 && classNumber <= 12 && classNumber !== 10;
});

const byCode = new Map();

for (const entry of entries) {
  if (!byCode.has(entry.code)) {
    byCode.set(entry.code, entry);
  }
}

const unique = [...byCode.values()];

console.log("NCERT MANIFEST DOWNLOADER");
console.log("=========================");
console.log("Manifest entries:", entries.length);
console.log("Unique books:", unique.length);
console.log("Root:", ROOT);
console.log("Mode:", CHECK ? "CHECK" : FORCE ? "FORCE" : "NORMAL");
console.log("");

if (CHECK) {
  for (const item of unique) {
    const classNumber = Number(item.classNumber);
    const language = languageFromCode(item.code);

    const folder = path.join(
      ROOT,
      `Class-${classNumber}`,
      safeName(item.subject),
      safeName(language)
    );

    const existing = findPdfs(folder);

    console.log(
      `${item.code} | Class ${classNumber} | ${item.subject} | ${item.title} | PDFs: ${existing.length}`
    );
  }

  process.exit(0);
}

let downloaded = 0;
let skipped = 0;
let failed = 0;

for (let i = 0; i < unique.length; i++) {
  const item = unique[i];

  const classNumber = Number(item.classNumber);
  const language = languageFromCode(item.code);

  const folder = path.join(
    ROOT,
    `Class-${classNumber}`,
    safeName(item.subject),
    safeName(language)
  );

  fs.mkdirSync(folder, { recursive: true });

  const zipPath = path.join(
    ROOT,
    ".cache",
    `${item.code}dd.zip`
  );

  fs.mkdirSync(path.dirname(zipPath), { recursive: true });

  const existingPdfs = findPdfs(folder);

  if (!FORCE && existingPdfs.length > 0) {
    skipped++;
    console.log(
      `[${i + 1}/${unique.length}] SKIP | ${item.code} | ${item.title} | ${existingPdfs.length} PDF(s)`
    );
    continue;
  }

  const url = `${NCERT}/${item.code}dd.zip`;

  try {
    console.log(
      `[${i + 1}/${unique.length}] DOWNLOAD | Class ${classNumber} | ${item.subject} | ${item.title}`
    );
    console.log(`  ${url}`);

    await downloadFile(url, zipPath);

    extractZip(zipPath, folder);

    const pdfs = findPdfs(folder);

    if (!pdfs.length) {
      throw new Error("ZIP downloaded but no PDF files were extracted");
    }

    downloaded++;

    console.log(`  OK | extracted ${pdfs.length} PDF(s)`);

    await sleep(250);
  } catch (error) {
    failed++;

    console.error(
      `  FAILED | ${item.code} | ${error.message}`
    );
  }
}

console.log("");
console.log("=========================");
console.log("DOWNLOAD COMPLETE");
console.log("Downloaded:", downloaded);
console.log("Skipped:", skipped);
console.log("Failed:", failed);
console.log("Total:", unique.length);
