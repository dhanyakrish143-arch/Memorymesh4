import mongoose from "mongoose";

const subjectiveAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "SubjectiveQuestion", required: true },
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    scoreAwarded: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    missedKeywords: [{ type: String }],
    stepBreakdown: [
      {
        title: String,
        marksAwarded: Number,
        maxMarks: Number,
        feedback: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("SubjectiveAttempt", subjectiveAttemptSchema);
