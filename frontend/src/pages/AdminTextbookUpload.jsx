import { useState } from "react";
import client from "../api/client";
import "./AdminTextbookUpload.css";

export default function AdminTextbookUpload() {
  const [form, setForm] = useState({
    title: "",
    classNumber: "10",
    board: "CBSE",
    subject: "",
    language: "English",
    chapter: "",
    chapterNumber: "1",
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(event) {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setError("The PDF must be 30 MB or smaller.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("pdf", file);

    setBusy(true);
    try {
      const response = await client.post("/admin/textbooks/upload", data);
      setMessage(response.data?.message || "PDF uploaded successfully.");
      setFile(null);
      event.target.reset();
      setForm({
        title: "",
        classNumber: "10",
        board: "CBSE",
        subject: "",
        language: "English",
        chapter: "",
        chapterNumber: "1",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Check that you are signed in as an administrator.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-section-page">
      <div className="admin-section-kicker">ADMINISTRATION</div>
      <h1>Textbook management</h1>
      <p className="admin-section-description">
        Upload textbook PDF files for your selected class and subject.
      </p>

      <section className="textbook-upload-card">
        <h2>Upload a textbook PDF</h2>
        <p className="textbook-upload-hint">PDF only · Maximum file size: 30 MB</p>

        <form onSubmit={submit} className="textbook-upload-form">
          <label>
            Textbook title
            <input name="title" value={form.title} onChange={update} required maxLength={180}
              placeholder="e.g. Science textbook" />
          </label>

          <div className="textbook-upload-grid">
            <label>
              Class
              <select name="classNumber" value={form.classNumber} onChange={update} required>
                {Array.from({ length: 8 }, (_, i) => i + 5).map((n) =>
                  <option key={n} value={n}>{n}</option>
                )}
              </select>
            </label>

            <label>
              Board
              <select name="board" value={form.board} onChange={update} required>
                <option value="CBSE">NCERT</option>
              </select>
            </label>

            <label>
  Subject
  <input
    type="text"
    name="subject"
    list="school-subject-suggestions"
    value={form.subject}
    onChange={update}
    placeholder="Choose or type a subject"
    required
  />
  <datalist id="school-subject-suggestions">
    <option value="Mathematics" />
    <option value="Science" />
    <option value="Social Science" />
    <option value="Environmental Studies (EVS)" />
    <option value="English" />
    <option value="Kannada" />
    <option value="Hindi" />
    <option value="Sanskrit" />
    <option value="Urdu" />
    <option value="Computer Science" />
    <option value="General Knowledge" />
    <option value="Art Education" />
    <option value="Physical Education" />
    <option value="Moral Science" />
    <option value="Work Education" />
    <option value="Biology" />
    <option value="Physics" />
    <option value="Chemistry" />
    <option value="History" />
    <option value="Geography" />
    <option value="Civics" />
    <option value="Economics" />
    <option value="Political Science" />
    <option value="Commerce" />
    <option value="Other" />
  </datalist>
</label>

            <label>
              Chapter name
              <input name="chapter" value={form.chapter} onChange={update} required maxLength={180}
                placeholder="e.g. Real Numbers" />
            </label>

            <label>
              Chapter number
              <input name="chapterNumber" type="number" min="1" max="999"
                value={form.chapterNumber} onChange={update} required />
            </label>
          </div>

          <label className="textbook-file-label">
            PDF file
            <input type="file" accept=".pdf,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)} required />
          </label>

          {file && <p className="textbook-upload-hint">Selected: {file.name}</p>}
          {error && <p className="textbook-upload-error" role="alert">{error}</p>}
          {message && <p className="textbook-upload-success" role="status">{message}</p>}

          <button type="submit" disabled={busy}>
            {busy ? "Uploading PDF..." : "Upload PDF"}
          </button>
        </form>
      </section>
    </main>
  );
}


