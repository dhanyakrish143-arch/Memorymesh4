import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Textbook from "../models/Textbook.js";
import User from "../models/User.js";
import requireAuth from "../middleware/auth.js";
import { extractTextFromPDF, extractTextFromPDFBuffer } from "../ai/documentParser.js";
import { generateStudyContent } from "../ai/contentGenerator.js";
import { downloadPdf } from "../ai/ncertDownloader.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEXTBOOK_ROOT = path.resolve(__dirname, "../../textbooks");

router.get("/chapters", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("role class board")
      .lean();

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    const requestedClass = Number(req.query.class);

    const subject =
      typeof req.query.subject === "string"
        ? req.query.subject.trim()
        : "";

    const requestedBoard =
      typeof req.query.board === "string"
        ? req.query.board.trim()
        : "";

    let language =
      typeof req.query.language === "string"
        ? req.query.language.trim()
        : "";

    if (!language) {
      language = subject.toLowerCase() === "hindi" ? "Hindi" : "English";
    }

    if (!subject) {
      return res.status(400).json({ error: "subject is required." });
    }

    let classNumber;
    let board;

    if (user.role === "admin") {
      classNumber = requestedClass;
      board = requestedBoard || "State";
    } else {
      classNumber = Number(user.class);
      board = user.board || "CBSE";

      if (
        !Number.isInteger(requestedClass) ||
        requestedClass !== classNumber
      ) {
        return res.status(403).json({
          error: "You can only access chapters for your own class.",
        });
      }

      if (requestedBoard && requestedBoard.toLowerCase() !== board.toLowerCase()) {
        return res.status(403).json({
          error: "You can only access content for your own board.",
        });
      }
    }

    if (
      !Number.isInteger(classNumber) ||
      classNumber < 5 ||
      classNumber > 10
    ) {
      return res.status(400).json({
        error: "class must be between 5 and 10.",
      });
    }

    const escapedSubject = subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedLanguage = language.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const textbooks = await Textbook.find({
      title: { $not: /1ps$/i },
      classNumber,
      subject: { $regex: `^${escapedSubject}$`, $options: "i" },
      language: { $regex: `^${escapedLanguage}$`, $options: "i" },
      active: true,
      source: "NCERT",
    })
      .sort({ bookCode: 1, chapterNumber: 1 })
      .lean();

    if (!textbooks.length) {
      return res.json({
        success: true,
        textbook: null,
        chapters: [],
      });
    }

    const first = textbooks[0];

    const chapters = textbooks.map((book) => ({
      id: String(book._id),
      name: book.chapter,
      index: book.chapterNumber,
      chapterNumber: book.chapterNumber,
      type: "NCERT Chapter",
      playable: true,
      url: book.sourceUrl,
      textbookUrl: book.sourceUrl,
      title: book.title,
      bookCode: book.bookCode || "",
      source: "NCERT",
    }));

    return res.json({
      success: true,
      textbook: {
        id: first.bookCode || String(first._id),
        name: first.title,
        subject: first.subject,
        classNumber: first.classNumber,
        board: first.board || board,
        medium: first.language,
        source: "NCERT",
        url: first.sourceUrl,
      },
      chapters,
    });
  } catch (error) {
    console.error("NCERT learn error:", error);
    return res.status(500).json({
      error: error?.message || "Unable to load NCERT learning content.",
    });
  }
});

router.post("/generate-cards", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("role").lean();

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Only administrators can generate flashcards.",
      });
    }

    const { textbookId } = req.body;

    if (!textbookId) {
      return res.status(400).json({ error: "textbookId is required." });
    }

    const textbook = await Textbook.findOne({
      _id: textbookId,
      active: true,
      source: "NCERT",
    }).lean();

    if (!textbook) {
      return res.status(404).json({ error: "NCERT chapter not found." });
    }

    if (typeof textbook.sourceUrl !== "string") {
      return res.status(400).json({
        error: "This chapter does not have an NCERT PDF URL.",
      });
    }

    let text = "";

    if (textbook.sourceUrl.startsWith("/textbooks/")) {
      const relativePath = textbook.sourceUrl
        .replace(/^\/textbooks\//, "")
        .replace(/\//g, path.sep);

      const pdfPath = path.resolve(TEXTBOOK_ROOT, relativePath);

      if (!pdfPath.startsWith(TEXTBOOK_ROOT + path.sep)) {
        return res.status(400).json({ error: "Invalid textbook path." });
      }

      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({
          error: "Local NCERT PDF file was not found.",
        });
      }

      text = await extractTextFromPDF(pdfPath);
    } else if (/^https:\/\/ncert\.nic\.in\//i.test(textbook.sourceUrl)) {
      const pdfBuffer = await downloadPdf(textbook.sourceUrl);
      text = await extractTextFromPDFBuffer(pdfBuffer);
    } else {
      return res.status(400).json({
        error: "Unsupported NCERT textbook source.",
      });
    }

    if (!text || text.trim().length < 100) {
      return res.status(400).json({
        error: "Could not extract readable text from this NCERT PDF.",
      });
    }

    const generated = await generateStudyContent(text);

    return res.json({
      ...generated,
      subject: textbook.subject,
      chapter_guess: textbook.chapter,
      class_guess: textbook.classNumber,
      source: "ncert",
      textbookId: String(textbook._id),
      bookCode: textbook.bookCode || "",
    });
  } catch (error) {
    console.error("NCERT card generation error:", error);
    return res.status(500).json({
      error:
        error?.message ||
        "Failed to generate flashcards from this NCERT chapter.",
    });
  }
});

export default router;
