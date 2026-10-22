import express from "express";
import Textbook from "../models/Textbook.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rawClass = req.query.class ?? req.query.classNumber;
    const subject = typeof req.query.subject === "string" ? req.query.subject.trim() : "";
    const language = typeof req.query.language === "string" ? req.query.language.trim() : "";
    let rawBoard = typeof req.query.board === "string" ? req.query.board.trim() : "State";

    // Normalize board variations (e.g. "State Board" -> "State")
    let board = "State";
    if (rawBoard.toLowerCase().includes("cbse")) board = "CBSE";
    else if (rawBoard.toLowerCase().includes("icse")) board = "ICSE";
    else board = "State";

    let filter = { board, active: true };

    if (rawClass !== undefined) {
      const match = String(rawClass).match(/\d+/);
      if (match) {
        filter.classNumber = Number(match[0]);
      }
    }

    if (subject && subject.toLowerCase() !== "all" && subject.toLowerCase() !== "all subjects") {
      filter.subject = new RegExp(`^${subject}$`, "i");
    }

    if (language && language.toLowerCase() !== "all") {
      filter.language = new RegExp(`^${language}$`, "i");
    }

    const items = await Textbook.find(filter).sort({ subject: 1, chapterNumber: 1 }).lean();

    // Group chapters under book titles for clean frontend rendering
    const bookMap = new Map();
    for (const item of items) {
      const key = `${item.classNumber}-${item.subject}-${item.title}`;
      if (!bookMap.has(key)) {
        bookMap.set(key, {
          _id: item._id,
          title: item.title,
          subject: item.subject,
          classNumber: item.classNumber,
          board: item.board,
          language: item.language,
          source: item.source,
          chapters: []
        });
      }
      bookMap.get(key).chapters.push({
        chapterNumber: item.chapterNumber,
        title: item.chapter,
        sourceUrl: item.sourceUrl
      });
    }

    const groupedTextbooks = Array.from(bookMap.values());

    return res.json({
      success: true,
      count: items.length,
      textbooks: groupedTextbooks
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
