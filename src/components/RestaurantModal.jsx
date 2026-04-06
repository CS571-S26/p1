import { useState, useEffect, useRef } from 'react'
import { Modal, Badge, Spinner, Row, Col, ListGroup } from 'react-bootstrap'

const PRICE_LABELS = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

// weekday_text from Places API starts on Monday (index 0).
// JS getDay() returns 0=Sun, 1=Mon, …6=Sat.
// So: weekday_text[0] = Monday = JS day 1 → weekday_text[(jsDay + 6) % 7]
function todayIndex() {
  return (new Date().getDay() + 6) % 7
}

function StarRating({ rating }) {
  if (!rating) return <span className="text-muted">No rating</span>
  const full = Math.round(rating)
  return (
    <span>
      <span className="text-warning fs-5">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
      <span className="text-muted ms-1">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function RestaurantModal({ restaurant, show, onHide }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const attrRef = useRef(null)

  useEffect(() => {
    if (!restaurant || !show) return
    setLoading(true)
    setDetails(null)

    const service = new window.google.maps.places.PlacesService(attrRef.current)
    service.getDetails(
      {
        placeId: restaurant.place_id,
        fields: [
          'name', 'rating', 'user_ratings_total', 'price_level',
          'formatted_address', 'formatted_phone_number', 'website',
          'opening_hours', 'photos', 'reviews', 'types', 'url',
        ],
      },
      (result, status) => {
        setLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setDetails(result)
        }
      },
    )
  }, [restaurant, show])

  const todayIdx = todayIndex()

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{restaurant?.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Required attribution element for PlacesService */}
        <div ref={attrRef} style={{ display: 'none' }} />

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading details…</p>
          </div>
        )}

        {details && !loading && (
          <>
            {/* Photo strip */}
            {details.photos?.length > 0 && (
              <div className="d-flex gap-2 overflow-auto mb-4" style={{ scrollSnapType: 'x mandatory' }}>
                {details.photos.slice(0, 5).map((photo, i) => (
                  <img
                    key={i}
                    src={photo.getUrl({ maxWidth: 400, maxHeight: 260 })}
                    alt={`${details.name} photo ${i + 1}`}
                    className="rounded flex-shrink-0"
                    style={{ height: 180, width: 280, objectFit: 'cover', scrollSnapAlign: 'start' }}
                  />
                ))}
              </div>
            )}

            <Row className="mb-4 g-3">
              {/* Left column: core info */}
              <Col md={6}>
                <div className="mb-2">
                  <StarRating rating={details.rating} />
                  {details.user_ratings_total && (
                    <span className="text-muted ms-1 small">
                      {details.user_ratings_total.toLocaleString()} reviews
                    </span>
                  )}
                </div>

                {details.price_level && (
                  <div className="mb-1">
                    <strong>Price:</strong>{' '}
                    <Badge bg="light" text="dark">{PRICE_LABELS[details.price_level]}</Badge>
                  </div>
                )}

                {details.formatted_address && (
                  <div className="mb-1">
                    <strong>Address:</strong> {details.formatted_address}
                  </div>
                )}

                {details.formatted_phone_number && (
                  <div className="mb-1">
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${details.formatted_phone_number}`}>
                      {details.formatted_phone_number}
                    </a>
                  </div>
                )}

                {details.website && (
                  <div className="mb-1">
                    <strong>Website:</strong>{' '}
                    <a href={details.website} target="_blank" rel="noreferrer" className="text-break">
                      {details.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}

                {details.url && (
                  <div className="mt-2">
                    <a href={details.url} target="_blank" rel="noreferrer">
                      View on Google Maps &rarr;
                    </a>
                  </div>
                )}
              </Col>

              {/* Right column: hours */}
              <Col md={6}>
                {details.opening_hours ? (
                  <>
                    <div className="mb-2">
                      <Badge bg={details.opening_hours.isOpen() ? 'success' : 'danger'}>
                        {details.opening_hours.isOpen() ? 'Open Now' : 'Closed Now'}
                      </Badge>
                    </div>
                    <strong>Hours:</strong>
                    <ListGroup variant="flush" className="mt-1 small">
                      {details.opening_hours.weekday_text?.map((line, i) => (
                        <ListGroup.Item
                          key={i}
                          className={`px-0 py-1 ${i === todayIdx ? 'fw-bold text-primary' : ''}`}
                        >
                          {line}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </>
                ) : (
                  <span className="text-muted small">Hours not available</span>
                )}
              </Col>
            </Row>

            {/* Reviews */}
            {details.reviews?.length > 0 && (
              <>
                <h6 className="border-top pt-3">Recent Reviews</h6>
                {details.reviews.slice(0, 3).map((review, i) => (
                  <div key={i} className="border rounded p-3 mb-2 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="small">{review.author_name}</strong>
                      <span className="text-warning small">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    <small className="text-muted d-block mb-1">{review.relative_time_description}</small>
                    <p className="mb-0 small">{review.text}</p>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}
