const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static('public'));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Important for Railway / Supabase
});

app.post('/vote', async (req, res) => {
  const { option } = req.body;

  if (!option) {
    return res.status(400).json({ error: 'Option is required' });
  }

  let optionText = '';
  if (option === "1") {
    optionText = 'I Agree';
  } else if (option === "2") {
    optionText = 'I Disagree';
  } else {
    return res.status(400).json({ error: 'Invalid option' });
  }

  try {
    const result = await pool.query(
      'UPDATE votes SET count = count + 1 WHERE option_text = $1 RETURNING *',
      [optionText]
    );
    res.status(200).json({ success: true, vote: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

app.get('/results', async (req, res) => {
    try {
      const result = await pool.query('SELECT option_text, count FROM votes');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to get results' });
    }
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });