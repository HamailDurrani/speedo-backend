require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();
app.use(cors({
  origin: 'https://speedo-frontend-coral.vercel.app',
  credentials: true
}));
app.use(bodyParser.json());

const config = {
 user: 'speedo_user',
  password: '123456',
  server: 'localhost',
  database: 'SpeedoMileDB',
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

//Connect to SQL Server
sql.connect(config)
  .then(() => console.log('Connected to SQL Server'))
  .catch(err => console.error('DB Connection Error:', err));

// Load routes
const liveRoutes = require('./routes/liveRoutes'); // Adjust path if needed
app.use('/', liveRoutes); // Or '/api' if you want '/api/live-routes'

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});


const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});


// AI assistant route

app.post('/ai-suggestion', async (req, res) => {
  const { userInput } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful bus assistant.' },
        { role: 'user', content: userInput }
      ]
    });
    res.json({ suggestion: response.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ error: 'OpenAI error', detail: err.message });
  }
});




// Live bus routes from SQL

app.get('/live-routes', async (req, res) => {
  try {
    await sql.connect(Config);

    const result = await sql.query(`
      SELECT 
        br.Id,
        br.RouteCode,
        br.RouteName,
        br.Status,
        br.NextArrival,
        (
          SELECT Latitude, Longitude
          FROM RouteStops
          WHERE RouteStops.RouteId = br.Id
          ORDER BY StopOrder
          FOR JSON PATH
        ) AS Path,
        (
          SELECT StopName AS name, Latitude, Longitude
          FROM RouteStops
          WHERE RouteStops.RouteId = br.Id
          ORDER BY StopOrder
          FOR JSON PATH
        ) AS Stops
      FROM BusRoutes br
    `);

    const firstStop = sortedStops[0]?.name || 'Start';
const lastStop = sortedStops[sortedStops.length - 1]?.name || 'End';

formattedRoutes.push({
  RouteCode: `R${routeId}`,
  RouteName: `${firstStop} ➡️ ${lastStop}`,
  Path: sortedStops.map(s => s.coords),
  Stops: sortedStops.map(s => ({
    name: s.name,
    coords: s.coords
  }))
});



    res.json(formattedRoutes);
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ 
      error: 'Database error',
      detail: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

        



// Add a new route
app.post('/add-route', async (req, res) => {
  const { RouteName, Description, Status, NextArrival } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query`INSERT INTO BusRoutes (RouteName, Description, Status, NextArrival) 
                    VALUES (${RouteName}, ${Description}, ${Status}, ${NextArrival})`;
    res.json({ message: 'Route added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Insert error', detail: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));


// Health check of server
app.get('/', (req, res) => {
  res.send('Speedo-mile backend is running');
});

// Get route by ID
app.get('/route/:id', async (req, res) => {
  const routeId = req.params.id;

  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT * FROM BusRoutes WHERE Id = ${routeId}`;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});
// feedback form

app.post('/feedback', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await sql.connect(config);
    await sql.query`INSERT INTO Feedbacks (Name, Email, Message) VALUES (${name}, ${email}, ${message})`;
    res.json({ message: 'Feedback saved successfully' });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to save feedback', detail: err.message });
  }
});

