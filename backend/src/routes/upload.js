import express from "express";
import multer from "multer";
import fs from "fs";
import requireAuth from "../middleware/auth.js";
import { extractText } from "../ai/documentParser.js";
import { generateStudyContent } from "../ai/contentGenerator.js";
import Card from "../models/Card.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(requireAuth);

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const studyLanguage =
      typeof req.body.studyLanguage === "string" &&
      req.body.studyLanguage.trim()
        ? req.body.studyLanguage.trim()
        : "English";

    console.log(
      "Upload: Study language:",
      studyLanguage
    );

    const text = await extractText(
      req.file.path,
      req.file.mimetype
    );

    if (!text || text.trim().length < 20) {
      return res.status(400).json({
        error: "Could not extract readable text from this file",
      });
    }

    const generated =
      await generateStudyContent(
        text,
        studyLanguage
      );

    fs.unlink(req.file.path, () => {});

    res.json(generated);
  } catch (err) {
    console.error("Upload error:", err.message);

    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/save-cards", async (req, res) => {
  try {
    const {
      flashcards,
      subject,
      chapter,
      class: userClass,
      source,
    } = req.body;

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({
        error: "No flashcards provided",
      });
    }

    const cardSource =
      source === "ncert"
        ? "ncert"
        : "upload";

    const docs = flashcards.map((f) => ({
      userId: req.userId,
      question: f.question,
      answer: f.answer,
      subject,
      chapter,
      class: userClass,
      source: cardSource,
    }));

    const saved = await Card.insertMany(docs);

    res.json(saved);
  } catch (err) {
    console.error("Save cards error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
