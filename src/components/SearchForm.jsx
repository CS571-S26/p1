import { useState, useRef } from 'react'
import { Form, Button, Row, Col, Alert } from 'react-bootstrap'
import { Autocomplete } from '@react-google-maps/api'
import FilterPanel, { DEFAULT_FILTERS } from './FilterPanel'

export default function SearchForm({ onSearch, initialValues }) {
  // Location inputs are uncontrolled — Google Maps Autocomplete writes directly
  // into the DOM input, so keeping them in React state would cause React to
  // overwrite that value on every re-render (e.g. when filters change).
  const [numStops, setNumStops] = useState(initialValues?.numStops ?? 3)
  const [radius, setRadius] = useState(initialValues?.radius ?? 10)
  const [filters, setFilters] = useState(initialValues?.filters ?? DEFAULT_FILTERS)
  const [error, setError] = useState('')

  const originAcRef = useRef(null)
  const destAcRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()

    const originPlace = originAcRef.current?.getPlace()
    const destPlace = destAcRef.current?.getPlace()

    if (!originPlace?.geometry || !destPlace?.geometry) {
      setError('Please select valid locations from the autocomplete dropdown for both fields.')
      return
    }

    const parsedStops = Number(numStops)
    const parsedRadius = Number(radius)

    if (!Number.isInteger(parsedStops) || parsedStops < 1 || parsedStops > 10) {
      setError('Number of stops must be a whole number between 1 and 10.')
      return
    }

    if (!Number.isFinite(parsedRadius) || parsedRadius < 1 || parsedRadius > 50) {
      setError('Search radius must be between 1 and 50 miles.')
      return
    }

    setError('')
    onSearch({
      origin: originPlace.formatted_address || originPlace.name,
      destination: destPlace.formatted_address || destPlace.name,
      numStops: parsedStops,
      radius: parsedRadius,
      filters,
    })
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mb-3 g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">Starting Point</Form.Label>
            <Autocomplete onLoad={ac => (originAcRef.current = ac)}>
              <Form.Control
                type="text"
                placeholder="e.g. Chicago, IL"
                defaultValue={initialValues?.origin || ''}
                required
              />
            </Autocomplete>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">Destination</Form.Label>
            <Autocomplete onLoad={ac => (destAcRef.current = ac)}>
              <Form.Control
                type="text"
                placeholder="e.g. Nashville, TN"
                defaultValue={initialValues?.destination || ''}
                required
              />
            </Autocomplete>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3 g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              Number of Stops: <span className="text-primary">{numStops}</span>
            </Form.Label>
            <Form.Range
              min={1}
              max={10}
              value={numStops}
              onChange={e => setNumStops(Number(e.target.value))}
            />
            <div className="d-flex justify-content-between">
              <small className="text-muted">1</small>
              <small className="text-muted">10</small>
            </div>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">Search Radius (miles)</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={50}
              step={1}
              value={radius}
              onChange={e => setRadius(e.target.value)}
            />
            <Form.Text className="text-muted">
              How far from your route to search for restaurants (1–50 mi).
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <FilterPanel filters={filters} onChange={setFilters} />

      <Button type="submit" variant="primary" size="lg" className="w-100 mt-2">
        Find Restaurants
      </Button>
    </Form>
  )
}
