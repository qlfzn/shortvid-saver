const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS food_places (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        tags TEXT,
        link TEXT NOT NULL,
        date_saved TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table ready");
  } catch (err) {
    console.error("❌ Error creating table:", err);
  }
})();

// Save a food place
app.post('/api/save-food', async (req, res) => {
  try {
    const { name, location, tags, link, date } = req.body;
    if (!name || !link) {
      return res.status(400).json({ error: 'Name and link are required' });
    }

    const result = await pool.query(
      `INSERT INTO food_places (name, location, tags, link, date_saved)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, location, tags, link, date || new Date()]
    );

    res.json({ success: true, place: result.rows[0] });
  } catch (err) {
    console.error("❌ Error saving food place:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all food places
app.get('/api/food', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_places ORDER BY date_saved DESC');
    res.json({ places: result.rows });
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
