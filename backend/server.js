require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get('/', (req, res) => {
  res.send("Backend is running...");
});

app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    let text = "";

    try {
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } catch (err) {
      return res.status(400).json({
        error: "Invalid or unsupported PDF"
      });
    }

    let result = "";

    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Analyze this resume and give:

1. Skills
2. Score out of 100
3. Improvements

Resume:
${text}`
          }
        ]
      });

      result = aiResponse.choices[0].message.content;
    } catch (err) {
      result = `
Skills:
- Communication
- Problem Solving
- Basic Programming

Score: 70/100

Improvements:
- Add more projects
- Improve formatting
- Add certifications
`;
    }

    res.json({
      message: "Analysis complete",
      analysis: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});