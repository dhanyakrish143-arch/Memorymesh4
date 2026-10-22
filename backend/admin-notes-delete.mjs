import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import Note from "./src/models/Note.js";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const pdfDir = path.resolve(process.cwd(), "uploads", "shared-notes");
const backupRoot = path.resolve(process.cwd(), "..", "backups");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(backupRoot, `admin-notes-final-${stamp}`);

let deleted = false;

try {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI was not loaded. No changes made.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const notes = await Note.find({ userId: null }).lean();
  if (notes.length === 0) {
    console.log("No shared Admin Notes found. Nothing to delete.");
    process.exitCode = 0;
  } else {
    await fs.mkdir(path.join(backupDir, "pdfs"), { recursive: true });

    const jsonPath = path.join(backupDir, "shared-notes.json");
    await fs.writeFile(jsonPath, JSON.stringify(notes, null, 2), { flag: "wx" });

    const pdfNames = [...new Set(
      notes.map(n => n.pdfStorageName)
        .filter(Boolean)
        .map(n => path.basename(n))
    )];

    const copiedPdfs = [];
    for (const filename of pdfNames) {
      const source = path.join(pdfDir, filename);
      try {
        const stat = await fs.stat(source);
        if (!stat.isFile()) continue;
        await fs.copyFile(source, path.join(backupDir, "pdfs", filename));
        copiedPdfs.push(filename);
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }
    }

    const check = JSON.parse(await fs.readFile(jsonPath, "utf8"));
    if (check.length !== notes.length) {
      throw new Error("JSON backup verification failed. Nothing deleted.");
    }

    for (const filename of copiedPdfs) {
      await fs.access(path.join(backupDir, "pdfs", filename));
    }

    console.log(`Shared notes to delete: ${notes.length}`);
    console.log(`PDFs backed up: ${copiedPdfs.length}`);
    console.log(`Verified backup: ${backupDir}`);

    const rl = readline.createInterface({ input: stdin, output: stdout });
    const answer = await rl.question(
      '\nType DELETE SHARED NOTES to permanently delete these shared records: '
    );
    rl.close();

    if (answer !== "DELETE SHARED NOTES") {
      console.log("Confirmation not matched. Nothing deleted.");
    } else {
      const ids = notes.map(n => n._id);
      const result = await Note.deleteMany({
        _id: { $in: ids },
        userId: null
      });

      // Remove only PDF files referenced by the backed-up shared records.
      for (const filename of pdfNames) {
        await fs.unlink(path.join(pdfDir, filename)).catch(err => {
          if (err.code !== "ENOENT") {
            console.error(`Could not remove PDF ${filename}: ${err.message}`);
          }
        });
      }

      const remaining = await Note.countDocuments({ userId: null });
      console.log(`Shared records deleted: ${result.deletedCount}`);
      console.log(`Shared records remaining: ${remaining}`);
      console.log("Student-owned notes were not targeted.");
      deleted = true;
    }
  }
} catch (err) {
  console.error("Cleanup failed:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
