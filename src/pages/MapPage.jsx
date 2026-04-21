import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default function MapPage() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/stations')
      .then(res => setStations(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>EV Charging Stations</h2>

      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '500px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {stations.map(s => (
          <Marker key={s.station_id} position={[s.latitude, s.longitude]}>
            <Popup>
              {s.station_name} <br />
              {s.city}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}