import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import QuizSet from "../models/QuizSet.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// List published quizzes only.
router.get("/published", async (req, res) => {
  try {
    const quizzes = await QuizSet.find({ published: true })
      .select("title description subject chapter classNumber board createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json(quizzes);
  } catch (err) {
    console.error("Failed to load published quizzes:", err);
    res.status(500).json({ error: "Failed to load published quizzes." });
  }
});

// Return questions without answers or explanations.
router.get("/published/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID." });
    }

    const quiz = await QuizSet.findOne({
      _id: req.params.id,
      published: true,
    })
      .select("title description subject chapter classNumber board questions.question questions.options")
      .lean();

    if (!quiz) {
      return res.status(404).json({ error: "Published quiz not found." });
    }

    res.json(quiz);
  } catch (err) {
    console.error("Failed to load published quiz:", err);
    res.status(500).json({ error: "Failed to load published quiz." });
  }
});

// Score a submitted published quiz on the server.
router.post("/published/:id/submit", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID." });
    }

    const quiz = await QuizSet.findOne({
      _id: req.params.id,
      published: true,
    }).lean();

    if (!quiz) {
      return res.status(404).json({ error: "Published quiz not found." });
    }

    const answers = req.body.answers;

    if (
      !Array.isArray(answers) ||
      answers.length !== quiz.questions.length ||
      answers.some(
        (answer) =>
          !Number.isInteger(answer) || answer < 0 || answer > 3
      )
    ) {
      return res.status(400).json({
        error: "Submit one valid option index for each question.",
      });
    }

    const results = quiz.questions.map((question, index) => ({
      correct: answers[index] === question.correct_index,
      correct_index: question.correct_index,
      explanation: question.explanation || "",
    }));

    const score = results.filter((result) => result.correct).length;
    const total = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.quizHistory = user.quizHistory || [];
    user.quizHistory.push({
      score,
      total,
      percentage,
      subject: quiz.subject || "General",
      chapter: quiz.chapter || "General",
      completedAt: new Date(),
    });

    if (user.quizHistory.length > 50) {
      user.quizHistory = user.quizHistory.slice(-50);
    }

    await user.save();

    res.json({
      success: true,
      score,
      total,
      percentage,
      results,
    });
  } catch (err) {
    console.error("Published quiz submission failed:", err);
    res.status(500).json({ error: "Failed to submit quiz." });
  }
});

// Retain the existing result endpoint for compatibility.
router.post("/result", async (req, res) => {
  try {
    const { score, total, subject, chapter } = req.body;
    const safeScore = Number(score);
    const safeTotal = Number(total);

    if (
      !Number.isInteger(safeScore) ||
      !Number.isInteger(safeTotal) ||
      safeTotal <= 0 ||
      safeScore < 0 ||
      safeScore > safeTotal
    ) {
      return res.status(400).json({ error: "Invalid quiz result." });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.quizHistory = user.quizHistory || [];
    user.quizHistory.push({
      score: safeScore,
      total: safeTotal,
      percentage: Math.round((safeScore / safeTotal) * 100),
      subject: subject || "General",
      chapter: chapter || "General",
      completedAt: new Date(),
    });

    if (user.quizHistory.length > 50) {
      user.quizHistory = user.quizHistory.slice(-50);
    }

    await user.save();

    res.json({
      success: true,
      result: user.quizHistory[user.quizHistory.length - 1],
    });
  } catch (err) {
    console.error("Failed to save quiz result:", err);
    res.status(500).json({ error: "Failed to save quiz result." });
  }
});

// Keep existing quiz history intact.
router.get("/history", async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("quizHistory");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const history = [...(user.quizHistory || [])]
      .sort(
        (a, b) =>
          new Date(b.completedAt) - new Date(a.completedAt)
      )
      .slice(0, 50);

    res.json(history);
  } catch (err) {
    console.error("Failed to load quiz history:", err);
    res.status(500).json({ error: "Failed to load quiz history." });
  }
});

export default router;
