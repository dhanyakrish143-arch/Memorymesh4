import User from "../models/User.js";

export default async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("role");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.adminUserId = user._id;
    next();
  } catch (err) {
    next(err);
  }
}
