/*
 * MemoryMesh adaptive spaced-repetition scheduler
 *
 * Three review levels:
 *   still_learning -> immediate reinforcement
 *   moderate       -> review tomorrow
 *   got_it         -> longer spaced review
 */

export function computeNextReview(s_coefficient, rating) {
  const currentS = Math.max(Number(s_coefficient) || 1.3, 1.3);

  const normalizedRating =
    rating === "got_it" || rating === true
      ? "got_it"
      : rating === "moderate"
        ? "moderate"
        : "still_learning";

  let newS;
  let intervalDays;

  if (normalizedRating === "got_it") {
    // Strong recall: increase memory stability significantly.
    newS = currentS * 1.5;
    intervalDays = Math.max(2, Math.round(newS));
  } else if (normalizedRating === "moderate") {
    // Partial recall: modest improvement, review tomorrow.
    newS = currentS * 1.15;
    intervalDays = 1;
  } else {
    // Weak recall: reduce stability and make the card immediately due.
    newS = Math.max(1.3, currentS * 0.6);
    intervalDays = 0;
  }

  const nextReviewDate = new Date();

  if (intervalDays === 0) {
    // Keep the card due immediately for reinforcement.
    nextReviewDate.setTime(Date.now() - 1000);
  } else {
    nextReviewDate.setDate(
      nextReviewDate.getDate() + intervalDays
    );
  }

  return {
    s_coefficient: newS,
    nextReviewDate,
  };
}
