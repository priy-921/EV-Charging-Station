import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/energy`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{padding:20}}>
      <h2>Energy Usage Dashboard 📊</h2>

      {data.length === 0 ? (
        <p>No data available</p>
      ) : (
        <ul>
          {data.map((d, i) => (
            <li key={i}>
              {d.station_name} — {d.total_kwh} kWh (Month {d.month})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}