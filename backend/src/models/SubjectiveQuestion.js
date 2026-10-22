import mongoose from "mongoose";

const stepRubricSchema = new mongoose.Schema({
  title: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  requiredKeywords: [{ type: String }],
  penaltyIfMissing: { type: String, default: "" }
});

const subjectiveQuestionSchema = new mongoose.Schema(
  {
    classLevel: { type: Number, required: true, min: 5, max: 10, default: 10 },
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    questionText: { type: String, required: true },
    totalMarks: { type: Number, required: true, default: 3 },
    modelAnswer: { type: String, required: true },
    rubricSteps: [stepRubricSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("SubjectiveQuestion", subjectiveQuestionSchema);
