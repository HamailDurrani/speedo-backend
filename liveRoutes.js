const express = require('express');
const sql = require('mssql');
const router = express.Router();
// GET /schedule
router.get('/schedule', async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT RouteName, NextArrival
      FROM BusRoutes
      ORDER BY Id
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching schedule:", err);
    res.status(500).json({ error: 'Server error while loading schedule' });
  }
});

//live routes
    router.get('/live-routes', async (req, res) => {
  try {
    const result = await sql.query(`
  SELECT 
  br.Id AS RouteId,
  br.RouteCode,
  br.RouteName,
  br.Status,
  br.NextArrival,
  (
    SELECT 
      rs.StopName AS name,
      rs.Latitude,
      rs.Longitude,
      rs.StopOrder
    FROM RouteStops rs
    WHERE rs.RouteId = br.Id
    ORDER BY rs.StopOrder
    FOR JSON PATH
  ) AS Stops
FROM BusRoutes br
ORDER BY br.Id

    `);

    const routes = result.recordset;
    const formattedRoutes = [];

    for (const route of routes) {
      const stops = JSON.parse(route.Stops);

let sortedStops = [];

if (Array.isArray(stops) && stops.length >= 2) {
  sortedStops = stops.sort((a, b) => a.StopOrder - b.StopOrder);
}
const firstStop = sortedStops[0]?.name;
const lastStop = sortedStops[sortedStops.length - 1]?.name;

let displayRouteName;

if (firstStop && lastStop) {
  displayRouteName = `${firstStop} ➡️ ${lastStop}`;
} else {
  displayRouteName = route.RouteName || 'Unnamed Route';
}

  formattedRoutes.push({
    RouteCode: route.RouteCode,
    RouteName: route.RouteName,
    Status: route.Status,
    NextArrival: route.NextArrival,
    Path: sortedStops.map(s => [parseFloat(s.Latitude), parseFloat(s.Longitude)]),
    Stops: sortedStops.map(s => ({
      name: s.name,
      coords: [parseFloat(s.Latitude), parseFloat(s.Longitude)]
    }))
  });

    }
    res.json(formattedRoutes);
  } catch (err) {
    console.error('Error loading routes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

