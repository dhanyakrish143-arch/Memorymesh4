import "dotenv/config";
import mongoose from "mongoose";
import Textbook from "./src/models/Textbook.js";

await mongoose.connect(process.env.MONGO_URI);

const books = await Textbook.aggregate([
  {
    $match: {
      source: "NCERT",
      active: true
    }
  },
  {
    $group: {
      _id: {
        class: "$classNumber",
        subject: "$subject",
        language: "$language"
      },
      url: { $first: "$sourceUrl" },
      title: { $first: "$title" }
    }
  },
  {
    $sort: {
      "_id.class": 1,
      "_id.subject": 1
    }
  }
]);

console.dir(books, { depth: null });

await mongoose.disconnect();
