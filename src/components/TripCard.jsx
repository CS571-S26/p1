import { Card, Badge, Button, Stack } from 'react-bootstrap'
import StarRating from './StarRating'

export default function TripCard({ trip, onRemove, onView }) {
  return (
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
                    {stop.rating != null && <StarRating rating={stop.rating} />}
                    {stop.address && (
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{stop.address}</div>
                    )}
                  </div>
                </div>
              </li>
            ) : (
              <li key={i} className="mb-1 text-muted small">
                <Badge bg="secondary" className="me-1">{i + 1}</Badge>
                No restaurant found
              </li>
            )
          )}
        </ul>
      </Card.Body>

      <Card.Footer className="bg-transparent">
        <Stack direction="horizontal" gap={2}>
          <Button variant="primary" size="sm" onClick={() => onView(trip)}>
            View Trip
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => onRemove(trip.id)}>
            Remove
          </Button>
        </Stack>
      </Card.Footer>
    </Card>
  )
}
