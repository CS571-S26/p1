import { Button, Spinner } from 'react-bootstrap'

function totalDuration(directions) {
  if (!directions) return null
  const legs = directions.routes[0]?.legs ?? []
  const totalSeconds = legs.reduce((sum, leg) => sum + leg.duration.value, 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.round((totalSeconds % 3600) / 60)
  if (hours === 0) return `${minutes} min`
  return `${hours} hr ${minutes > 0 ? `${minutes} min` : ''}`
}

function totalDistance(directions) {
  if (!directions) return null
  const legs = directions.routes[0]?.legs ?? []
  const totalMeters = legs.reduce((sum, leg) => sum + leg.distance.value, 0)
  const miles = (totalMeters / 1609.34).toFixed(0)
  return `${miles} mi`
}

export default function TripSummaryBar({ origin, destination, directions, stops, onSave, saving }) {
  const duration = totalDuration(directions)
  const distance = totalDistance(directions)
  const found = stops.filter(s => s.restaurant).length

  return (
    <div
      className="bg-dark text-white d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 py-3 mt-4 rounded"
      style={{ position: 'sticky', bottom: 16 }}
    >
      <div>
        <span className="fw-semibold">{origin}</span>
        <span className="mx-2" style={{ color: 'rgba(255,255,255,0.85)' }}>→</span>
        <span className="fw-semibold">{destination}</span>
        <div className="small mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {[duration && `~${duration}`, distance, `${found} of ${stops.length} stops found`]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>

      {stops.length > 0 && (
        <Button
          variant="success"
          size="sm"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? <Spinner animation="border" size="sm" className="me-1" /> : null}
          Save Trip
        </Button>
      )}
    </div>
  )
}
