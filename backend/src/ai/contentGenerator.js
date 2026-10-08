import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are an NCERT curriculum expert for Indian students from Class 5-12.

Analyze the supplied study material.

Return ONLY a JSON object that follows the required schema.

Language rules:
- English must ALWAYS be included.
- The selected study language must ALSO be included.
- If the selected study language is English, generate English only.
- If the selected study language is not English, every flashcard question and answer must contain BOTH English and the selected language.
- Every quiz question, every quiz option, and every quiz explanation must contain BOTH English and the selected language when the selected language is not English.
- The summary must contain BOTH English and the selected language when the selected language is not English.
- Keep the English meaning and translated meaning faithful to each other.
- Do not replace English with the selected language.
- Use the correct native script for the selected language.
- Do not transliterate unless the selected language normally uses Latin script.
- Keep translations natural and appropriate for Indian school students.

Content rules:
- Generate up to 10 flashcards.
- Generate up to 10 quiz questions.
- Every quiz question must have exactly 4 options.
- correct_index must be 0, 1, 2, or 3.
- Stay faithful to the supplied study material.
- Do not invent facts that are not supported by the material.
- Summary should be approximately 150 words in English plus an equivalent concise translation.
`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,

  properties: {
    subject: {
      type: "string",
    },

    chapter_guess: {
      type: "string",
    },

    class_guess: {
      type: "integer",
    },

    flashcards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,

        properties: {
          question: {
            type: "string",
          },

          answer: {
            type: "string",
          },
        },

        required: [
          "question",
          "answer",
        ],
      },
    },

    quiz: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,

        properties: {
          question: {
            type: "string",
          },

          options: {
            type: "array",

            items: {
              type: "string",
            },

            minItems: 4,
            maxItems: 4,
          },

          correct_index: {
            type: "integer",
          },

          explanation: {
            type: "string",
          },
        },

        required: [
          "question",
          "options",
          "correct_index",
          "explanation",
        ],
      },
    },

    summary: {
      type: "string",
    },
  },

  required: [
    "subject",
    "chapter_guess",
    "class_guess",
    "flashcards",
    "quiz",
    "summary",
  ],
};

export async function generateStudyContent(
  text,
  studyLanguage = "English"
) {
  try {
    if (!text || !text.trim()) {
      throw new Error(
        "No study material was extracted from the uploaded file."
      );
    }

    const selectedLanguage =
      typeof studyLanguage === "string" &&
      studyLanguage.trim()
        ? studyLanguage.trim()
        : "English";

    console.log(
      "AI: Selected study language:",
      selectedLanguage
    );

    console.log(
      "AI: Sending extracted text to Groq..."
    );

    console.log(
      "AI: Text length:",
      text.length
    );

    const languageInstruction =
      selectedLanguage === "English"
        ? `
Selected study language: English.

Generate all content in English only.
Do not duplicate English content.
`
        : `
Selected study language: ${selectedLanguage}.

English is mandatory.

For every piece of generated learning content, place the English version first and the ${selectedLanguage} version second.

Use this exact readable pattern inside strings:

English: ...
${selectedLanguage}: ...

For flashcards:
- question must contain English and ${selectedLanguage}.
- answer must contain English and ${selectedLanguage}.

For quizzes:
- question must contain English and ${selectedLanguage}.
- every option must contain English and ${selectedLanguage}.
- explanation must contain English and ${selectedLanguage}.

For the summary:
- provide an English summary first.
- provide the equivalent ${selectedLanguage} summary second.

Do not omit either language.
`;

    const response =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        temperature: 0.2,

        reasoning_effort: "low",

        response_format: {
          type: "json_schema",

          json_schema: {
            name: "study_content",

            strict: true,

            schema: RESPONSE_SCHEMA,
          },
        },

        messages: [
          {
            role: "system",
            content:
              SYSTEM_PROMPT +
              "\n" +
              languageInstruction,
          },

          {
            role: "user",

            content:
              "Create study content from the following material:\n\n" +
              text.slice(0, 12000),
          },
        ],
      });

    const raw =
      response.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error(
        "Groq returned an empty response."
      );
    }

    console.log(
      "AI: Groq response received."
    );

    const parsed = JSON.parse(raw);

    console.log(
      "AI: Flashcards generated:",
      parsed.flashcards?.length || 0
    );

    console.log(
      "AI: Quiz questions generated:",
      parsed.quiz?.length || 0
    );

    return parsed;
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error("GROQ AI ERROR");

    console.error(
      "========================================"
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Status:",
      error?.status
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "Type:",
      error?.type
    );

    console.error(
      "========================================"
    );

    throw new Error(
      "AI content generation failed. Please try again."
    );
  }
}
