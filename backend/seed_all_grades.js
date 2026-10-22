import mongoose from "mongoose";
import Textbook from "./src/models/Textbook.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/memorymesh";
const CORE_SUBJECTS = ["Science", "Mathematics", "Social Science", "English", "Kannada", "Hindi"];

const ALL_CATALOG = [];

for (let cls = 5; cls <= 10; cls++) {
  CORE_SUBJECTS.forEach((subj) => {
    let title = `State NCERT ${subj} Class ${cls}`;
    let chapter = "Introduction & Foundations";
    let language = "English";

    if (subj === "Kannada") {
      title = `ರಾಜ್ಯ ಪಠ್ಯಪುಸ್ತಕ - ಸಿರಿ ಕನ್ನಡ ${cls}`;
      chapter = "ಸಾಹಿತ್ಯ ಮತ್ತು ವ್ಯಾಕರಣ ಪರಿಚಯ";
      language = "Kannada";
    } else if (subj === "Hindi") {
      title = `State NCERT हिंदी भाषा एवं साहित्य ${cls}`;
      chapter = "वर्ण विचार और गद्य परिचय";
      language = "Hindi";
    } else if (subj === "Mathematics") {
      chapter = cls >= 8 ? "Linear Equations & Polynomials" : "Numbers, Fractions & Shapes";
    } else if (subj === "Science") {
      chapter = cls >= 8 ? "Electricity, Chemical Reactions & Cells" : "Living Systems & Matter";
    }

    ALL_CATALOG.push({
      classNumber: cls,
      board: "State",
      subject: subj,
      language,
      title,
      chapterNumber: 1,
      chapter,
      sourceUrl: "http://localhost:5000/static/textbooks/sample_chapter.pdf",
      source: "State NCERT (Offline)",
      active: true,
    });

    if (["Science", "Mathematics"].includes(subj)) {
      ALL_CATALOG.push({
        classNumber: cls,
        board: "State",
        subject: subj,
        language,
        title,
        chapterNumber: 2,
        chapter: subj === "Science" ? "Structure of Matter & Systems" : "Geometry & Mensuration",
        sourceUrl: "http://localhost:5000/static/textbooks/sample_chapter.pdf",
        source: "State NCERT (Offline)",
        active: true,
      });
    }
  });
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    await Textbook.deleteMany({ board: "State" });
    const inserted = await Textbook.insertMany(ALL_CATALOG);
    console.log(`SUCCESS: Inserted ${inserted.length} offline-ready textbooks for Classes 5 to 10!`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
