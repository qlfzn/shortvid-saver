require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// simple API-key middleware (your existing logic)
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Save a food place
app.post('/api/save-food', async (req, res) => {
  try {
    const { name, description, location, tags, link, date_to_go } = req.body;
    if (!name || !link) return res.status(400).json({ error: 'Name and link are required' });

    const { data, error } = await supabase
      .from('food_places')
      .insert([{
        name,
        description,
        location,
        tags,
        link,
        date_to_go
      }]).select();

    if (error) throw error;
    res.json({ success: true, place: data[0] });
  } catch (err) {
    console.error('error saving food place:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Get all food places
app.get('/api/food', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('food_places')
      .select('*')
      .order('date_to_go', { ascending: false });

    if (error) throw error;
    res.json({ places: data });
  } catch (err) {
    console.error('error fetching data:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server running on ${port}`));
