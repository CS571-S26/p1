import { useJsApiLoader } from '@react-google-maps/api'
import { Routes, Route } from 'react-router-dom'
import { Container, Spinner } from 'react-bootstrap'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage.jsx'
import ResultsPage from './pages/ResultsPage'
import SavedTripsPage from './pages/SavedTripsPage'
import LoginPage from './pages/LoginPage'
import { TripProvider } from './context/TripContext'
import { AuthProvider } from './context/AuthContext'

// Declared outside component to avoid re-creating the array on every render,
// which would cause useJsApiLoader to reload the API unnecessarily.
const LIBRARIES = ['places']

export default function App() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  })

  if (loadError) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center text-danger">
          <h4>Failed to load Google Maps</h4>
          <p>Check that your API key in <code>.env</code> is valid and the required APIs are enabled.</p>
        </div>
      </Container>
    )
  }

  if (!isLoaded) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Loading maps…</span>
      </Container>
    )
  }

  return (
    <AuthProvider>
      <TripProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/saved" element={<SavedTripsPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </TripProvider>
    </AuthProvider>
  )
}
