from pathlib import Path
from pypdf import PdfReader

file = Path("hindi-test/jhmh101.pdf")

reader = PdfReader(str(file))

print("Pages:", len(reader.pages))

for i, page in enumerate(reader.pages[:2]):
    print(f"\n--- PAGE {i + 1} ---")
    text = page.extract_text() or ""
    print(text[:4000])
