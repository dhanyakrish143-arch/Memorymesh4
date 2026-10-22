import "dotenv/config";
import mongoose from "mongoose";
import Textbook from "./src/models/Textbook.js";

await mongoose.connect(process.env.MONGO_URI);

const books = await Textbook.find({
  classNumber: 10,
  subject: "Hindi",
  language: "Hindi",
  source: "NCERT",
}).sort({ bookCode: 1, chapterNumber: 1 });

console.log("HINDI BOOKS:", books.length);

for (const book of books) {
  console.log(
    `${book.bookCode} | ${book.chapterNumber} | ${book.chapter} | ${book.sourceUrl}`
  );
}

await mongoose.disconnect();
