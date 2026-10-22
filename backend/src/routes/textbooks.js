import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, "../../public/textbooks");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    cb(null, cleanName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

const TextbookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: mongoose.Schema.Types.Mixed, required: true },
  board: { type: String, default: "State (NCERT Syllabus)" },
  medium: { type: String, default: "English" },
  chapterNumber: { type: mongoose.Schema.Types.Mixed, default: 1 },
  chapterName: { type: String, default: "" },
  sourceUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { strict: false });

const Textbook = mongoose.models.Textbook || mongoose.model("Textbook", TextbookSchema);

// GET /api/textbooks
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.class && req.query.class !== "all") {
      const clsNum = Number(req.query.class);
      const clsStr = String(req.query.class);
      // Match either number 5 or string "5"
      filter.$or = [{ class: clsNum }, { class: clsStr }];
    }

    if (req.query.subject && req.query.subject.toLowerCase() !== "all") {
      filter.subject = new RegExp(`^${req.query.subject}$`, "i");
    }

    const books = await Textbook.find(filter).sort({ chapterNumber: 1, uploadedAt: -1 });
    res.json({ success: true, textbooks: books });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/textbooks/upload
router.post("/upload", upload.single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PDF file attached" });
    }

    const { title, subject, chapterName } = req.body;
    const rawClass = req.body.class || req.body.classNum || 5;
    const rawChapter = req.body.chapterNumber || req.body.chapterNo || 1;
    const fileUrl = `/textbooks/${req.file.filename}`;

    const newBook = new Textbook({
      title: title || req.file.originalname,
      subject: subject || "General",
      class: Number(rawClass),
      chapterNumber: Number(rawChapter),
      chapterName: chapterName || `Chapter ${rawChapter}`,
      board: req.body.board || "State (NCERT Syllabus)",
      medium: req.body.medium || "English",
      sourceUrl: fileUrl
    });

    await newBook.save();
    res.json({ success: true, message: "Published successfully!", textbook: newBook });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/textbooks/:id
router.delete("/:id", async (req, res) => {
  try {
    const book = await Textbook.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Textbook not found." });
    }

    if (book.sourceUrl && book.sourceUrl.startsWith("/textbooks/")) {
      const filePath = path.join(__dirname, "../../public", book.sourceUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: "Textbook deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
