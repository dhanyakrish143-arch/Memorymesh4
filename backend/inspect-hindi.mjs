import "dotenv/config";
import mongoose from "mongoose";
import Textbook from "./src/models/Textbook.js";

try {
  await mongoose.connect(process.env.MONGO_URI);

  const books = await Textbook.find({
    classNumber: 10,
    subject: "Hindi",
    language: "Hindi",
    source: "NCERT"
  }).sort({ chapterNumber: 1 });

  console.log("HINDI BOOKS:");

  for (const book of books) {
    console.log(
      `${book.chapterNumber} | ${book.chapter} | ${book.sourceUrl}`
    );
  }

  await mongoose.disconnect();
} catch (error) {
  console.error("CHECK FAILED:");
  console.error(error);
  process.exit(1);
}
