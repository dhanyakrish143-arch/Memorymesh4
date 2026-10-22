const codes = [
  "jhva1",
  "jhsc1",
  "jhks1",
  "jhsp1",
  "jhsy1",
  "jhkr1",
  "jhss1",
  "jhss2",
  "jhss3",
  "jhss4",
  "jhsk1"
];

for (const code of codes) {
  const url = `https://ncert.nic.in/textbook/pdf/${code}dd.zip`;

  try {
    const r = await fetch(url, { method: "HEAD" });
    console.log(`${code} | ${r.status}`);
  } catch {
    console.log(`${code} | ERROR`);
  }
}
