import { Container, Row, Col, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'
import TripCard from '../components/TripCard'
import EmptyState from '../components/EmptyState'
import { DEFAULT_FILTERS } from '../components/FilterPanel'

export default function SavedTripsPage() {
  const { savedTrips, removeTrip } = useTrips()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  function handleViewTrip(trip) {
    navigate('/results', {
      state: {
        searchParams: {
          origin: trip.origin,
          destination: trip.destination,
          numStops: trip.numStops ?? trip.stops.length,
          radius: trip.radius ?? 10,
          filters: trip.filters ?? DEFAULT_FILTERS,
        },
      },
    })
  }

  return (
    <Container className="py-4">
      {!currentUser && (
        <Alert variant="warning" className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <span>
            You're browsing as a guest — your saved trips will be lost when you refresh or leave this site.{' '}
            <strong>Log in to keep them.</strong>
          </span>
          <Button variant="warning" size="sm" onClick={() => navigate('/login', { state: { from: '/saved' } })}>
            Log In / Sign Up
          </Button>
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">My Trips</h2>
        <Button variant="primary" onClick={() => navigate('/')}>Plan a New Trip</Button>
      </div>

      {savedTrips.length === 0 ? (
        <EmptyState
          icon="🗺️"
          heading="No trips saved yet"
          message='Plan a route and hit "Save Trip", or save individual restaurants from any stop card.'
          actionLabel="Plan a trip"
          onAction={() => navigate('/')}
        />
      ) : (
        <Row className="g-4">
          {savedTrips.map(trip => (
            <Col sm={6} xl={4} key={trip.id}>
              <TripCard trip={trip} onRemove={removeTrip} onView={handleViewTrip} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}
