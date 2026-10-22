import express from "express";
import mongoose from "mongoose";
import QuizSet from "../models/QuizSet.js";
import { createResourceNotification } from "../utils/createResourceNotification.js";
import requireAuth from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

function validateQuiz(body) {
  if (typeof body.title !== "string" || !body.title.trim()) {
    return "A quiz title is required.";
  }

  if (typeof body.subject !== "string" || !body.subject.trim()) {
    return "A subject is required.";
  }

  if (
    !Number.isInteger(Number(body.classNumber)) ||
    Number(body.classNumber) < 5 ||
    Number(body.classNumber) > 12
  ) {
    return "Class must be between 5 and 12.";
  }

  if (!["CBSE", "ICSE", "State"].includes(body.board || "CBSE")) {
    return "Board must be CBSE, ICSE, or State.";
  }

  if (
    !Array.isArray(body.questions) ||
    body.questions.length < 1 ||
    body.questions.length > 100
  ) {
    return "Provide between 1 and 100 questions.";
  }

  for (const question of body.questions) {
    if (
      typeof question.question !== "string" ||
      !question.question.trim() ||
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      question.options.some(
        (option) => typeof option !== "string" || !option.trim()
      ) ||
      !Number.isInteger(question.correct_index) ||
      question.correct_index < 0 ||
      question.correct_index > 3
    ) {
      return "Each question needs text, four options, and a valid correct answer.";
    }
  }

  return null;
}

function normalizeQuiz(body, createdBy) {
  return {
    title: body.title.trim(),
    description: typeof body.description === "string"
      ? body.description.trim()
      : "",
    subject: body.subject.trim(),
    chapter: typeof body.chapter === "string"
      ? body.chapter.trim()
      : "",
    classNumber: Number(body.classNumber),
    board: body.board || "CBSE",
    questions: body.questions.map((question) => ({
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()),
      correct_index: question.correct_index,
      explanation: typeof question.explanation === "string"
        ? question.explanation.trim()
        : "",
    })),
    published: body.published === true,
    ...(createdBy ? { createdBy } : {}),
  };
}

router.get("/quizzes", async (req, res) => {
  try {
    const quizzes = await QuizSet.find()
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, quizzes });
  } catch (error) {
    console.error("Admin quiz fetch failed:", error);
    res.status(500).json({ error: "Could not load quizzes." });
  }
});

router.post("/quizzes", async (req, res) => {
  try {
    const validationError = validateQuiz(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const quiz = await QuizSet.create(
      normalizeQuiz(req.body, req.adminUserId || req.userId)
    );

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error("Admin quiz creation failed:", error);
    res.status(500).json({ error: "Could not create quiz." });
  }
});

router.put("/quizzes/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID." });
    }

    const validationError = validateQuiz(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const quiz = await QuizSet.findByIdAndUpdate(
      req.params.id,
      normalizeQuiz(req.body),
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    console.error("Admin quiz update failed:", error);
    res.status(500).json({ error: "Could not update quiz." });
  }
});

router.patch("/quizzes/:id/publish", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID." });
    }

    if (typeof req.body.published !== "boolean") {
      return res.status(400).json({ error: "published must be true or false." });
    }

    const quiz = await QuizSet.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    const wasPublished = quiz.published === true;
    quiz.published = req.body.published;
    await quiz.save();

    if (!wasPublished && quiz.published) {
      await createResourceNotification({
        title: "New quiz available",
        message: `${quiz.title || quiz.name || "A quiz"} is now available for Class ${quiz.classNumber}.`,
        type: "quiz",
        resourceId: quiz._id,
        link: "/quiz",
        classNumber: quiz.classNumber,
        board: quiz.board,
      });
    }

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    console.error("Admin quiz publishing failed:", error);
    res.status(500).json({ error: "Could not change quiz publishing status." });
  }
});

router.delete("/quizzes/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID." });
    }

    const quiz = await QuizSet.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Admin quiz deletion failed:", error);
    res.status(500).json({ error: "Could not delete quiz." });
  }
});

export default router;

