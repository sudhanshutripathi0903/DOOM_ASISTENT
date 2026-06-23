import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const port = process.env.PORT || 5000;

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// AI Client Initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/api/status', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    res.json({ status: "ONLINE", database: "CONNECTED", timestamp: dbCheck.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "DEGRADED", error: err.message });
  }
});

// Core Endpoint
app.post('/api/execute', async (req, res) => {
  const { command, token } = req.body;

  if (!token || token !== process.env.AGENT_SECRET_TOKEN) {
    return res.status(403).json({ error: "❌ ACCESS DENIED: INVALID ENCRYPTION KEY" });
  }

  try {
    // 1. Auto-cleanup old logs (7 days retention)
    await pool.query("DELETE FROM logs WHERE executed_at < NOW() - INTERVAL '7 days'");

  // server.js mein isse replace kar do:
const systemInstruction = `
  You are the core intelligence of the OpenClaw Agent Terminal (v2.6).
  The user is HUMAN_BOSS. 
  
  RULES:
  1. For normal answers: Keep it short, technical, and in [BRACKETS] style.
  2. For CODE generation: DO NOT write code in a single line. Use standard coding indentation and line breaks so it looks professional. If possible, wrap code in meaningful sections.
  3. Be a badass agent, but maintain structural clarity for programming tasks.
`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: command,
      config: { systemInstruction: systemInstruction }
    });

    const aiFeedback = aiResponse.text || "[SECURE_NODE]: Command executed with empty response.";

    // 3. Log into Database
    const queryText = 'INSERT INTO logs(command, executed_at) VALUES($1, NOW()) RETURNING *';
    await pool.query(queryText, [`User: ${command} | AI: ${aiFeedback}`]);

    // Send AI Response
    res.json({ feedback: aiFeedback });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "System Core Error", details: err.message });
  }
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        command TEXT NOT NULL,
        executed_at TIMESTAMP NOT NULL
      );
    `);
    console.log("🗄️ PostgreSQL Logs Table Initialized.");
  } catch (err) {
    console.error("❌ DB Init Error:", err.message);
  }
};

app.listen(port, '0.0.0.0', async () => {
  await initDb();
  console.log(`🤖 AI-Powered Agent Core Server listening at port ${port}`);
});