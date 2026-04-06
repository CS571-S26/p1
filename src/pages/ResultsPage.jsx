import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Container, Row, Col, Alert, Spinner, Button,
  Toast, ToastContainer,
} from 'react-bootstrap'
import RouteMap from '../components/RouteMap'
import StopCard from '../components/StopCard'
import RestaurantModal from '../components/RestaurantModal'
import FilterPanel from '../components/FilterPanel'
import { useTrips } from '../context/TripContext'

// Returns `count` evenly-spaced points from the path array (excluding endpoints).
function samplePoints(path, count) {
  if (!count || !path.length) return []
  const step = path.length / (count + 1)
  return Array.from({ length: count }, (_, i) => path[Math.floor(step * (i + 1))])
}

// Wraps the callback-based PlacesService.nearbySearch in a Promise.
function nearbySearchAsync(service, request) {
  return new Promise(resolve => {
    service.nearbySearch(request, (results, status) => {
      const { OK, ZERO_RESULTS } = window.google.maps.places.PlacesServiceStatus
      resolve(status === OK ? results : status === ZERO_RESULTS ? [] : [])
    })
  })
}

export default function ResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { saveTrip } = useTrips()

  const searchParams = state?.searchParams

  const [directions, setDirections] = useState(null)
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  // PlacesService requires an HTML element or map; we use a hidden div.
  const attrRef = useRef(null)

  const onMapLoad = useCallback(() => {}, [])

  useEffect(() => {
    if (!searchParams) {
      navigate('/')
      return
    }

    setLoading(true)
    setError('')
    setStops([])
    setDirections(null)

    const { origin, destination, numStops, radius, filters } = searchParams

    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status !== window.google.maps.DirectionsStatus.OK) {
          setError(
            status === 'ZERO_RESULTS'
              ? 'No driving route found between these locations. They may not be within driving distance of each other — please choose different locations.'
              : `Could not get directions (${status}). Please check your locations and try again.`,
          )
          setLoading(false)
          return
        }

        setDirections(result)

        const path = result.routes[0].overview_path
        const points = samplePoints(path, numStops)
        const radiusMeters = Math.min(radius * 1609.34, 50000) // miles → meters, capped at 50 km

        const service = new window.google.maps.places.PlacesService(attrRef.current)

        // Process stops sequentially so we can track which restaurants have
        // already been assigned and avoid showing the same place twice.
        const usedPlaceIds = new Set()
        const stopsData = []

        for (const location of points) {
          const request = {
            location,
            radius: radiusMeters,
            type: 'restaurant',
            ...(filters.cuisine ? { keyword: filters.cuisine } : {}),
            ...(filters.openNow ? { openNow: true } : {}),
            ...(filters.priceRange?.length
              ? {
                  minprice: Math.min(...filters.priceRange),
                  maxprice: Math.max(...filters.priceRange),
                }
              : {}),
          }
          let results = await nearbySearchAsync(service, request)

          // Client-side price filter: the Places API price params are advisory,
          // so we enforce the selection ourselves. Restaurants with no price_level
          // are kept since their level is simply unknown.
          if (filters.priceRange?.length) {
            results = results.filter(
              r => r.price_level == null || filters.priceRange.includes(r.price_level),
            )
          }

          // Sort by rating descending, then pick the best one not yet used.
          results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          const restaurant = results.find(r => !usedPlaceIds.has(r.place_id)) ?? null
          if (restaurant) usedPlaceIds.add(restaurant.place_id)
          stopsData.push({ location, restaurant })
        }

        setStops(stopsData)
        setLoading(false)
      },
    )
  }, [searchParams, navigate])

  function handleSaveTrip() {
    saveTrip({
      origin: searchParams.origin,
      destination: searchParams.destination,
      stops: stops.map(s => ({
        name: s.restaurant?.name ?? null,
        address: s.restaurant?.vicinity ?? null,
        rating: s.restaurant?.rating ?? null,
        placeId: s.restaurant?.place_id ?? null,
      })),
    })
    setToast('Trip saved!')
  }

  function handleSaveRestaurant(restaurant) {
    saveTrip({
      origin: searchParams.origin,
      destination: searchParams.destination,
      stops: [
        {
          name: restaurant.name,
          address: restaurant.vicinity,
          rating: restaurant.rating,
          placeId: restaurant.place_id,
        },
      ],
    })
    setToast(`"${restaurant.name}" saved!`)
  }

  function handleDetails(restaurant) {
    setSelectedRestaurant(restaurant)
    setShowModal(true)
  }

  if (!searchParams) return null

  const { numStops, radius } = searchParams

  return (
    <Container fluid className="py-4">
      {/* Hidden div required by PlacesService for attributions */}
      <div ref={attrRef} style={{ display: 'none' }} />

      <Container>
        {/* Header row */}
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
          <div>
            <h4 className="mb-0 fw-bold">
              {searchParams.origin}
              <span className="text-muted fw-normal"> → </span>
              {searchParams.destination}
            </h4>
            <small className="text-muted">
              {numStops} stop{numStops !== 1 ? 's' : ''} &middot; {radius} mi radius
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/')}>
              New Search
            </Button>
            {stops.length > 0 && (
              <Button variant="success" size="sm" onClick={handleSaveTrip}>
                Save Trip
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="danger">
            {error}
            <div className="mt-2">
              <Button variant="outline-danger" size="sm" onClick={() => navigate('/')}>
                Go back and try again
              </Button>
            </div>
          </Alert>
        )}

        {/* Map + filters side by side */}
        <Row className="mb-4">
          <Col lg={8} className="mb-3 mb-lg-0">
            <RouteMap
              directions={directions}
              stops={stops}
              onMarkerClick={handleDetails}
              onMapLoad={onMapLoad}
            />
          </Col>
          <Col lg={4}>
            <FilterPanel filters={searchParams.filters} onChange={() => {}} readOnly />
          </Col>
        </Row>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Finding the best restaurants along your route…</p>
          </div>
        )}

        {/* Stop cards */}
        {!loading && !error && stops.length > 0 && (
          <>
            <h5 className="mb-3 fw-semibold">
              Restaurant Stops ({stops.filter(s => s.restaurant).length}/{stops.length} found)
            </h5>
            <Row className="g-3">
              {stops.map((stop, i) => (
                <Col sm={6} lg={4} key={i}>
                  <StopCard
                    stop={stop}
                    index={i}
                    onDetails={handleDetails}
                    onSave={handleSaveRestaurant}
                  />
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>

      <RestaurantModal
        restaurant={selectedRestaurant}
        show={showModal}
        onHide={() => setShowModal(false)}
      />

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={!!toast}
          onClose={() => setToast('')}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Body className="text-white fw-semibold">{toast}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  )
}
