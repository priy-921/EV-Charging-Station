require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// 1. GET all stations
app.get('/stations', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM ChargingStation');
  res.json(rows);
});

// 2. GET nearest station — ?lat=18.52&lng=73.85
app.get('/nearest', async (req, res) => {
  const { lat, lng } = req.query;
  const [rows] = await pool.query(
    `SELECT *, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance FROM ChargingStation ORDER BY distance LIMIT 5`,
    [lat, lng, lat]
  );
  res.json(rows);
});

// 3. GET chargers for a station — /chargers/1
app.get('/chargers/:stationId', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM ChargingPoint WHERE station_id = ?',
    [req.params.stationId]
  );
  res.json(rows);
});

// 4. UPDATE charger status — PATCH /charger/1/status
app.patch('/charger/:chargerId/status', async (req, res) => {
  const { status } = req.body; // 'Available', 'Occupied', 'Out of Service'
  await pool.query(
    'UPDATE ChargingPoint SET status = ? WHERE charger_id = ?',
    [status, req.params.chargerId]
  );
  res.json({ message: 'Status updated' });
});

// 5. REGISTER user — POST /users/register
app.post('/users/register', async (req, res) => {
  const { name, phone, email, vehicle_model, reg_no } = req.body;
  const [result] = await pool.query(
    'INSERT INTO User (name, phone, email, vehicle_model, reg_no) VALUES (?, ?, ?, ?, ?)',
    [name, phone, email, vehicle_model, reg_no]
  );
  res.json({ message: 'User registered', user_id: result.insertId });
});

// 6. GET user sessions — /sessions/1
app.get('/sessions/:userId', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM ChargingSession WHERE user_id = ?',
    [req.params.userId]
  );
  res.json(rows);
});

// 7. START a charging session — POST /sessions/start
app.post('/sessions/start', async (req, res) => {
  const { user_id, charger_id } = req.body;
  const [result] = await pool.query(
    'INSERT INTO ChargingSession (user_id, charger_id, start_time, payment_status) VALUES (?, ?, NOW(), "Pending")',
    [user_id, charger_id]
  );
  await pool.query('UPDATE ChargingPoint SET status = "Occupied" WHERE charger_id = ?', [charger_id]);
  res.json({ message: 'Session started', session_id: result.insertId });
});

// 8. END a charging session — PUT /sessions/5/end
app.put('/sessions/:sessionId/end', async (req, res) => {
  const { energy_consumed, total_cost, charger_id } = req.body;
  await pool.query(
    'UPDATE ChargingSession SET end_time = NOW(), energy_consumed = ?, total_cost = ?, payment_status = "Paid" WHERE session_id = ?',
    [energy_consumed, total_cost, req.params.sessionId]
  );
  await pool.query('UPDATE ChargingPoint SET status = "Available" WHERE charger_id = ?', [charger_id]);
  res.json({ message: 'Session ended' });
});

// 9. GET reviews for a station — /reviews/1
app.get('/reviews/:stationId', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM Review WHERE station_id = ?',
    [req.params.stationId]
  );
  res.json(rows);
});

// 10. POST a review — POST /reviews
app.post('/reviews', async (req, res) => {
  const { user_id, station_id, rating, review_text } = req.body;
  const [result] = await pool.query(
    'INSERT INTO Review (user_id, station_id, rating, review_text, review_date) VALUES (?, ?, ?, ?, NOW())',
    [user_id, station_id, rating, review_text]
  );
  res.json({ message: 'Review added', review_id: result.insertId });
});

// 11. GET energy usage
app.get('/energy', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT charger_id, SUM(energy_consumed) as total_energy FROM ChargingSession GROUP BY charger_id'
  );
  res.json(rows);
});

app.listen(process.env.PORT, () => console.log('Server running on port', process.env.PORT));