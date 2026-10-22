import express from "express";
import Textbook from "../models/Textbook.js";

const router = express.Router();

/*
  Examples:

  /api/textbooks?class=10
  /api/textbooks?class=10&subject=Mathematics
  /api/textbooks?class=10&subject=Mathematics&language=English
  /api/textbooks?class=10&language=Hindi
*/

router.get("/", async (req, res) => {
  try {
    const rawClass =
      req.query.class ??
      req.query.classNumber;

    const subject =
      typeof req.query.subject === "string"
        ? req.query.subject.trim()
        : "";

    const language =
      typeof req.query.language === "string"
        ? req.query.language.trim()
        : "";

    const board =
      typeof req.query.board === "string"
        ? req.query.board.trim()
        : "";

    if (!["CBSE", "ICSE", "State"].includes(board)) {
      return res.status(400).json({
        error: "board must be CBSE, ICSE, or State.",
      });
    }

    let classNumber = null;

    if (rawClass !== undefined) {
      const match = String(rawClass).match(/\d+/);

      if (match) {
        classNumber = Number(match[0]);
      }
    }

    if (
      !Number.isInteger(classNumber) ||
      classNumber < 5 ||
      classNumber > 12
    ) {
      return res.status(400).json({
        error: "class must be an integer from 5 to 12.",
      });
    }

    const filter = {
      classNumber,
      board,
      active: true,
    };

    if (subject) {
      filter.subject = new RegExp(
        `^${escapeRegExp(subject)}$`,
        "i"
      );
    }

    if (language) {
      filter.language = new RegExp(
        `^${escapeRegExp(language)}$`,
        "i"
      );
    }

    const textbooks = await Textbook.find(filter)
      .sort({
        subject: 1,
        language: 1,
        bookCode: 1,
        chapterNumber: 1,
      })
      .lean();

    res.json({
      success: true,
      classNumber,
      board,
      subject: subject || null,
      language: language || null,
      textbooks,
    });
  } catch (error) {
    console.error("Textbook fetch error:", error);

    res.status(500).json({
      error: "Failed to load textbooks.",
    });
  }
});

function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

export default router;


