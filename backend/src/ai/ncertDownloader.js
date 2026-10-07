import https from "https";

function downloadOnce(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 MemoryMesh/1.0",
          "Accept": "application/pdf,*/*",
          "Connection": "keep-alive",
        },
        timeout: 30000,
      },
      (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();

          return downloadOnce(response.headers.location)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          response.resume();

          return reject(
            new Error(`NCERT returned HTTP ${response.statusCode}`)
          );
        }

        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          resolve(Buffer.concat(chunks));
        });

        response.on("error", reject);
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("NCERT download timed out"));
    });

    request.on("error", reject);
  });
}

export async function downloadPdf(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      console.log(`NCERT download attempt ${attempt}/${attempts}...`);
      return await downloadOnce(url);
    } catch (error) {
      lastError = error;

      console.log(
        `NCERT download attempt ${attempt} failed:`,
        error?.code || error?.message
      );

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw lastError;
}
