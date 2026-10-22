import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import Note from "./src/models/Note.js";

const backupDir = path.resolve(
  process.cwd(),
  "..",
  "backups",
  `admin-notes-cleanup-${new Date().toISOString().replace(/[:.]/g, "-")}`
);

try {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI was not loaded. No changes made.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const notes = await Note.find({ userId: null }).lean();

  await fs.mkdir(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, "shared-notes.json");

  await fs.writeFile(
    backupFile,
    JSON.stringify(notes, null, 2),
    { flag: "wx" }
  );

  const verified = JSON.parse(await fs.readFile(backupFile, "utf8"));
  if (verified.length !== notes.length) {
    throw new Error("Backup verification failed. No records deleted.");
  }

  console.log("Database connected.");
  console.log(`Shared note records found: ${notes.length}`);
  console.log(`Backup verified: ${backupFile}`);
  console.log("DRY RUN ONLY: no records or PDFs were deleted.");
} catch (error) {
  console.error("Cleanup inspection failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
