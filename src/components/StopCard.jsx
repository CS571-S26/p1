import { Card, Badge, Button, Stack } from 'react-bootstrap'

const PRICE_LABELS = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

function StarRating({ rating }) {
  if (!rating) return <span className="text-muted small">No rating</span>
  const full = Math.round(rating)
  return (
    <span>
      <span className="text-warning">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
      <span className="text-muted ms-1 small">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function StopCard({ stop, index, onDetails, onSave }) {
  const { restaurant } = stop

  if (!restaurant) {
    return (
      <Card className="mb-3 border-secondary-subtle">
        <Card.Body className="text-muted">
          <Badge bg="secondary" className="me-2">Stop {index + 1}</Badge>
          No restaurants found nearby with the current filters.
        </Card.Body>
      </Card>
    )
  }

  const cuisineTags = restaurant.types
    ?.filter(t => !['restaurant', 'food', 'point_of_interest', 'establishment'].includes(t))
    .slice(0, 3)

  return (
    <Card className="mb-3 shadow-sm h-100">
      {restaurant.photos?.[0] && (
        <Card.Img
          variant="top"
          src={restaurant.photos[0].getUrl({ maxWidth: 400, maxHeight: 200 })}
          alt={restaurant.name}
          style={{ height: 160, objectFit: 'cover' }}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <Badge bg="primary" className="me-2 flex-shrink-0">Stop {index + 1}</Badge>
          {restaurant.price_level && (
            <Badge bg="light" text="dark">{PRICE_LABELS[restaurant.price_level]}</Badge>
          )}
        </div>

        <Card.Title className="mb-1 fs-6">{restaurant.name}</Card.Title>
        <StarRating rating={restaurant.rating} />

        {restaurant.user_ratings_total != null && (
          <small className="text-muted">
            {restaurant.user_ratings_total.toLocaleString()} reviews
          </small>
        )}

        <p className="text-muted small mt-1 mb-2">{restaurant.vicinity}</p>

        {cuisineTags?.length > 0 && (
          <div className="mb-3">
            {cuisineTags.map(t => (
              <Badge key={t} bg="light" text="dark" className="me-1 text-capitalize small">
                {t.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        )}

        <Stack direction="horizontal" gap={2} className="mt-auto">
          <Button size="sm" variant="outline-primary" onClick={() => onDetails(restaurant)}>
            More Info
          </Button>
          <Button size="sm" variant="outline-success" onClick={() => onSave(restaurant)}>
            Save
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  )
}
