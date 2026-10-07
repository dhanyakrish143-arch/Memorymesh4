import "dotenv/config";
import mongoose from "mongoose";
import Textbook from "./src/models/Textbook.js";

await mongoose.connect(process.env.MONGO_URI);

const result = await Textbook.updateMany(
  {
    source: "NCERT",
    active: true,
    chapter: "",
    chapterNumber: null
  },
  {
    $set: {
      active: false
    }
  }
);

console.log("Invalid textbook records deactivated:", result.modifiedCount);

await mongoose.disconnect();
