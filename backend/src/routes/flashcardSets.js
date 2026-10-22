import express from 'express';
import requireAuth from '../middleware/auth.js';
import FlashcardSet from '../models/FlashcardSet.js';

const router = express.Router();
router.use(requireAuth);

const SEED_DATA = [
  {
    classNumber: 5,
    board: 'State',
    subject: 'Science',
    title: 'Living and Non-Living Things',
    cards: [
      { question: 'What are living things?', answer: 'Living things are organisms that can grow, breathe, reproduce, need food, and respond to stimuli.' },
      { question: 'What is photosynthesis?', answer: 'The process by which green plants make food using sunlight, water, and carbon dioxide.' }
    ]
  },
  {
    classNumber: 5,
    board: 'State',
    subject: 'Mathematics',
    title: 'Fractions & Geometry',
    cards: [
      { question: 'What is a proper fraction?', answer: 'A fraction where numerator is less than denominator (e.g. 2/5).' },
      { question: 'How many degrees in a right angle?', answer: '90 degrees.' }
    ]
  },
  {
    classNumber: 5,
    board: 'State',
    subject: 'Social Science',
    title: 'Continents and Earth',
    cards: [
      { question: 'How many continents on Earth?', answer: 'Seven: Asia, Africa, North America, South America, Antarctica, Europe, Australia.' },
      { question: 'What is the equator?', answer: 'An imaginary line dividing Earth into Northern and Southern Hemispheres.' }
    ]
  },
  {
    classNumber: 5,
    board: 'State',
    subject: 'English',
    title: 'Parts of Speech',
    cards: [
      { question: 'What is an adjective?', answer: 'A word describing a noun or pronoun.' },
      { question: 'Past tense of run?', answer: 'Ran.' }
    ]
  },
  {
    classNumber: 5,
    board: 'State',
    subject: 'Kannada',
    title: 'Varnamale Basics',
    cards: [
      { question: 'How many letters in Kannada Varnamale?', answer: '49 letters.' },
      { question: 'What are Swaras?', answer: 'Letters pronounced independently.' }
    ]
  },
  {
    classNumber: 5,
    board: 'State',
    subject: 'Hindi',
    title: 'Hindi Shabda',
    cards: [
      { question: 'Opposite of Din?', answer: 'Raat.' },
      { question: 'Opposite of Sach?', answer: 'Jhooth.' }
    ]
  },
  {
    classNumber: 10,
    board: 'State',
    subject: 'Science',
    title: 'Electricity',
    cards: [
      { question: 'State Ohms Law.', answer: 'V = IR provided temperature is constant.' },
      { question: 'SI unit of resistance?', answer: 'Ohm.' }
    ]
  },
  {
    classNumber: 10,
    board: 'State',
    subject: 'Mathematics',
    title: 'Quadratic Equations',
    cards: [
      { question: 'Quadratic formula?', answer: 'x = (-b +/- sqrt(b^2 - 4ac)) / (2a).' },
      { question: 'Condition for equal roots?', answer: 'b^2 - 4ac = 0.' }
    ]
  },
  {
    classNumber: 10,
    board: 'State',
    subject: 'Social Science',
    title: 'Constitution',
    cards: [
      { question: 'Father of Indian Constitution?', answer: 'Dr. B.R. Ambedkar.' },
      { question: 'Non-cooperation movement year?', answer: '1920.' }
    ]
  },
  {
    classNumber: 10,
    board: 'State',
    subject: 'English',
    title: 'Figures of Speech',
    cards: [
      { question: 'What is alliteration?', answer: 'Repetition of consonant sounds.' },
      { question: 'Passive form of: He painted the wall', answer: 'The wall was painted by him.' }
    ]
  },
  {
    classNumber: 10,
    board: 'State',
    subject: 'Kannada',
    title: 'Sandhi Prakara',
    cards: [
      { question: 'What is Sandhi?', answer: 'Joining of sounds without pause.' },
      { question: 'Example of Lopa Sandhi?', answer: 'Maatu + Illa = Maatilla.' }
    ]
  },
  {
    classNumber: 10,
    board: 'State',
    subject: 'Hindi',
    title: 'Vyakaran',
    cards: [
      { question: 'What is Sangya?', answer: 'Name of person, place, or thing.' },
      { question: 'Types of Sandhi?', answer: 'Swar, Vyanjan, and Visarga.' }
    ]
  }
];

router.get('/', async (req, res) => {
  try {
    let sets = await FlashcardSet.find().sort({ classNumber: 1, subject: 1 });
    if (!sets || sets.length === 0) {
      const payload = SEED_DATA.map(s => ({ ...s, createdBy: req.userId }));
      sets = await FlashcardSet.insertMany(payload);
    }
    res.json({ success: true, sets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    await FlashcardSet.deleteMany({});
    const payload = SEED_DATA.map(s => ({ ...s, createdBy: req.userId }));
    const inserted = await FlashcardSet.insertMany(payload);
    res.json({ success: true, count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
