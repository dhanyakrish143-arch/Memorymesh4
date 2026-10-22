import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import User from "../models/User.js";
import Card from "../models/Card.js";
import Note from "../models/Note.js";
import Textbook from "../models/Textbook.js";
import FlashcardSet from "../models/FlashcardSet.js";
import QuizSet from "../models/QuizSet.js";
import requireAuth from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);
// Admin Content Library: metadata only, for shared learning resources.
router.get("/content-library", async (req, res) => {
  try {
    const [notes, textbooks, flashcardSets, quizzes] = await Promise.all([
      Note.find({ userId: null })
        .select("subject chapter class board source updatedAt createdAt")
        .sort({ updatedAt: -1 })
        .limit(500)
        .lean(),

      Textbook.find()
        .select("title subject chapter classNumber board language chapterNumber active sourceUrl updatedAt createdAt")
        .sort({ updatedAt: -1 })
        .limit(500)
        .lean(),

      FlashcardSet.find()
        .select("title description subject chapter classNumber board cards published updatedAt createdAt")
        .sort({ updatedAt: -1 })
        .limit(500)
        .lean(),

      QuizSet.find()
        .select("title description subject chapter classNumber board questions published updatedAt createdAt")
        .sort({ updatedAt: -1 })
        .limit(500)
        .lean(),
    ]);

    const items = [
      ...notes.map((item) => ({
        id: String(item._id),
        type: "Note",
        title: `${item.subject} — ${item.chapter}`,
        subject: item.subject,
        chapter: item.chapter,
        classNumber: item.class,
        board: item.board || "NCERT",
        status: "Shared",
        count: null,
        updatedAt: item.updatedAt || item.createdAt,
      })),

      ...textbooks.map((item) => ({
        id: String(item._id),
        type: "Textbook",
        title: item.title,
        subject: item.subject,
        chapter: item.chapter,
        classNumber: item.classNumber,
        board: item.board,
        status: item.active ? "Active" : "Inactive",
        count: item.chapterNumber ? `Chapter ${item.chapterNumber}` : null,
        updatedAt: item.updatedAt || item.createdAt,
      })),

      ...flashcardSets.map((item) => ({
        id: String(item._id),
        type: "Flashcard Set",
        title: item.title,
        subject: item.subject,
        chapter: item.chapter,
        classNumber: item.classNumber,
        board: item.board,
        status: item.published ? "Published" : "Draft",
        count: `${(item.cards || []).length} cards`,
        updatedAt: item.updatedAt || item.createdAt,
      })),

      ...quizzes.map((item) => ({
        id: String(item._id),
        type: "Quiz",
        title: item.title,
        subject: item.subject,
        chapter: item.chapter,
        classNumber: item.classNumber,
        board: item.board,
        status: item.published ? "Published" : "Draft",
        count: `${(item.questions || []).length} questions`,
        updatedAt: item.updatedAt || item.createdAt,
      })),
    ];

    items.sort((a, b) =>
      new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    );

    res.json({
      success: true,
      totals: {
        notes: notes.length,
        textbooks: textbooks.length,
        flashcardSets: flashcardSets.length,
        quizzes: quizzes.length,
        all: items.length,
      },
      items,
    });
  } catch (error) {
    console.error("Admin content library fetch failed:", error);
    res.status(500).json({ error: "Could not load the content library." });
  }
});

router.get("/overview", async (req, res) => {
  try {
    const [totalStudents, activeStudents, totalXp] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({
        role: "student",
        lastActiveDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      User.aggregate([
        { $match: { role: "student" } },
        { $group: { _id: null, total: { $sum: "$xp" } } },
      ]),
    ]);

    res.json({
      totalStudents,
      activeStudents,
      totalXp: totalXp[0]?.total ?? 0,
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({ error: "Unable to load admin overview" });
  }
});

router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name email class board xp streak createdAt lastActiveDate")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ students });
  } catch (err) {
    console.error("Admin students error:", err);
    res.status(500).json({ error: "Unable to load students" });
  }
});


router.get("/analytics", async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    const students = await User.find({ role: "student" })
      .select("_id name lastActiveDate")
      .lean();

    const studentIds = students.map((student) => student._id);

    const cards = studentIds.length
      ? await Card.find({ userId: { $in: studentIds } })
          .select("userId subject chapter p_l mastered reviewCount correctCount reviewHistory")
          .lean()
      : [];

    const totalCards = cards.length;
    const totalReviews = cards.reduce(
      (sum, card) => sum + Number(card.reviewCount || 0), 0
    );
    const totalCorrect = cards.reduce(
      (sum, card) => sum + Number(card.correctCount || 0), 0
    );
    const masteredCards = cards.filter(
      (card) => card.mastered === true
    ).length;

    const topicsMap = {};

    for (const card of cards) {
      const subject = card.subject || "General";
      const chapter = card.chapter || "Uncategorized";
      const key = JSON.stringify([subject, chapter]);

      if (!topicsMap[key]) {
        topicsMap[key] = {
          subject,
          chapter,
          totalCards: 0,
          masteredCards: 0,
          masteryTotal: 0,
          reviews: 0,
          correct: 0
        };
      }

      const topic = topicsMap[key];
      topic.totalCards += 1;
      topic.masteredCards += card.mastered ? 1 : 0;
      topic.masteryTotal += Math.max(
        0, Math.min(1, Number(card.p_l ?? 0.3))
      );
      topic.reviews += Number(card.reviewCount || 0);
      topic.correct += Number(card.correctCount || 0);
    }

    const weakTopics = Object.values(topicsMap)
      .map((topic) => ({
        subject: topic.subject,
        chapter: topic.chapter,
        totalCards: topic.totalCards,
        masteredCards: topic.masteredCards,
        mastery: Math.round(
          topic.masteryTotal / topic.totalCards * 100
        ),
        reviews: topic.reviews,
        accuracy: topic.reviews
          ? Math.round(topic.correct / topic.reviews * 100)
          : 0
      }))
      .filter((topic) => topic.mastery < 70)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 10);

    const activityMap = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      activityMap[key] = { date: key, reviews: 0, correct: 0 };
    }

    for (const card of cards) {
      for (const review of card.reviewHistory || []) {
        if (!review.reviewedAt) continue;

        const key = new Date(review.reviewedAt)
          .toISOString().slice(0, 10);

        if (activityMap[key]) {
          activityMap[key].reviews += 1;
          if (review.correct) activityMap[key].correct += 1;
        }
      }
    }

    const activeStudents = students.filter(
      (student) =>
        student.lastActiveDate &&
        new Date(student.lastActiveDate) >= sevenDaysAgo
    ).length;

    res.json({
      success: true,
      overview: {
        totalStudents: students.length,
        activeStudents,
        totalCards,
        totalReviews,
        totalCorrect,
        accuracy: totalReviews
          ? Math.round(totalCorrect / totalReviews * 100)
          : 0,
        masteredCards,
        mastery: totalCards
          ? Math.round(masteredCards / totalCards * 100)
          : 0
      },
      weeklyActivity: Object.values(activityMap),
      weakTopics
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({
      error: "Unable to load admin analytics"
    });
  }
});

router.get("/students-performance", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name email class board xp streak createdAt lastActiveDate quizHistory")
      .lean();

    const cardStats = await Card.aggregate([
      {
        $group: {
          _id: "$userId",
          totalCards: { $sum: 1 },
          totalReviews: { $sum: { $ifNull: ["$reviewCount", 0] } },
          correctReviews: { $sum: { $ifNull: ["$correctCount", 0] } },
          masteredCards: {
            $sum: { $cond: [{ $eq: ["$mastered", true] }, 1, 0] }
          }
        }
      }
    ]);

    const statsByUser = new Map(
      cardStats.map((item) => [String(item._id), item])
    );

    const results = students.map((student) => {
      const stats = statsByUser.get(String(student._id)) || {
        totalCards: 0,
        totalReviews: 0,
        correctReviews: 0,
        masteredCards: 0
      };

      const quizzes = student.quizHistory || [];
      const quizAverage = quizzes.length
        ? Math.round(
            quizzes.reduce((sum, quiz) => sum + Number(quiz.percentage || 0), 0)
              / quizzes.length
          )
        : null;

      return {
        id: String(student._id),
        name: student.name,
        email: student.email,
        class: student.class,
        board: student.board,
        xp: student.xp || 0,
        streak: student.streak || 0,
        createdAt: student.createdAt || null,
        lastActiveDate: student.lastActiveDate || null,
        totalCards: stats.totalCards,
        totalReviews: stats.totalReviews,
        correctReviews: stats.correctReviews,
        accuracy: stats.totalReviews
          ? Math.round(stats.correctReviews / stats.totalReviews * 100)
          : 0,
        masteredCards: stats.masteredCards,
        mastery: stats.totalCards
          ? Math.round(stats.masteredCards / stats.totalCards * 100)
          : 0,
        quizCount: quizzes.length,
        quizAverage
      };
    });

    results.sort((a, b) => {
      const dateA = a.lastActiveDate ? new Date(a.lastActiveDate).getTime() : 0;
      const dateB = b.lastActiveDate ? new Date(b.lastActiveDate).getTime() : 0;
      return dateB - dateA;
    });

    res.json({ success: true, students: results });
  } catch (err) {
    console.error("Student performance error:", err);
    res.status(500).json({ error: "Unable to load student performance" });
  }
});

// Admin Notes Management: only shared notes (userId: null).
function normalizeSharedNoteInput(body = {}) {
  const subject = String(body.subject || "").trim();
  const chapter = String(body.chapter || "").trim();
  const content = String(body.content || "").trim();
  const board = String(body.board || "NCERT").trim() || "NCERT";
  const classValue = body.class === "" || body.class == null
    ? undefined
    : Number(body.class);
  const tags = Array.isArray(body.tags)
    ? body.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : String(body.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);

  if (!subject || !chapter || !content) {
    return { error: "Subject, chapter, and content are required." };
  }
  if (classValue !== undefined &&
      (!Number.isInteger(classValue) || classValue < 5 || classValue > 12)) {
    return { error: "Class must be a whole number from 5 to 12." };
  }

  return {
    value: {
      subject,
      chapter,
      content,
      board,
      class: classValue,
      tags,
      userId: null,
    },
  };
}

router.get("/notes", async (req, res) => {
  try {
    const filter = { userId: null };
    const search = String(req.query.search || "").trim();
    const classValue = String(req.query.class || "").trim();
    const board = String(req.query.board || "").trim();

    if (classValue) {
      const parsedClass = Number(classValue);
      if (!Number.isInteger(parsedClass) || parsedClass < 5 || parsedClass > 12) {
        return res.status(400).json({ error: "Invalid class filter." });
      }
      filter.class = parsedClass;
    }
    if (board) filter.board = board;

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { subject: regex },
        { chapter: regex },
        { content: regex },
        { board: regex },
        { tags: regex },
      ];
    }

    const notes = await Note.find(filter)
      .select("subject chapter class board content source tags createdAt updatedAt userId")
      .sort({ updatedAt: -1 })
      .limit(500)
      .lean();

    res.json({ notes });
  } catch (error) {
    console.error("Admin notes list error:", error);
    res.status(500).json({ error: "Could not load shared notes." });
  }
});

router.post("/notes", async (req, res) => {
  try {
    const parsed = normalizeSharedNoteInput(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const note = await Note.create({
      ...parsed.value,
      source: "seed",
    });

    res.status(201).json({ note });
  } catch (error) {
    console.error("Admin note create error:", error);
    res.status(500).json({ error: "Could not create the shared note." });
  }
});

router.put("/notes/:id", async (req, res) => {
  try {
    const parsed = normalizeSharedNoteInput(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: null },
      { $set: { ...parsed.value, source: "seed" } },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Shared note not found." });
    }
    res.json({ note });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid note ID." });
    }
    console.error("Admin note update error:", error);
    res.status(500).json({ error: "Could not update the shared note." });
  }
});

router.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: null,
    });

    if (!note) {
      return res.status(404).json({ error: "Shared note not found." });
    }
    res.json({ message: "Shared note deleted." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid note ID." });
    }
    console.error("Admin note delete error:", error);
    res.status(500).json({ error: "Could not delete the shared note." });
  }
});

// ADMIN_SHARED_PDF_UPLOAD_ROUTES
const sharedPdfDir = path.resolve(process.cwd(), "uploads", "shared-notes");
fs.mkdirSync(sharedPdfDir, { recursive: true });

const pdfUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, sharedPdfDir),
    filename: (_req, _file, cb) => cb(null, `${crypto.randomUUID()}.pdf`),
  }),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname || "").toLowerCase() === ".pdf";
    cb(isPdf ? null : new Error("Upload a PDF file only."), isPdf);
  },
});

router.post("/notes/pdf", (req, res, next) => {
  pdfUpload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: err.code === "LIMIT_FILE_SIZE"
          ? "PDF must be 20 MB or smaller."
          : err.message || "Could not upload this PDF.",
      });
    }
    next();
  });
}, async (req, res) => {
  let storedPath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Choose a PDF file to upload." });
    }

    storedPath = req.file.path;
    const fd = fs.openSync(storedPath, "r");
    const header = Buffer.alloc(5);
    const bytesRead = fs.readSync(fd, header, 0, 5, 0);
    fs.closeSync(fd);

    if (bytesRead !== 5 || header.toString("ascii") !== "%PDF-") {
      fs.unlink(storedPath, () => {});
      return res.status(400).json({ error: "The uploaded file is not a valid PDF." });
    }

    const subject = typeof req.body.subject === "string" ? req.body.subject.trim() : "";
    const chapter = typeof req.body.chapter === "string" ? req.body.chapter.trim() : "";
    const board = typeof req.body.board === "string" ? req.body.board.trim() : "NCERT";
    const classValue = req.body.class === "" || req.body.class == null
      ? null
      : Number(req.body.class);

    if (!subject || !chapter || !board) {
      fs.unlink(storedPath, () => {});
      return res.status(400).json({ error: "Subject, chapter and board are required." });
    }
    if (subject.length > 120 || chapter.length > 180 || board.length > 80) {
      fs.unlink(storedPath, () => {});
      return res.status(400).json({ error: "One or more metadata fields are too long." });
    }
    if (classValue !== null && (!Number.isInteger(classValue) || classValue < 5 || classValue > 12)) {
      fs.unlink(storedPath, () => {});
      return res.status(400).json({ error: "Class must be between 5 and 12, or left unspecified." });
    }

    const note = await Note.create({
      userId: null,
      subject,
      chapter,
      class: classValue,
      board,
      content: `PDF study resource: ${path.basename(req.file.originalname, ".pdf")}`,
      source: "upload",
      tags: [],
      pdfStorageName: path.basename(req.file.filename),
      pdfOriginalName: path.basename(req.file.originalname).slice(0, 240),
      pdfMimeType: "application/pdf",
    });

    return res.status(201).json({ success: true, note });
  } catch (error) {
    if (storedPath) fs.unlink(storedPath, () => {});
    console.error("Shared PDF upload failed:", error);
    return res.status(500).json({ error: "Could not save the PDF resource." });
  }
});

router.delete("/notes/pdf/:id", async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: null });
    if (!note || !note.pdfStorageName) {
      return res.status(404).json({ error: "PDF resource not found." });
    }

    const filename = path.basename(note.pdfStorageName);
    await Note.deleteOne({ _id: note._id, userId: null });
    fs.unlink(path.join(sharedPdfDir, filename), (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("Could not remove stored PDF:", err.message);
      }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Shared PDF deletion failed:", error);
    return res.status(500).json({ error: "Could not delete the PDF resource." });
  }
});
export default router;







