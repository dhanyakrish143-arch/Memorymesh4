import path from 'path';
import notificationsRoutes from "./routes/notifications.js";
import "dotenv/config";

import express from "express";

import { fileURLToPath } from "url";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import adminFlashcardsRoutes from "./routes/adminFlashcards.js";
import adminQuizzesRoutes from "./routes/adminQuizzes.js";
import flashcardSetsRoutes from "./routes/flashcardSets.js";
import cardRoutes from "./routes/cards.js";
import reviewRoutes from "./routes/review.js";
import uploadRoutes from "./routes/upload.js";
import progressRoutes from "./routes/progress.js";
import notesRoutes from "./routes/notes.js";
import assistantRoutes from "./routes/assistant.js";
import evaluatorRoutes from "./routes/evaluator.js";
import studyPlanRoutes from "./routes/studyPlan.js";
import gamesRoutes from "./routes/games.js";
import quizRoutes from "./routes/quiz.js";
import goalRoutes from "./routes/goal.js";
import textbookRoutes from "./routes/textbooks.js";
import adminTextbooksRoutes from "./routes/adminTextbooks.js";
import learnRoutes from "./routes/learn.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEXTBOOK_ROOT = path.resolve(
  __dirname,
  "../../textbooks"
);

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);

app.use(express.json());
app.use('/textbooks/uploads', express.static('D:/Memorymesh4/textbooks/uploads'));
app.use('/textbooks', express.static('D:/Memorymesh4/frontend/public/textbooks'));
app.use('/textbooks', express.static('D:/Memorymesh4/textbooks'));

// Static delivery for State NCERT Textbooks with explicit PDF headers
app.use(
  "/static/textbooks",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    if (req.path.toLowerCase().endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    }
    next();
  },
  express.static(path.resolve("public/textbooks"), {
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
      }
    }
  })
);


// Static delivery for State NCERT Textbooks with permissive PDF frame headers


app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminFlashcardsRoutes);
app.use("/api/admin", adminQuizzesRoutes);
app.use("/api/flashcard-sets", flashcardSetsRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/evaluator", evaluatorRoutes);
app.use("/api/study-plan", studyPlanRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/textbooks", textbookRoutes);
app.use("/api/admin/textbooks", adminTextbooksRoutes);
app.use("/api/learn", learnRoutes);

/*
  Socket.io connection test.
*/

/* Basic Socket.io connection logging */
io.on("connection", (socket) => {
  console.log(
    "[Socket.io] Client connected:",
    socket.id
  );

  socket.on("disconnect", () => {
    console.log(
      "[Socket.io] Client disconnected:",
      socket.id
    );
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Live database name:", mongoose.connection.db.databaseName);
    console.log("MongoDB connected");

    server.listen(
      process.env.PORT,
      () => {
        console.log(
          "Server on port " +
            process.env.PORT
        );
      }
    );
  })
  .catch((err) => {
    console.error(
      "MongoDB connection failed:",
      err
    );

    process.exit(1);
  });



















