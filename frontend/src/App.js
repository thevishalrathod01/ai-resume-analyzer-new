import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a resume PDF");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setResult("");

      const res = await axios.post("https://ai-resume-analyzer-tvr.onrender.com/upload", formData);
      setResult(res.data.analysis);
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="hero">
        <h1>AI Resume Analyzer</h1>
        <p>Upload your resume and get instant skills, score, and improvement suggestions.</p>

        <div className="upload-card">
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />

          <p className="file-name">{file ? file.name : "No file selected"}</p>

          <button onClick={uploadFile} disabled={loading}>
            {loading ? "Analyzing Resume..." : "Analyze Resume"}
          </button>
        </div>
      </div>

      {result && (
        <div className="result-card">
          <h2>Resume Analysis Result</h2>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default App;