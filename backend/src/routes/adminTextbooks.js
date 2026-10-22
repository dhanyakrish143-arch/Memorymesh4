import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const TextbookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: Number, required: true },
  board: { type: String, default: "State (NCERT Syllabus)" },
  medium: { type: String, default: "English" },
  chapterNumber: { type: Number, default: 1 },
  chapterName: { type: String, default: "" },
  sourceUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const Textbook = mongoose.models.Textbook || mongoose.model("Textbook", TextbookSchema);

// GET all published textbooks
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.class && req.query.class !== "all") {
      filter.class = Number(req.query.class);
    }
    const books = await Textbook.find(filter).sort({ class: 1, chapterNumber: 1 });
    res.json({ success: true, textbooks: books });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE a textbook by ID (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    const book = await Textbook.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Textbook not found." });
    }

    if (book.sourceUrl && book.sourceUrl.startsWith("/textbooks/")) {
      const filePath = path.join(__dirname, "../../public", book.sourceUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true, message: `Successfully deleted ${book.title}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
