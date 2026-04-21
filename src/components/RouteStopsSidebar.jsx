import { Badge, ListGroup } from 'react-bootstrap'
import StarRating from './StarRating'

const PRICE_LABELS = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

export default function RouteStopsSidebar({ stops, onStopClick }) {
  if (!stops.length) return null

  return (
    <div className="mb-3">
      <h6 className="fw-semibold text-uppercase text-muted small mb-2">Stops Along Route</h6>
      <ListGroup variant="flush" className="border rounded">
        {stops.map((stop, i) => {
          const r = stop.restaurant
          return (
            <ListGroup.Item
              key={i}
              action={!!r}
              onClick={() => {
                if (!r) return
                onStopClick({
                  lat: r.geometry.location.lat(),
                  lng: r.geometry.location.lng(),
                })
              }}
              className="px-3 py-2"
            >
              <div className="d-flex align-items-start gap-2">
                <Badge bg={r ? 'primary' : 'secondary'} className="flex-shrink-0 mt-1">
                  {i + 1}
                </Badge>
                {r ? (
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-semibold small text-truncate">{r.name}</div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <StarRating rating={r.rating} />
                      {r.price_level && (
                        <span className="text-muted small">{PRICE_LABELS[r.price_level]}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted small">No restaurant found</span>
                )}
              </div>
            </ListGroup.Item>
          )
        })}
      </ListGroup>
    </div>
  )
}
