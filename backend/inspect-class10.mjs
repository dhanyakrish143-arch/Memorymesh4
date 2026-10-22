import "dotenv/config";
import mongoose from "mongoose";
import Textbook from "./src/models/Textbook.js";

try {
  await mongoose.connect(process.env.MONGO_URI);

  const books = await Textbook.find({
    classNumber: 10
  }).sort({ subject: 1, language: 1, chapterNumber: 1 });

  console.log("CLASS 10 SUBJECTS/LANGUAGES:");

  for (const book of books) {
    console.log(
      `${book.subject} | ${book.language} | ${book.chapterNumber} | ${book.chapter}`
    );
  }

  await mongoose.disconnect();
} catch (error) {
  console.error("CHECK FAILED:");
  console.error(error);
  process.exit(1);
}
