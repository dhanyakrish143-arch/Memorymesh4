import fs from "fs";

const html = fs.readFileSync("scripts/ncert-catalog.html", "utf8");

const groupRe =
  /else if\s*\(\(document\.test\.tclass\.value\s*==\s*(\d+)\)\s*&&\s*\(document\.test\.tsubject\.options\[sind\]\.text\s*==\s*"([^"]+)"\)\)\s*\{([\s\S]*?)(?=\r?\n\s*else if\s*\(\(document\.test\.tclass\.value\s*==|\r?\n\s*\}\s*else|\r?\n\s*function|\r?\n\s*<\/script>)/g;

const bookRe =
  /document\.test\.tbook\.options\[\d+\]\.text\s*=\s*"([^"]+)"[\s\S]{0,300}?document\.test\.tbook\.options\[\d+\]\.value\s*=\s*"textbook\.php\?([a-z0-9]+)=(\d+)-(\d+)"/g;

const rows = [];
let group;

while ((group = groupRe.exec(html)) !== null) {
  const classNumber = Number(group[1]);
  const subject = group[2];
  const body = group[3];

  let book;
  while ((book = bookRe.exec(body)) !== null) {
    rows.push({
      classNumber,
      subject,
      title: book[1],
      code: book[2],
      first: Number(book[3]),
      last: Number(book[4])
    });
  }

  bookRe.lastIndex = 0;
}

fs.writeFileSync(
  "scripts/ncert-manifest.json",
  JSON.stringify(rows, null, 2),
  "utf8"
);

console.log("MANIFEST CREATED");
console.log("TOTAL ENTRIES:", rows.length);

for (const classNumber of [5, 6, 7, 8, 9, 11, 12]) {
  const items = rows.filter(x => x.classNumber === classNumber);
  console.log(`CLASS ${classNumber}: ${items.length} book entries`);
}
