import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (options) =>
        options.length === 4 &&
        options.every((option) =>
          typeof option === "string" && option.trim().length > 0
        ),
      message: "Each question must have exactly four non-empty options.",
    },
  },
  correct_index: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: "",
    trim: true,
    maxlength: 5000,
  },
});

const quizSetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    chapter: { type: String, default: "", trim: true, maxlength: 160 },
    classNumber: { type: Number, required: true, min: 5, max: 12 },
    board: {
      type: String,
      enum: ["CBSE", "ICSE", "State"],
      default: "CBSE",
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (questions) =>
          questions.length >= 1 && questions.length <= 100,
        message: "A quiz must contain between 1 and 100 questions.",
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

quizSetSchema.index({
  published: 1,
  classNumber: 1,
  board: 1,
  subject: 1,
});

export default mongoose.model("QuizSet", quizSetSchema);
