import express from "express";
import FlashcardSet from "../models/FlashcardSet.js";
import { createResourceNotification } from "../utils/createResourceNotification.js";
import requireAuth from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

function validateSet(body) {
  const {
    title,
    subject,
    classNumber,
    board = "CBSE",
    cards,
  } = body;

  if (typeof title !== "string" || !title.trim()) {
    return "A title is required.";
  }

  if (typeof subject !== "string" || !subject.trim()) {
    return "A subject is required.";
  }

  if (!Number.isInteger(Number(classNumber)) ||
      Number(classNumber) < 5 ||
      Number(classNumber) > 12) {
    return "Class must be between 5 and 12.";
  }

  if (!["CBSE", "ICSE", "State"].includes(board)) {
    return "Board must be CBSE, ICSE, or State.";
  }

  if (!Array.isArray(cards) || cards.length < 1 || cards.length > 200) {
    return "Provide between 1 and 200 cards.";
  }

  if (cards.some((card) =>
    typeof card.question !== "string" ||
    !card.question.trim() ||
    typeof card.answer !== "string" ||
    !card.answer.trim()
  )) {
    return "Every card needs a question and answer.";
  }

  return null;
}

function normalizeSet(body, createdBy) {
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
    cards: body.cards.map((card) => ({
      question: card.question.trim(),
      answer: card.answer.trim(),
    })),
    published: body.published === true,
    ...(createdBy ? { createdBy } : {}),
  };
}

router.get("/flashcard-sets", async (req, res) => {
  try {
    const sets = await FlashcardSet.find()
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, sets });
  } catch (error) {
    console.error("Admin flashcard sets fetch failed:", error);
    res.status(500).json({ error: "Could not load flashcard sets." });
  }
});

router.post("/flashcard-sets", async (req, res) => {
  try {
    const validationError = validateSet(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const set = await FlashcardSet.create(
      normalizeSet(req.body, req.adminUserId)
    );

    res.status(201).json({ success: true, set });
  } catch (error) {
    console.error("Admin flashcard set creation failed:", error);
    res.status(500).json({ error: "Could not create flashcard set." });
  }
});

router.put("/flashcard-sets/:id", async (req, res) => {
  try {
    const validationError = validateSet(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const set = await FlashcardSet.findByIdAndUpdate(
      req.params.id,
      normalizeSet(req.body),
      { new: true, runValidators: true }
    );

    if (!set) {
      return res.status(404).json({ error: "Flashcard set not found." });
    }

    res.json({ success: true, set });
  } catch (error) {
    console.error("Admin flashcard set update failed:", error);
    res.status(500).json({ error: "Could not update flashcard set." });
  }
});

router.patch("/flashcard-sets/:id/publish", async (req, res) => {
  try {
    if (typeof req.body.published !== "boolean") {
      return res.status(400).json({ error: "published must be true or false." });
    }

    const set = await FlashcardSet.findById(req.params.id);

    if (!set) {
      return res.status(404).json({ error: "Flashcard set not found." });
    }

    const wasPublished = set.published === true;
    set.published = req.body.published;
    await set.save();

    if (!wasPublished && set.published) {
      await createResourceNotification({
        title: "New flashcards available",
        message: `${set.title || set.name || "A flashcard set"} is now available for Class ${set.classNumber}.`,
        type: "flashcard",
        resourceId: set._id,
        link: "/cards",
        classNumber: set.classNumber,
        board: set.board,
      });
    }

    if (!set) {
      return res.status(404).json({ error: "Flashcard set not found." });
    }

    res.json({ success: true, set });
  } catch (error) {
    console.error("Admin flashcard publishing failed:", error);
    res.status(500).json({ error: "Could not change publishing status." });
  }
});

router.delete("/flashcard-sets/:id", async (req, res) => {
  try {
    const result = await FlashcardSet.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ error: "Flashcard set not found." });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Admin flashcard deletion failed:", error);
    res.status(500).json({ error: "Could not delete flashcard set." });
  }
});

export default router;

