import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
});

const flashcardSetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    subject: { type: String, required: true, trim: true },
    chapter: { type: String, default: "", trim: true },
    classNumber: { type: Number, required: true, min: 5, max: 12 },
    board: {
      type: String,
      enum: ["CBSE", "ICSE", "State"],
      default: "CBSE",
    },
    cards: {
      type: [cardSchema],
      validate: {
        validator: (cards) => cards.length >= 1 && cards.length <= 200,
        message: "A set must contain between 1 and 200 cards.",
      },
    },
    published: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

flashcardSetSchema.index({
  published: 1,
  classNumber: 1,
  board: 1,
  subject: 1,
});

export default mongoose.model("FlashcardSet", flashcardSetSchema);
