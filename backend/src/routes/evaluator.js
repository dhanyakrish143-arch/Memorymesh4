import express from "express";
import requireAuth from "../middleware/auth.js";
import SubjectiveQuestion from "../models/SubjectiveQuestion.js";
import SubjectiveAttempt from "../models/SubjectiveAttempt.js";

const router = express.Router();
router.use(requireAuth);

/* 1. ADMIN & STUDENT: GET questions filtered by class & subject */
router.get("/questions", async (req, res) => {
  try {
    const { classLevel, subject, chapter } = req.query;
    const filter = {};
    if (classLevel) filter.classLevel = Number(classLevel);
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;

    const list = await SubjectiveQuestion.find(filter).sort({ classLevel: 1, createdAt: -1 });
    res.json({ success: true, questions: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 2. ADMIN: POST create question with classLevel */
router.post("/questions", async (req, res) => {
  try {
    const { classLevel, subject, chapter, questionText, totalMarks, modelAnswer, rubricSteps } = req.body;

    if (!subject || !chapter || !questionText || !rubricSteps || rubricSteps.length === 0) {
      return res.status(400).json({ error: "Missing required rubric fields or steps." });
    }

    const question = await SubjectiveQuestion.create({
      classLevel: Number(classLevel) || 10,
      subject,
      chapter,
      questionText,
      totalMarks: Number(totalMarks) || 3,
      modelAnswer,
      rubricSteps,
      createdBy: req.userId
    });

    res.status(201).json({ success: true, question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 3. STUDENT: Evaluate subjective answer */
router.post("/evaluate", async (req, res) => {
  try {
    const { questionId, studentAnswer } = req.body;

    if (!questionId || !studentAnswer || !studentAnswer.trim()) {
      return res.status(400).json({ error: "Question ID and student response are required." });
    }

    const question = await SubjectiveQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Subjective question not found." });
    }

    const lowerAns = studentAnswer.toLowerCase();
    let totalAwarded = 0;
    const breakdown = [];
    const missedKeywords = [];

    for (const step of question.rubricSteps) {
      const stepMax = Number(step.maxMarks) || 1;
      const stepKeywords = step.requiredKeywords || [];
      const matched = stepKeywords.filter((kw) =>
        lowerAns.includes(kw.toLowerCase().trim())
      );

      let stepScore = 0;
      let feedback = "";

      if (stepKeywords.length === 0) {
        stepScore = stepMax;
        feedback = "Step completed.";
      } else {
        const ratio = matched.length / stepKeywords.length;
        if (ratio === 1) {
          stepScore = stepMax;
          feedback = "All mandatory step elements and keywords identified.";
        } else if (ratio >= 0.5) {
          stepScore = Math.round((stepMax * 0.5) * 10) / 10;
          feedback = `Partial formulation. Matched: [${matched.join(", ")}].`;
          const missing = stepKeywords.filter((k) => !matched.includes(k));
          missedKeywords.push(...missing);
        } else {
          stepScore = 0;
          feedback = step.penaltyIfMissing || `Missing required terms: [${stepKeywords.join(", ")}].`;
          missedKeywords.push(...stepKeywords);
        }
      }

      totalAwarded += stepScore;
      breakdown.push({
        title: step.title,
        marksAwarded: stepScore,
        maxMarks: stepMax,
        feedback
      });
    }

    totalAwarded = Math.min(question.totalMarks, Math.round(totalAwarded * 10) / 10);
    const percentage = Math.round((totalAwarded / question.totalMarks) * 100);

    await SubjectiveAttempt.create({
      student: req.userId,
      question: question._id,
      subject: question.subject,
      chapter: question.chapter,
      scoreAwarded: totalAwarded,
      maxMarks: question.totalMarks,
      percentage,
      missedKeywords,
      stepBreakdown: breakdown
    });

    res.json({
      success: true,
      totalAwarded,
      maxMarks: question.totalMarks,
      percentage,
      modelAnswer: question.modelAnswer,
      rubricBreakdown: breakdown,
      examinerSummary:
        totalAwarded === question.totalMarks
          ? "Exceptional: No step deductions incurred. Full board marks secured."
          : `Total step mark deduction: ${(question.totalMarks - totalAwarded).toFixed(1)} marks.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 4. ANALYTICS */
router.get("/analytics", async (req, res) => {
  try {
    const attempts = await SubjectiveAttempt.find({ student: req.userId }).sort({ createdAt: -1 });

    const totalEvaluations = attempts.length;
    if (totalEvaluations === 0) {
      return res.json({
        success: true,
        stats: {
          totalEvaluations: 0,
          averageAccuracy: 0,
          marksSecuredTotal: 0,
          marksAvailableTotal: 0,
          recentAttempts: []
        }
      });
    }

    const marksSecuredTotal = attempts.reduce((acc, curr) => acc + curr.scoreAwarded, 0);
    const marksAvailableTotal = attempts.reduce((acc, curr) => acc + curr.maxMarks, 0);
    const averageAccuracy = Math.round((marksSecuredTotal / marksAvailableTotal) * 100);

    res.json({
      success: true,
      stats: {
        totalEvaluations,
        averageAccuracy,
        marksSecuredTotal: Math.round(marksSecuredTotal * 10) / 10,
        marksAvailableTotal,
        recentAttempts: attempts.slice(0, 5)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 5. SEED: Populate default questions across Class 5 to Class 10 */
router.post("/seed", async (req, res) => {
  try {
    // Delete existing sample questions to upgrade to multi-class 5-10 dataset
    const count = await SubjectiveQuestion.countDocuments({ classLevel: { $exists: true } });
    if (count >= 6) {
      return res.json({ success: true, message: `Multi-class questions already populated (${count} questions).` });
    }

    await SubjectiveQuestion.deleteMany({});

    await SubjectiveQuestion.create([
      // CLASS 5
      {
        classLevel: 5,
        subject: "Science",
        chapter: "Plants and Animals",
        questionText: "What is photosynthesis, and what three things do plants need to produce food? (3 Marks)",
        totalMarks: 3,
        modelAnswer:
          "Photosynthesis is the process by which green plants prepare their own food. To produce food, plants need sunlight, water from the soil, and carbon dioxide from the air, using chlorophyll present in their leaves.",
        rubricSteps: [
          {
            title: "Definition of Photosynthesis",
            maxMarks: 1,
            requiredKeywords: ["process", "food", "plants"],
            penaltyIfMissing: "Loss of 1 mark: Incomplete definition of photosynthesis."
          },
          {
            title: "Required Inputs",
            maxMarks: 1,
            requiredKeywords: ["sunlight", "water", "carbon dioxide"],
            penaltyIfMissing: "Loss of 1 mark: Must list sunlight, water, and carbon dioxide."
          },
          {
            title: "Chlorophyll Role",
            maxMarks: 1,
            requiredKeywords: ["chlorophyll", "green"],
            penaltyIfMissing: "Loss of 1 mark: Omitted role of green chlorophyll pigment."
          }
        ]
      },
      // CLASS 6
      {
        classLevel: 6,
        subject: "Science",
        chapter: "Components of Food",
        questionText: "Why is dietary fibre (roughage) important in our daily diet even though it does not provide nutrients? (2 Marks)",
        totalMarks: 2,
        modelAnswer:
          "Dietary fibre or roughage does not provide nutrients to our body, but it is an essential component because it adds bulk to food and helps our digestive system get rid of undigested food, preventing constipation.",
        rubricSteps: [
          {
            title: "Bulk & Digestion Role",
            maxMarks: 1,
            requiredKeywords: ["bulk", "digestive"],
            penaltyIfMissing: "Loss of 1 mark: Failed to explain adding bulk to food."
          },
          {
            title: "Preventing Constipation",
            maxMarks: 1,
            requiredKeywords: ["undigested", "constipation"],
            penaltyIfMissing: "Loss of 1 mark: Missing explanation of expelling undigested waste."
          }
        ]
      },
      // CLASS 7
      {
        classLevel: 7,
        subject: "Science",
        chapter: "Acids, Bases and Salts",
        questionText: "Explain the process of neutralization with a chemical word equation. (3 Marks)",
        totalMarks: 3,
        modelAnswer:
          "Neutralization is the chemical reaction between an acid and a base. They react together to form salt and water with the evolution of heat. Word equation: Acid + Base -> Salt + Water + Heat.",
        rubricSteps: [
          {
            title: "Reaction Definition",
            maxMarks: 1,
            requiredKeywords: ["acid", "base", "reaction"],
            penaltyIfMissing: "Loss of 1 mark: Incomplete definition of neutralization reaction."
          },
          {
            title: "Reaction Products",
            maxMarks: 1,
            requiredKeywords: ["salt", "water", "heat"],
            penaltyIfMissing: "Loss of 1 mark: Failed to state that salt and water are formed with heat."
          },
          {
            title: "Chemical Word Equation",
            maxMarks: 1,
            requiredKeywords: ["acid + base", "salt + water"],
            penaltyIfMissing: "Loss of 1 mark: Missing clear word equation format."
          }
        ]
      },
      // CLASS 8
      {
        classLevel: 8,
        subject: "Science",
        chapter: "Force and Pressure",
        questionText: "State the formula for pressure and explain why school bags have broad straps instead of thin straps. (3 Marks)",
        totalMarks: 3,
        modelAnswer:
          "Pressure is defined as force acting per unit area (Pressure = Force / Area). School bags are provided with broad shoulder straps because broad straps increase the surface area of contact, which decreases the pressure exerted on the shoulders, making it comfortable to carry.",
        rubricSteps: [
          {
            title: "Formula for Pressure",
            maxMarks: 1,
            requiredKeywords: ["force", "area"],
            penaltyIfMissing: "Loss of 1 mark: Missing formula Pressure = Force / Area."
          },
          {
            title: "Area and Pressure Relationship",
            maxMarks: 1,
            requiredKeywords: ["larger area", "decrease", "pressure"],
            penaltyIfMissing: "Loss of 1 mark: Failed to explain inverse relation between area and pressure."
          },
          {
            title: "Application to Shoulder Straps",
            maxMarks: 1,
            requiredKeywords: ["broad", "shoulder", "comfortable"],
            penaltyIfMissing: "Loss of 1 mark: Missing direct reason for bag straps."
          }
        ]
      },
      // CLASS 9
      {
        classLevel: 9,
        subject: "Science",
        chapter: "Force and Laws of Motion",
        questionText: "State Newton's First Law of Motion and define inertia. (3 Marks)",
        totalMarks: 3,
        modelAnswer:
          "Newton's First Law of Motion states that an object remains in a state of rest or of uniform motion in a straight line unless compelled to change that state by an applied external unbalanced force. Inertia is the natural tendency of an object to resist changes in its state of motion or rest.",
        rubricSteps: [
          {
            title: "Newton's First Law Statement",
            maxMarks: 1.5,
            requiredKeywords: ["rest", "uniform motion", "unbalanced force"],
            penaltyIfMissing: "Loss of 1.5 marks: Incomplete law formulation."
          },
          {
            title: "Definition of Inertia",
            maxMarks: 1.5,
            requiredKeywords: ["inertia", "resist", "tendency"],
            penaltyIfMissing: "Loss of 1.5 marks: Incomplete definition of inertia."
          }
        ]
      },
      // CLASS 10
      {
        classLevel: 10,
        subject: "Science",
        chapter: "Electricity",
        questionText: "State Ohm's Law and express its mathematical formula with standard SI units. (3 Marks)",
        totalMarks: 3,
        modelAnswer:
          "Ohm's Law states that the current through a conductor between two points is directly proportional to the potential difference across the two points, provided its temperature remains constant. Formula: V = I * R, where V is potential difference in Volts, I is current in Amperes, and R is resistance in Ohms (Ω).",
        rubricSteps: [
          {
            title: "Statement of Ohm's Law",
            maxMarks: 1,
            requiredKeywords: ["proportional", "current", "potential difference"],
            penaltyIfMissing: "Loss of 1 mark: Incomplete or inaccurate law statement."
          },
          {
            title: "Crucial Physical Conditions",
            maxMarks: 1,
            requiredKeywords: ["temperature", "constant"],
            penaltyIfMissing: "Loss of 1 mark: Failed to state 'provided temperature remains constant'."
          },
          {
            title: "Mathematical Formula & SI Units",
            maxMarks: 1,
            requiredKeywords: ["v = ir", "ohm"],
            penaltyIfMissing: "Loss of 1 mark: Missing equation or SI unit of resistance (Ohm)."
          }
        ]
      }
    ]);

    res.json({ success: true, message: "Class 5 to 10 subjective question seeds deployed successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
