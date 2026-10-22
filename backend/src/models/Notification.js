import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    type: {
      type: String,
      enum: ["note", "textbook", "flashcard", "quiz", "announcement"],
      required: true,
    },
    resourceId: { type: String, default: null },
    link: { type: String, default: "/learn" },
    classNumber: { type: Number, min: 5, max: 12, default: null },
    board: {
      type: String,
      enum: ["CBSE", "ICSE", "State", null],
      default: null,
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true }
);

notificationSchema.index({ classNumber: 1, board: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
