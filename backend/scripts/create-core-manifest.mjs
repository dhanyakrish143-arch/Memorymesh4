import fs from "fs";

const rows = JSON.parse(
  fs.readFileSync("scripts/ncert-manifest.json", "utf8")
);

const coreByClass = {
  5: [
    "English",
    "Hindi",
    "Mathematics",
    "The World Around Us"
  ],
  6: [
    "English",
    "Hindi",
    "Mathematics",
    "Science",
    "Social Science",
    "Sanskrit"
  ],
  7: [
    "English",
    "Hindi",
    "Mathematics",
    "Science",
    "Social Science",
    "Sanskrit"
  ],
  8: [
    "English",
    "Hindi",
    "Mathematics",
    "Science",
    "Social Science",
    "Sanskrit"
  ],
  9: [
    "English",
    "Hindi",
    "Mathematics",
    "Science",
    "Social Science",
    "Sanskrit"
  ],
  11: [
    "English",
    "Hindi",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Accountancy",
    "Business Studies",
    "Economics",
    "Computer Science",
    "Informatics Practices",
    "History",
    "Geography",
    "Political Science",
    "Psychology",
    "Sociology",
    "Home Science",
    "Sanskrit",
    "Urdu"
  ],
  12: [
    "English",
    "Hindi",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Accountancy",
    "Business Studies",
    "Economics",
    "Computer Science",
    "Informatics Practices",
    "History",
    "Geography",
    "PoliticalScience",
    "Psychology",
    "Sociology",
    "Home Science",
    "Sanskrit",
    "Urdu"
  ]
};

const selected = rows.filter(row =>
  coreByClass[row.classNumber]?.includes(row.subject)
);

fs.writeFileSync(
  "scripts/ncert-core-manifest.json",
  JSON.stringify(selected, null, 2),
  "utf8"
);

console.log("CORE MANIFEST CREATED");
console.log("TOTAL ENTRIES:", selected.length);

for (const c of Object.keys(coreByClass)) {
  const items = selected.filter(x => x.classNumber === Number(c));
  console.log(`CLASS ${c}: ${items.length}`);
}
