import express from "express";
import FlashcardSet from "../models/FlashcardSet.js";
import User from "../models/User.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("class board role")
      .lean();

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (user.role === "admin") {
      return res.json({ success: true, sets: [] });
    }

    const sets = await FlashcardSet.find({
      published: true,
      classNumber: user.class,
      board: user.board,
    })
      .select("title description subject chapter classNumber board cards createdAt updatedAt")
      .sort({ subject: 1, chapter: 1, title: 1 })
      .lean();

    res.json({ success: true, sets });
  } catch (error) {
    console.error("Student flashcard sets fetch failed:", error);
    res.status(500).json({ error: "Could not load published flashcard sets." });
  }
});

export default router;
