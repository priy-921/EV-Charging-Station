import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MapPage from './pages/MapPage';
import SessionsPage from './pages/SessionsPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{display:'flex',gap:16,padding:12}}>
        <Link to="/">Map</Link>
        <Link to="/sessions">Sessions</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}