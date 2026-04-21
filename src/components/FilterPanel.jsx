import { Form, Card, Button } from 'react-bootstrap'

export const DEFAULT_FILTERS = {
  cuisine: '',
  priceRange: [],
  openNow: false,
}

const CUISINES = [
  { value: '', label: 'Any cuisine' },
  { value: 'italian', label: 'Italian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'american', label: 'American' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'indian', label: 'Indian' },
  { value: 'thai', label: 'Thai' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'fast food', label: 'Fast Food' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'bbq', label: 'BBQ' },
]

const PRICE_LEVELS = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
]

export default function FilterPanel({ filters, onChange, readOnly = false }) {
  function handle(field, value) {
    if (!readOnly) onChange({ ...filters, [field]: value })
  }

  function togglePrice(level) {
    if (readOnly) return
    const updated = filters.priceRange.includes(level)
      ? filters.priceRange.filter(p => p !== level)
      : [...filters.priceRange, level].sort()
    handle('priceRange', updated)
  }

  function reset() {
    if (!readOnly) onChange(DEFAULT_FILTERS)
  }

  return (
    <Card className="mb-3">
      <Card.Header className="fw-semibold d-flex justify-content-between align-items-center">
        <span>Filters</span>
        {!readOnly && (
          <Button variant="link" size="sm" className="p-0 text-muted" onClick={reset}>
            Reset
          </Button>
        )}
      </Card.Header>
      <Card.Body className="d-flex flex-column gap-3">
        <Form.Group>
          <Form.Label className="fw-semibold small text-uppercase text-muted mb-1">
            Cuisine
          </Form.Label>
          <Form.Select
            value={filters.cuisine}
            onChange={e => handle('cuisine', e.target.value)}
            disabled={readOnly}
            size="sm"
          >
            {CUISINES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label className="fw-semibold small text-uppercase text-muted mb-1">
            Price Range
            {filters.priceRange.length === 0 && (
              <span className="text-muted fw-normal ms-1" style={{ textTransform: 'none' }}>
                — Any
              </span>
            )}
          </Form.Label>
          <div className="d-flex gap-2 flex-wrap">
            {PRICE_LEVELS.map(({ value, label }) => {
              const active = filters.priceRange.includes(value)
              return (
                <Button
                  key={value}
                  variant={active ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => togglePrice(value)}
                  disabled={readOnly}
                  style={{ minWidth: 44 }}
                >
                  {label}
                </Button>
              )
            })}
          </div>
        </Form.Group>

        <Form.Check
          type="switch"
          id="open-now"
          label="Open now"
          checked={filters.openNow}
          onChange={e => handle('openNow', e.target.checked)}
          disabled={readOnly}
        />

      </Card.Body>
    </Card>
  )
}
