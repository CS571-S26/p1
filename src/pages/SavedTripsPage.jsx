import { useState } from 'react'
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

const PRICE_LABELS = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

export default function SavedTripsPage() {
  const { savedTrips, removeTrip } = useTrips()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)


  return (
    <Container className="py-4">
      <AuthModal show={showAuth} onHide={() => setShowAuth(false)} />

      {!currentUser && (
        <Alert variant="warning" className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <span>
            You're browsing as a guest — your saved trips will be lost when you leave this page.{' '}
            <strong>Log in to keep them.</strong>
          </span>
          <Button variant="warning" size="sm" onClick={() => setShowAuth(true)}>
            Log In / Sign Up
          </Button>
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">My Trips</h2>
        <Button variant="primary" onClick={() => navigate('/')}>
          Plan a New Trip
        </Button>
      </div>

      {savedTrips.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>No trips have been saved yet</Alert.Heading>
          <p>Plan a route and hit <strong>My Trip</strong> or save individual restaurants using
          the <strong>Save</strong> button on any stop card.</p>
          <Button variant="info" onClick={() => navigate('/')}>Get started</Button>
        </Alert>
      ) : (
        <Row className="g-4">
          {savedTrips.map(trip => (
            <Col sm={6} xl={4} key={trip.id}>
              <Card className="h-100 shadow-sm">
                <Card.Header className="bg-dark text-white">
                  <div className="fw-semibold text-truncate" title={`${trip.origin} → ${trip.destination}`}>
                    {trip.origin}
                  </div>
                  <div className="text-white-50 small">
                    <span className="me-1">→</span>{trip.destination}
                  </div>
                </Card.Header>

                <Card.Body>
                  <small className="text-muted d-block mb-3">
                    Saved on {new Date(trip.savedAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </small>

                  <strong className="small text-uppercase text-muted">
                    {trip.stops.length} Stop{trip.stops.length !== 1 ? 's' : ''}
                  </strong>
                  <ul className="list-unstyled mt-2 mb-0">
                    {trip.stops.map((stop, i) =>
                      stop.name ? (
                        <li key={i} className="mb-2">
                          <div className="d-flex align-items-start gap-2">
                            <Badge bg="primary" className="flex-shrink-0 mt-1">{i + 1}</Badge>
                            <div>
                              <div className="fw-semibold small">{stop.name}</div>
                              {stop.rating != null && (
                                <span className="text-warning small">
                                  {'★'.repeat(Math.round(stop.rating))} {stop.rating.toFixed(1)}
                                </span>
                              )}
                              {stop.address && (
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {stop.address}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ) : (
                        <li key={i} className="mb-1 text-muted small">
                          <Badge bg="secondary" className="me-1">{i + 1}</Badge>
                          No restaurant found
                        </li>
                      ),
                    )}
                  </ul>
                </Card.Body>

                <Card.Footer className="bg-transparent">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeTrip(trip.id)}
                  >
                    Remove
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}
