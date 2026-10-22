import mongoose from "mongoose";
import Textbook from "./src/models/Textbook.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/memorymesh";

const CORE_SUBJECTS = ["Science", "Mathematics", "Social Science", "English", "Kannada", "Hindi"];

// Generate complete offline-ready State NCERT curriculum for Classes 5 to 10
const ALL_CATALOG = [];

for (let cls = 5; cls <= 10; cls++) {
  CORE_SUBJECTS.forEach((subj) => {
    let title = `State NCERT ${subj} Class ${cls}`;
    let chapter = "Introduction & Core Concepts";
    let language = "English";

    if (subj === "Kannada") {
      title = `ರಾಜ್ಯ ಪಠ್ಯಪುಸ್ತಕ - ಸಿರಿ ಕನ್ನಡ ${cls}`;
      chapter = "ಸಾಹಿತ್ಯ ಮತ್ತು ವ್ಯಾಕರಣ ಪರಿಚಯ";
      language = "Kannada";
    } else if (subj === "Hindi") {
      title = `State NCERT हिंदी व्याकरण एवं पाठ ${cls}`;
      chapter = "वर्ण विचार और गद्य परिचय";
      language = "Hindi";
    } else if (subj === "Mathematics") {
      chapter = cls >= 8 ? "Linear & Algebraic Reasoning" : "Numbers & Real Shapes";
    } else if (subj === "Science") {
      chapter = cls >= 8 ? "Electricity, Cells & Chemical Dynamics" : "Living Systems & Matter";
    }

    ALL_CATALOG.push({
      classNumber: cls,
      board: "State",
      subject: subj,
      language,
      title,
      chapterNumber: 1,
      chapter,
      // Uses local high-speed static path served by Express for instant opening
      sourceUrl: "http://localhost:5000/static/textbooks/sample_chapter.pdf",
      source: "State NCERT (Offline)",
      active: true,
    });

    // Add a Chapter 2 for core analytical subjects
    if (["Science", "Mathematics"].includes(subj)) {
      ALL_CATALOG.push({
        classNumber: cls,
        board: "State",
        subject: subj,
        language,
        title,
        chapterNumber: 2,
        chapter: subj === "Science" ? "Structure of Matter & Systems" : "Geometry, Mensuration & Equations",
        sourceUrl: "http://localhost:5000/static/textbooks/sample_chapter.pdf",
        source: "State NCERT (Offline)",
        active: true,
      });
    }
  });
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    await Textbook.deleteMany({ board: "State" });
    const inserted = await Textbook.insertMany(ALL_CATALOG);
    console.log(`Successfully populated ${inserted.length} offline-ready State NCERT textbooks for Classes 5 through 10!`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
