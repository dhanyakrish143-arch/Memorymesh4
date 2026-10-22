import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import Textbook from "../models/Textbook.js";
import User from "../models/User.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEXTBOOK_ROOT = path.resolve(__dirname, "../../textbooks");
const UPLOAD_DIR = path.join(TEXTBOOK_ROOT, "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, _file, cb) => cb(null, `${crypto.randomUUID()}.pdf`),
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname).toLowerCase() === ".pdf";
    cb(isPdf ? null : new Error("Please select a PDF file."), isPdf);
  },
});

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("role").lean();
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Administrator access required." });
    }
    next();
  } catch (error) {
    next(error);
  }
}

router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  upload.single("pdf"),
  async (req, res) => {
    let savedPath = null;

    try {
      if (!req.file) {
        return res.status(400).json({ error: "Choose a PDF file to upload." });
      }

      savedPath = req.file.path;

      const fd = fs.openSync(savedPath, "r");
      const signature = Buffer.alloc(5);
      const bytesRead = fs.readSync(fd, signature, 0, 5, 0);
      fs.closeSync(fd);

      if (bytesRead !== 5 || signature.toString("ascii") !== "%PDF-") {
        fs.unlinkSync(savedPath);
        return res.status(400).json({ error: "The selected file is not a valid PDF." });
      }

      const classNumber = Number(req.body.classNumber);
      const chapterNumber = Number(req.body.chapterNumber);
      const board = String(req.body.board || "CBSE").trim();
      const subject = String(req.body.subject || "").trim();
      const language = String(req.body.language || "English").trim();
      const title = String(req.body.title || "").trim();
      const chapter = String(req.body.chapter || "").trim();

      if (!Number.isInteger(classNumber) || classNumber < 5 || classNumber > 12) {
        fs.unlinkSync(savedPath);
        return res.status(400).json({ error: "Class must be from 5 to 12." });
      }

      if (!["CBSE", "ICSE", "State"].includes(board)) {
        fs.unlinkSync(savedPath);
        return res.status(400).json({ error: "Choose a valid board." });
      }

      if (!subject || !language || !title || !chapter ||
          !Number.isInteger(chapterNumber) || chapterNumber < 1) {
        fs.unlinkSync(savedPath);
        return res.status(400).json({
          error: "Enter the title, subject, language, chapter and chapter number.",
        });
      }

      const sourceUrl = `/textbooks/uploads/${path.basename(savedPath)}`;

      const textbook = await Textbook.create({
        classNumber,
        board,
        subject,
        language,
        title,
        chapter,
        chapterNumber,
        bookCode: "",
        sourceUrl,
        source: "ADMIN_UPLOAD",
        active: true,
      });

      return res.status(201).json({
        success: true,
        message: "Textbook PDF uploaded successfully.",
        textbook: {
          id: String(textbook._id),
          title: textbook.title,
          classNumber: textbook.classNumber,
          subject: textbook.subject,
          sourceUrl: textbook.sourceUrl,
        },
      });
    } catch (error) {
      if (savedPath && fs.existsSync(savedPath)) {
        try { fs.unlinkSync(savedPath); } catch {}
      }

      console.error("Admin textbook upload error:", error);
      return res.status(500).json({
        error: "Upload failed. Please check the server logs and try again.",
      });
    }
  }
);

export default router;
