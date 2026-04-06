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

// GET all stations
app.get('/stations', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM ChargingStation');
  res.json(rows);
});

// GET nearest station
app.get('/nearest', async (req, res) => {
  const { lat, lng } = req.query;
  const [rows] = await pool.query(`CALL find_nearest_station(?, ?)`, [lat, lng]);
  res.json(rows[0]);
});

// GET sessions for a user — /sessions/1
app.get('/sessions/:userId', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM ChargingSession WHERE user_id = ?',
    [req.params.userId]
  );
  res.json(rows);
});

// GET energy usage trends
app.get('/energy', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM ChargingSession');
  res.json(rows);
});

app.listen(process.env.PORT, () => console.log('Server running'));