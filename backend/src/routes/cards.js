import express from "express";
import Card from "../models/Card.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const cards = await Card.find({ userId: req.userId });
  res.json(cards);
});

router.post("/", async (req, res) => {
  const card = await Card.create({ ...req.body, userId: req.userId });
  res.json(card);
});

/*
 * BKT review update
 *
 * rating:
 * 0 = Still Learning
 * 1 = Moderate
 * 2 = Got It
 */
router.patch("/:id/review", async (req, res) => {
  try {
    const { rating } = req.body;

    if (![0, 1, 2].includes(rating)) {
      return res.status(400).json({
        error: "Rating must be 0 (Still Learning), 1 (Moderate), or 2 (Got It).",
      });
    }

    const card = await Card.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!card) {
      return res.status(404).json({
        error: "Card not found",
      });
    }

    // BKT parameters
    const pT = 0.18; // probability of learning
    const pS = 0.10; // slip probability
    const pG = 0.20; // guess probability

    // Existing mastery probability.
    // Start at 0.20 if this card has never been tracked.
    let pL = Number.isFinite(card.p_l)
      ? card.p_l
      : 0.20;

    // Convert the three learner ratings into evidence.
    // Still Learning = incorrect
    // Moderate = partial evidence
    // Got It = correct
    let observedCorrect;

    if (rating === 0) {
      observedCorrect = false;
    } else if (rating === 1) {
      observedCorrect = null;
    } else {
      observedCorrect = true;
    }

    // BKT update.
    if (observedCorrect === true) {
      const posterior =
        (pL * (1 - pS)) /
        (pL * (1 - pS) + (1 - pL) * pG);

      pL = posterior + (1 - posterior) * pT;
    } else if (observedCorrect === false) {
      const posterior =
        (pL * pS) /
        (pL * pS + (1 - pL) * (1 - pG));

      pL = posterior + (1 - posterior) * pT;
    } else {
      // Moderate = partial evidence.
      // Move the learner toward the middle without treating
      // the response as fully correct or fully incorrect.
      const moderateTarget = 0.55;

      pL = pL + (moderateTarget - pL) * 0.35;
    }

    pL = Math.max(0, Math.min(1, pL));

    // Knowledge status
    let masteryStatus;

    if (pL < 0.60) {
      masteryStatus = "learning";
    } else if (pL < 0.80) {
      masteryStatus = "moderate";
    } else {
      masteryStatus = "mastered";
    }

    // Adaptive review interval.
    let intervalDays;

    if (masteryStatus === "learning") {
      intervalDays = 1;
    } else if (masteryStatus === "moderate") {
      intervalDays = 3;
    } else {
      intervalDays = 7;
    }

    // Successful answers gradually extend the interval.
    if (rating === 2 && card.reviewCount >= 3) {
      intervalDays = Math.min(30, intervalDays + card.reviewCount);
    }

    // Failed answers should come back sooner.
    if (rating === 0) {
      intervalDays = 1;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(
      nextReviewDate.getDate() + intervalDays
    );

    card.p_l = Number(pL.toFixed(4));

    card.reviewCount = (card.reviewCount || 0) + 1;

    if (rating === 2) {
      card.correctCount = (card.correctCount || 0) + 1;
    }

    card.mastered = pL >= 0.80;

    card.reviewHistory = [
      ...(card.reviewHistory || []),
      {
        timestamp: new Date(),
        correct: rating === 2,
        rating,
        p_l: Number(pL.toFixed(4)),
      },
    ];

    card.nextReviewDate = nextReviewDate;

    await card.save();

    res.json({
      success: true,
      cardId: card._id,
      rating,
      mastery: Number((pL * 100).toFixed(1)),
      masteryProbability: Number(pL.toFixed(4)),
      masteryStatus,
      intervalDays,
      nextReviewDate,
      mastered: card.mastered,
    });
  } catch (err) {
    console.error("BKT review update failed:", err);

    res.status(500).json({
      error: "Failed to update BKT review state",
    });
  }
});

router.put("/:id", async (req, res) => {
  const card = await Card.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );

  res.json(card);
});

router.patch("/:id/bookmark", async (req, res) => {
  try {
    const card = await Card.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!card) {
      return res.status(404).json({
        error: "Card not found",
      });
    }

    card.bookmarked = !card.bookmarked;
    await card.save();

    res.json({
      success: true,
      bookmarked: card.bookmarked,
    });
  } catch (err) {
    console.error("Failed to update bookmark:", err);

    res.status(500).json({
      error: "Failed to update bookmark",
    });
  }
});

router.delete("/:id", async (req, res) => {
  await Card.deleteOne({
    _id: req.params.id,
    userId: req.userId,
  });

  res.json({ success: true });
});

export default router;
