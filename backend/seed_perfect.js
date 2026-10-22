import mongoose from "mongoose";
import FlashcardSet from "./src/models/FlashcardSet.js";
import User from "./src/models/User.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/memorymesh";

const SEED_DATA = [
  // --- Class 5 ---
  {
    classNumber: 5,
    board: "State",
    subject: "Science",
    title: "Living and Non-Living Things",
    published: true,
    cards: [
      { question: "What are living things?", answer: "Living things are organisms that can grow, breathe, reproduce, need food, and respond to stimuli." },
      { question: "What is photosynthesis?", answer: "The process by which green plants make food using sunlight, water, and carbon dioxide." }
    ]
  },
  {
    classNumber: 5,
    board: "State",
    subject: "Mathematics",
    title: "Fractions & Shapes",
    published: true,
    cards: [
      { question: "What is a fraction?", answer: "A fraction represents a part of a whole, written with a numerator and denominator." },
      { question: "How many degrees are in a right angle?", answer: "A right angle measures exactly 90 degrees." }
    ]
  },
  {
    classNumber: 5,
    board: "State",
    subject: "Social Science",
    title: "Our Continents and Earth",
    published: true,
    cards: [
      { question: "How many continents are on Earth?", answer: "Seven: Asia, Africa, North America, South America, Antarctica, Europe, and Australia." },
      { question: "What is the equator?", answer: "An imaginary horizontal line that divides the Earth into the Northern and Southern Hemispheres." }
    ]
  },
  {
    classNumber: 5,
    board: "State",
    subject: "English",
    title: "Parts of Speech Basics",
    published: true,
    cards: [
      { question: "What is an adjective?", answer: "A word that describes or qualifies a noun (e.g., deep blue sea, bright sunshine)." },
      { question: "What is the past tense of 'run'?", answer: "The past tense of run is 'ran'." }
    ]
  },
  {
    classNumber: 5,
    board: "State",
    subject: "Kannada",
    title: "ಕನ್ನಡ ವರ್ಣಮಾಲೆ (Kannada Alphabet)",
    published: true,
    cards: [
      { question: "ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಎಷ್ಟು ಅಕ್ಷರಗಳಿವೆ?", answer: "ಒಟ್ಟು ೪೯ (49) ಅಕ್ಷರಗಳಿವೆ." },
      { question: "ಸ್ವರಗಳು ಎಷ್ಟು?", answer: "೧೩ (13) ಸ್ವರಗಳಿವೆ." }
    ]
  },
  {
    classNumber: 5,
    board: "State",
    subject: "Hindi",
    title: "विलोम शब्द (Opposites)",
    published: true,
    cards: [
      { question: "'दिन' का विलोम शब्द क्या है?", answer: "'रात'." },
      { question: "'सत्य' का विलोम शब्द क्या है?", answer: "'असत्य'." }
    ]
  },

  // --- Class 10 ---
  {
    classNumber: 10,
    board: "State",
    subject: "Science",
    title: "Electricity & Circuits",
    published: true,
    cards: [
      { question: "State Ohm's Law.", answer: "The current through a conductor is directly proportional to the potential difference across its terminals, provided temperature remains constant (V = IR)." },
      { question: "What is the SI unit of electrical resistance?", answer: "Ohm (Ω)." },
      { question: "State Joule's Law of Heating.", answer: "H = I²Rt (Heat produced is directly proportional to square of current, resistance, and time)." }
    ]
  },
  {
    classNumber: 10,
    board: "State",
    subject: "Mathematics",
    title: "Quadratic Equations",
    published: true,
    cards: [
      { question: "State the quadratic formula.", answer: "x = (-b ± √(b² - 4ac)) / (2a)." },
      { question: "What is the condition for real and equal roots?", answer: "The discriminant must equal zero: b² - 4ac = 0." }
    ]
  },
  {
    classNumber: 10,
    board: "State",
    subject: "Social Science",
    title: "Constitution and Freedom Movement",
    published: true,
    cards: [
      { question: "Who was the Chairman of the Constitution Drafting Committee?", answer: "Dr. B.R. Ambedkar." },
      { question: "In which year did the Non-Cooperation Movement begin?", answer: "1920." }
    ]
  },
  {
    classNumber: 10,
    board: "State",
    subject: "English",
    title: "Figures of Speech",
    published: true,
    cards: [
      { question: "What is a metaphor?", answer: "A figure of speech making a direct comparison between two unrelated entities without using 'like' or 'as'." },
      { question: "Turn into passive voice: 'She wrote a story.'", answer: "'A story was written by her.'" }
    ]
  },
  {
    classNumber: 10,
    board: "State",
    subject: "Kannada",
    title: "ವ್ಯಾಕರಣ ಮತ್ತು ಸಂಧಿ (Grammar)",
    published: true,
    cards: [
      { question: "ಸಂಧಿ ಎಂದರೇನು?", answer: "ಎರಡು ವರ್ಣಗಳು ಅರ್ಥಪೂರ್ಣವಾಗಿ ಪರಸ್ಪರ ಸೇರುವುದನ್ನು ಸಂಧಿ ಎನ್ನುವರು." },
      { question: "ಲೋಪ ಸಂಧಿಗೆ ಉದಾಹರಣೆ ನೀಡಿ.", answer: "ಮಾತು + ಇಲ್ಲ = ಮಾತಿಲ್ಲ ('ಉ' ಕಾರ ಲೋಪ)." }
    ]
  },
  {
    classNumber: 10,
    board: "State",
    subject: "Hindi",
    title: "हिंदी व्याकरण (Hindi Grammar)",
    published: true,
    cards: [
      { question: "संज्ञा किसे कहते हैं?", answer: "किसी व्यक्ति, वस्तु, स्थान, भाव या गुण के नाम को संज्ञा कहते हैं।" },
      { question: "संधि के मुख्य तीन प्रकार कौन से हैं?", answer: "स्वर संधि, व्यंजन संधि और विसर्ग संधि।" }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne();
    const adminId = user ? user._id : new mongoose.Types.ObjectId();

    await FlashcardSet.deleteMany({});
    const payload = SEED_DATA.map((s) => ({ ...s, createdBy: adminId }));
    const inserted = await FlashcardSet.insertMany(payload);
    console.log(`SUCCESS: Seeded ${inserted.length} sets with question/answer values!`);
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
