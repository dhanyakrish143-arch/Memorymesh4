import express from "express";
import requireAuth from "../middleware/auth.js";
import Card from "../models/Card.js";
import Note from "../models/Note.js";
import User from "../models/User.js";
import { generateStudyPlan } from "../ai/studyPlanner.js";

const router = express.Router();
router.use(requireAuth);

router.post("/generate", async (req, res) => {
  try {
    const requestedSubjects = Array.isArray(req.body.subjects)
      ? req.body.subjects
      : [req.body.subject];

    const subjects = [...new Set(
      requestedSubjects
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )].slice(0, 30);

    if (!subjects.length) {
      return res.status(400).json({ error: "Choose at least one subject." });
    }

    const minutes = Number(req.body.minutesPerDay);
    if (!Number.isFinite(minutes) || minutes < 10 || minutes > 180) {
      return res.status(400).json({
        error: "Study time must be between 10 and 180 minutes.",
      });
    }

    const chapter =
      typeof req.body.chapter === "string" ? req.body.chapter.trim() : "";

    const subjectFilter = { $in: subjects };
    const cardQuery = {
      userId: req.userId,
      subject: subjectFilter,
    };

    if (chapter) cardQuery.chapter = chapter;

    const user = await User.findById(req.userId)
      .select("quizHistory class board")
      .lean();

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    const noteQuery = {
      subject: subjectFilter,
      $or: [
        {
          userId: null,
          class: user.class,
          board: user.board,
        },
        { userId: req.userId },
      ],
    };

    if (chapter) noteQuery.chapter = chapter;

    const [cards, notes] = await Promise.all([
      Card.find(cardQuery)
        .select("question answer subject p_l reviewCount correctCount chapter")
        .lean(),
      Note.find(noteQuery)
        .select("subject chapter content tags source")
        .lean(),
    ]);

    const subjectSet = new Set(subjects.map((s) => s.toLowerCase()));
    const quizHistory = (user.quizHistory || []).filter((quiz) => {
      if (
        quiz.subject &&
        !subjectSet.has(quiz.subject.toLowerCase())
      ) return false;

      if (
        chapter &&
        quiz.chapter &&
        quiz.chapter.toLowerCase() !== chapter.toLowerCase()
      ) return false;

      return true;
    });

    const plan = await generateStudyPlan({
      subject: subjects.join(", "),
      chapter,
      minutesPerDay: minutes,
      cards,
      notes,
      quizHistory,
    });

    res.json({ success: true, plan });
  } catch (err) {
    console.error("Study Plan generation error:", err);
    res.status(500).json({
      error: err.message || "Failed to generate study plan.",
    });
  }
});

export default router;
