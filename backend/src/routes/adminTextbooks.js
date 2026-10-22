import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import Textbook from "../models/Textbook.js";
import { createResourceNotification } from "../utils/createResourceNotification.js";
import User from "../models/User.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEXTBOOK_ROOT = path.resolve(__dirname, "../../../textbooks");
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

// Upload & Publish Manual State NCERT PDF
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
      const classNumber = Number(req.body.classNumber);
      const chapterNumber = Number(req.body.chapterNumber);
      const board = "State"; // Strictly State NCERT
      const subject = String(req.body.subject || "").trim();
      const language = String(req.body.language || "English").trim();
      const title = String(req.body.title || "").trim();
      const chapter = String(req.body.chapter || "").trim();

      if (!Number.isInteger(classNumber) || classNumber < 5 || classNumber > 12) {
        fs.unlinkSync(savedPath);
        return res.status(400).json({ error: "Class must be from 5 to 12." });
      }

      if (!subject || !title || !chapter || !Number.isInteger(chapterNumber) || chapterNumber < 1) {
        fs.unlinkSync(savedPath);
        return res.status(400).json({
          error: "Enter the title, subject, chapter and chapter number.",
        });
      }

      const sourceUrl = `/textbooks/uploads/${path.basename(savedPath)}`;

      const textbook = await Textbook.create({
        classNumber,
        board: "State",
        subject,
        language,
        title,
        chapter,
        chapterNumber,
        bookCode: "STATE-NCERT",
        sourceUrl,
        source: "State NCERT",
        active: true,
      });

      try {
        await createResourceNotification({
          title: `New State NCERT Textbook: ${title}`,
          message: `Chapter ${chapterNumber}: ${chapter} has been published for Class ${classNumber}.`,
          classNumber,
          board: "State",
          type: "textbook",
        });
      } catch (notifyErr) {
        console.warn("Notification error:", notifyErr.message);
      }

      return res.json({
        success: true,
        message: `Successfully published ${title} - Chapter ${chapterNumber} for Class ${classNumber} (State NCERT)!`,
        textbook,
      });
    } catch (err) {
      if (savedPath && fs.existsSync(savedPath)) fs.unlinkSync(savedPath);
      return res.status(500).json({ error: err.message });
    }
  }
);

// One-click Batch Publish Official State NCERT Books
router.post("/seed-state-ncert", requireAuth, requireAdmin, async (req, res) => {
  try {
    const STATE_NCERT_CATALOG = [
      // Class 10 State NCERT
      {
        classNumber: 10,
        board: "State",
        subject: "Science",
        language: "English",
        title: "State NCERT Science Class 10",
        chapterNumber: 1,
        chapter: "Chemical Reactions and Equations",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/jesc101.pdf",
        bookCode: "jesc1",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 10,
        board: "State",
        subject: "Science",
        language: "English",
        title: "State NCERT Science Class 10",
        chapterNumber: 12,
        chapter: "Electricity",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/jesc112.pdf",
        bookCode: "jesc1",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 10,
        board: "State",
        subject: "Mathematics",
        language: "English",
        title: "State NCERT Mathematics Class 10",
        chapterNumber: 4,
        chapter: "Quadratic Equations",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/jemh104.pdf",
        bookCode: "jemh1",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 10,
        board: "State",
        subject: "Social Science",
        language: "English",
        title: "State NCERT India and Contemporary World II",
        chapterNumber: 1,
        chapter: "The Rise of Nationalism in Europe",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/jess101.pdf",
        bookCode: "jess1",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 10,
        board: "State",
        subject: "English",
        language: "English",
        title: "State NCERT First Flight",
        chapterNumber: 1,
        chapter: "A Letter to God",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/jeff101.pdf",
        bookCode: "jeff1",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 10,
        board: "State",
        subject: "Kannada",
        language: "Kannada",
        title: "ರಾಜ್ಯ ಪಠ್ಯಪುಸ್ತಕ - ಸಿರಿ ಕನ್ನಡ ೧೦",
        chapterNumber: 1,
        chapter: "ಯುದ್ಧ (ಕಥಾ ಭಾಗ)",
        sourceUrl: "https://ktbs.kar.nic.in/New/index.html",
        bookCode: "ktbs10",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 10,
        board: "State",
        subject: "Hindi",
        language: "Hindi",
        title: "State NCERT स्पर्श भाग २",
        chapterNumber: 1,
        chapter: "साखी (कबीर)",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/jhsp101.pdf",
        bookCode: "jhsp1",
        source: "State NCERT",
        active: true,
      },

      // Class 5 State NCERT
      {
        classNumber: 5,
        board: "State",
        subject: "Science",
        language: "English",
        title: "State NCERT Environmental Studies Class 5",
        chapterNumber: 1,
        chapter: "Super Senses",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/eeap101.pdf",
        bookCode: "eeap1",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 5,
        board: "State",
        subject: "Mathematics",
        language: "English",
        title: "State NCERT Math-Magic Class 5",
        chapterNumber: 1,
        chapter: "The Fish Tale",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/eemh101.pdf",
        bookCode: "eemh1",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 5,
        board: "State",
        subject: "Social Science",
        language: "English",
        title: "State NCERT Our Earth and Society Class 5",
        chapterNumber: 1,
        chapter: "Continents and Oceans",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/eeap102.pdf",
        bookCode: "eeap2",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 5,
        board: "State",
        subject: "English",
        language: "English",
        title: "State NCERT Marigold Class 5",
        chapterNumber: 1,
        chapter: "Ice-Cream Man",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/eeen101.pdf",
        bookCode: "eeen1",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 5,
        board: "State",
        subject: "Kannada",
        language: "Kannada",
        title: "ರಾಜ್ಯ ಪಠ್ಯಪುಸ್ತಕ - ಸವಿ ಕನ್ನಡ ೫",
        chapterNumber: 1,
        chapter: "ಕನ್ನಡ ನಾಡು (ಪದ್ಯ)",
        sourceUrl: "https://ktbs.kar.nic.in/New/index.html",
        bookCode: "ktbs5",
        source: "State NCERT",
        active: true,
      },
      {
        classNumber: 5,
        board: "State",
        subject: "Hindi",
        language: "Hindi",
        title: "State NCERT रिमझिम भाग ५",
        chapterNumber: 1,
        chapter: "राख की रस्सी",
        sourceUrl: "https://ncert.nic.in/textbook/pdf/ehhn101.pdf",
        bookCode: "ehhn1",
        source: "State NCERT",
        active: true,
      },
    ];

    await Textbook.deleteMany({ board: "State" });
    const inserted = await Textbook.insertMany(STATE_NCERT_CATALOG);

    return res.json({
      success: true,
      count: inserted.length,
      message: `Published ${inserted.length} State NCERT textbooks for Class 5 and 10!`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
