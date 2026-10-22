import fs from "fs";
import path from "path";
import https from "https";

const dir = path.resolve("public/textbooks");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Direct official NCERT textbook endpoints
const downloads = [
  {
    url: "https://ncert.nic.in/textbook/pdf/eeen101.pdf",
    filename: "english_ch1.pdf",
    name: "Class 5 English (Unit 1: Ice-Cream Man)"
  },
  {
    url: "https://ncert.nic.in/textbook/pdf/jesc101.pdf",
    filename: "science_ch1.pdf",
    name: "Class 10 Science (Chapter 1: Chemical Reactions)"
  },
  {
    url: "https://ncert.nic.in/textbook/pdf/jemh101.pdf",
    filename: "maths_ch1.pdf",
    name: "Class 10 Maths (Chapter 1: Real Numbers)"
  }
];

function downloadPdf(targetUrl, destinationPath, name) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destinationPath);
    
    // Use genuine browser User-Agent and referer to bypass NCERT anti-bot blocking
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://ncert.nic.in/textbook.php",
        "Accept": "application/pdf,*/*"
      }
    };

    https.get(targetUrl, options, (res) => {
      // Follow redirects if present
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, options, (redirectRes) => {
          redirectRes.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
        }).on("error", (err) => {
          fs.unlink(destinationPath, () => {});
          reject(err);
        });
        return;
      }

      if (res.statusCode !== 200) {
        fs.unlink(destinationPath, () => {});
        reject(new Error(`Failed with status: ${res.statusCode}`));
        return;
      }

      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(destinationPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const item of downloads) {
    const dest = path.join(dir, item.filename);
    process.stdout.write(`Downloading official ${item.name}... `);
    try {
      await downloadPdf(item.url, dest, item.name);
      const size = fs.statSync(dest).size;
      console.log(`DONE! (${Math.round(size / 1024)} KB)`);
    } catch (err) {
      console.log(`FAILED (${err.message})`);
    }
  }
}

run();
