const P_TRANSIT = 0.1;
const P_GUESS = 0.2;
const P_SLIP = 0.1;

function updateWithEvidence(p_l, correct) {
  const p_correct_given_l = 1 - P_SLIP;
  const p_correct_given_not_l = P_GUESS;

  let p_l_given_evidence;

  if (correct) {
    const numerator = p_l * p_correct_given_l;
    const denominator =
      numerator + (1 - p_l) * p_correct_given_not_l;

    p_l_given_evidence = numerator / denominator;
  } else {
    const numerator = p_l * P_SLIP;
    const denominator =
      numerator + (1 - p_l) * (1 - P_GUESS);

    p_l_given_evidence = numerator / denominator;
  }

  return p_l_given_evidence;
}

export function updateMastery(p_l, rating) {
  const current = Number(p_l ?? 0.2);

  const normalized =
    rating === "got_it" || rating === true
      ? "got_it"
      : rating === "moderate"
        ? "moderate"
        : "still_learning";

  let evidence;

  if (normalized === "got_it") {
    evidence = updateWithEvidence(current, true);
  } else if (normalized === "still_learning") {
    evidence = updateWithEvidence(current, false);
  } else {
    // Moderate = partial evidence.
    // It sits between a successful and unsuccessful recall.
    const correctEvidence = updateWithEvidence(current, true);
    const incorrectEvidence = updateWithEvidence(current, false);

    evidence =
      (correctEvidence + incorrectEvidence) / 2;
  }

  const newP_l =
    evidence + (1 - evidence) * P_TRANSIT;

  return Math.min(Math.max(newP_l, 0), 1);
}
