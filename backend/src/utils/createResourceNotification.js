import Notification from "../models/Notification.js";

export async function createResourceNotification({
  title,
  message,
  type,
  resourceId,
  link,
  classNumber,
  board,
}) {
  try {
    console.log("[Notification Debug] Attempting creation:", {
      type,
      resourceId,
      classNumber,
      classType: typeof classNumber,
      isInteger: Number.isInteger(classNumber),
      board,
    });

    if (!Number.isInteger(classNumber) || classNumber < 5 || classNumber > 12) {
      console.warn("[Notification Debug] Rejected by classNumber validation:", {
        classNumber,
        type: typeof classNumber,
      });
      return;
    }

    if (!["CBSE", "ICSE", "State"].includes(board)) {
      console.warn("[Notification Debug] Rejected by board validation:", { board });
      return;
    }

    const created = await Notification.create({
      title,
      message,
      type,
      resourceId: resourceId ? String(resourceId) : null,
      link: link || "/learn",
      classNumber,
      board,
    });

    console.log("[Notification Debug] Successfully created notification:", created._id);
  } catch (error) {
    console.error("[Notification Debug] DB insertion failed:", error);
  }
}
