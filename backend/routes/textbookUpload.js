const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const router = express.Router();

const uploadDir = path.join(__dirname, "../public/textbooks");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure unique, clean filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${cleanBase}_${Date.now()}${ext}`); } });  const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } // Support full NCERT books up to 100MB });  // Textbook Mongoose Schema const TextbookSchema = new mongoose.Schema({ title: { type: String, required: true }, subject: { type: String, required: true }, class: { type: Number, required: true }, board: { type: String, default: "State / NCERT" }, chapterNumber: { type: Number, default: 1 }, sourceUrl: { type: String, required: true }, uploadedAt: { type: Date, default: Date.now } });  const Textbook = mongoose.models.Textbook \vert{}\vert{} mongoose.model("Textbook", TextbookSchema);  // GET /api/textbooks (Filterable by class & subject) router.get("/", async (req, res) => { try { const filter = {}; if (req.query.class) filter.class = Number(req.query.class); if (req.query.subject && req.query.subject !== "all") filter.subject = req.query.subject;  const books = await Textbook.find(filter).sort({ chapterNumber: 1 }); res.json({ success: true, textbooks: books }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } });  // POST /api/textbooks/upload (Multer handler) router.post("/upload", upload.single("pdfFile"), async (req, res) => { try { const { title, subject, classNum, chapterNumber } = req.body; if (!req.file) { return res.status(400).json({ success: false, message: "No PDF file attached" }); }  const fileUrl = `/textbooks/${req.file.filename}`;

    const newBook = new Textbook({
      title: title || req.file.originalname,
      subject: subject || "General",
      class: Number(classNum) || 5,
      chapterNumber: Number(chapterNumber) || 1,
      sourceUrl: fileUrl
    });

    await newBook.save();
    res.json({ success: true, message: "Textbook uploaded and registered successfully!", textbook: newBook });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/textbooks/:id
router.delete("/:id", async (req, res) => {
  try {
    const book = await Textbook.findByIdAndDelete(req.params.id);
    if (book && book.sourceUrl) {
      const localPath = path.join(__dirname, "../public", book.sourceUrl);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
    res.json({ success: true, message: "Textbook removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
