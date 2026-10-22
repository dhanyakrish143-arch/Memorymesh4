import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";

try {
  await mongoose.connect(process.env.MONGO_URI);

  const records = await User.find({ board: "CBSE" })
    .select("role board name email")
    .lean();

  console.log("CBSE record summary:");
  console.table(records.map(user => ({
    role: user.role ?? "(missing)",
    board: user.board ?? "(missing)",
    hasName: Boolean(user.name),
    hasEmail: Boolean(user.email)
  })));
} catch (error) {
  console.log("Diagnostic failed:", error.message);
} finally {
  await mongoose.disconnect();
}
