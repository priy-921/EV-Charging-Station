import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/sessions/1`)
      .then(res => {
        setSessions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{padding:20}}>
      <h2>Charging Sessions ⚡</h2>

      {loading ? (
        <p>Loading...</p>
      ) : sessions.length === 0 ? (
        <p>No sessions found</p>
      ) : (
        <table border="1" cellPadding="10" style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Start Time</th>
              <th>Energy (kWh)</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map(s => (
              <tr key={s.session_id}>
                <td>{s.session_id}</td>
                <td>{s.start_time}</td>
                <td>{s.energy_consumed}</td>
                <td>{s.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}