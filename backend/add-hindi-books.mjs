import "dotenv/config";
import mongoose from "mongoose";
import Textbook from "./src/models/Textbook.js";

await mongoose.connect(process.env.MONGO_URI);

const books = [
  { code: "jhks1", title: "Kshitij-2", chapters: 12 },
  { code: "jhsp1", title: "Sparsh", chapters: 14 },
  { code: "jhsy1", title: "Sanchayan Bhag-2", chapters: 3 },
  { code: "jhkr1", title: "Kritika", chapters: 3 },
];

let inserted = 0;

for (const book of books) {
  for (let chapterNumber = 1; chapterNumber <= book.chapters; chapterNumber++) {
    const chapter = `${book.title} - Chapter ${chapterNumber}`;
    const sourceUrl =
      `https://ncert.nic.in/textbook/pdf/${book.code}${String(chapterNumber).padStart(2, "0")}.pdf`;

    const exists = await Textbook.findOne({
      classNumber: 10,
      subject: "Hindi",
      language: "Hindi",
      source: "NCERT",
      bookCode: book.code,
      chapterNumber,
    });

    if (exists) {
      console.log(`SKIP | ${book.title} | ${chapterNumber}`);
      continue;
    }

    await Textbook.create({
      classNumber: 10,
      subject: "Hindi",
      language: "Hindi",
      source: "NCERT",
      title: book.title,
      bookCode: book.code,
      chapter,
      chapterNumber,
      sourceUrl,
    });

    inserted++;
    console.log(`ADDED | ${book.title} | Chapter ${chapterNumber}`);
  }
}

console.log(`\nINSERTED: ${inserted}`);

await mongoose.disconnect();
