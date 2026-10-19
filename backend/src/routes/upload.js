import express from "express";
import multer from "multer";
import fs from "fs";
import requireAuth from "../middleware/auth.js";
import { extractText } from "../ai/documentParser.js";
import { generateStudyContent } from "../ai/contentGenerator.js";
import Card from "../models/Card.js";
import User from "../models/User.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(requireAuth);

async function requireAdminRole(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("role").lean();

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Only administrators can generate or save shared learning content.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin permission check failed:", error);
    return res.status(500).json({ error: "Unable to verify permissions." });
  }
}

router.post("/", requireAdminRole, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const studyLanguage =
      typeof req.body.studyLanguage === "string" && req.body.studyLanguage.trim()
        ? req.body.studyLanguage.trim()
        : "English";

    const text = await extractText(req.file.path, req.file.mimetype);

    if (!text || text.trim().length < 20) {
      return res.status(400).json({
        error: "Could not extract readable text from this file.",
      });
    }

    const generated = await generateStudyContent(text, studyLanguage);
    return res.json(generated);
  } catch (error) {
    console.error("Upload error:", error.message);
    return res.status(500).json({
      error: error.message || "Unable to generate study content.",
    });
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

router.post("/save-cards", requireAdminRole, async (req, res) => {
  try {
    const { flashcards, subject, chapter, class: userClass, source } = req.body;

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({ error: "No flashcards provided." });
    }

    const classNumber = Number(userClass);

    if (!Number.isInteger(classNumber) || classNumber < 5 || classNumber > 10) {
      return res.status(400).json({
        error: "Class must be between 5 and 10.",
      });
    }

    if (
      flashcards.some(
        (card) =>
          !card ||
          typeof card.question !== "string" ||
          !card.question.trim() ||
          typeof card.answer !== "string" ||
          !card.answer.trim()
      )
    ) {
      return res.status(400).json({
        error: "Every flashcard must have a question and answer.",
      });
    }

    const cardSource = source === "ncert" ? "ncert" : "upload";

    const docs = flashcards.map((card) => ({
      userId: req.userId,
      question: card.question.trim(),
      answer: card.answer.trim(),
      subject,
      chapter,
      class: classNumber,
      source: cardSource,
    }));

    const saved = await Card.insertMany(docs);
    return res.json(saved);
  } catch (error) {
    console.error("Save cards error:", error);
    return res.status(500).json({
      error: error.message || "Unable to save flashcards.",
    });
  }
});

export default router;
