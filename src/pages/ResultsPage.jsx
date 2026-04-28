import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Container, Row, Col, Alert, Spinner, Button,
  Toast, ToastContainer,
} from 'react-bootstrap'
import RouteMap from '../components/RouteMap'
import StopCard from '../components/StopCard'
import RestaurantModal from '../components/RestaurantModal'
import FilterPanel, { DEFAULT_FILTERS } from '../components/FilterPanel'
import TripSummaryBar from '../components/TripSummaryBar'
import RouteStopsSidebar from '../components/RouteStopsSidebar'
import EmptyState from '../components/EmptyState'
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
  const [routePoints, setRoutePoints] = useState([])
  const [stops, setStops] = useState([])
  const [routeLoading, setRouteLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')
  const [filters, setFilters] = useState(searchParams?.filters ?? DEFAULT_FILTERS)

  // PlacesService requires an HTML element or map; we use a hidden div.
  const attrRef = useRef(null)
  const mapRef = useRef(null)
  const searchGenRef = useRef(0) // incremented on each search; stale searches drop their results

  const onMapLoad = useCallback(() => {}, [])

  // Fetch the driving route once on mount.
  useEffect(() => {
    if (!searchParams) {
      navigate('/')
      return
    }

    setRouteLoading(true)
    setError('')

    const { origin, destination, numStops } = searchParams
    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route(
      { origin, destination, travelMode: window.google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status !== window.google.maps.DirectionsStatus.OK) {
          setError(
            status === 'ZERO_RESULTS'
              ? 'No driving route found between these locations. They may not be within driving distance of each other — please choose different locations.'
              : `Could not get directions (${status}). Please check your locations and try again.`,
          )
          setRouteLoading(false)
          return
        }

        setDirections(result)
        const points = samplePoints(result.routes[0].overview_path, numStops)
        setRoutePoints(points)
        setRouteLoading(false)
      },
    )
  }, [searchParams, navigate])

  // Search restaurants whenever the route points are first ready.
  useEffect(() => {
    if (routePoints.length > 0) {
      runRestaurantSearch(routePoints, filters)
    }
  }, [routePoints]) // eslint-disable-line react-hooks/exhaustive-deps

  async function runRestaurantSearch(points, currentFilters) {
    const gen = ++searchGenRef.current
    setSearching(true)
    setStops([])

    const radiusMeters = Math.min(searchParams.radius * 1609.34, 50000)
    const service = new window.google.maps.places.PlacesService(attrRef.current)
    const usedPlaceIds = new Set()
    const stopsData = []

    for (const location of points) {
      if (gen !== searchGenRef.current) return // a newer search started; abandon this one

      const request = {
        location,
        radius: radiusMeters,
        type: 'restaurant',
        ...(currentFilters.cuisine ? { keyword: currentFilters.cuisine } : {}),
        ...(currentFilters.openNow ? { openNow: true } : {}),
        ...(currentFilters.priceRange?.length
          ? {
              minprice: Math.min(...currentFilters.priceRange),
              maxprice: Math.max(...currentFilters.priceRange),
            }
          : {}),
      }
      let results = await nearbySearchAsync(service, request)

      if (gen !== searchGenRef.current) return // superseded while waiting for API

      // Client-side price filter: the Places API price params are advisory,
      // so we enforce the selection ourselves. Restaurants with no price_level
      // are kept since their level is simply unknown.
      if (currentFilters.priceRange?.length) {
        results = results.filter(
          r => r.price_level == null || currentFilters.priceRange.includes(r.price_level),
        )
      }

      results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      const restaurant = results.find(r => !usedPlaceIds.has(r.place_id)) ?? null
      if (restaurant) usedPlaceIds.add(restaurant.place_id)
      stopsData.push({ location, restaurant })
    }

    if (gen !== searchGenRef.current) return // superseded before final state update
    setStops(stopsData)
    setSearching(false)

    if (mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds()
      stopsData.forEach(s => {
        if (s.restaurant) bounds.extend(s.restaurant.geometry.location)
      })
      if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds)
    }
  }

  function handleApplyFilters() {
    if (routePoints.length > 0) {
      runRestaurantSearch(routePoints, filters)
    }
  }

  function handleSaveTrip() {
    saveTrip({
      origin: searchParams.origin,
      destination: searchParams.destination,
      numStops: searchParams.numStops,
      radius: searchParams.radius,
      filters: searchParams.filters,
      stops: stops.map(s => ({
        name: s.restaurant?.name ?? null,
        address: s.restaurant?.vicinity ?? null,
        rating: s.restaurant?.rating ?? null,
        placeId: s.restaurant?.place_id ?? null,
      })),
    })
    setToast('Trip saved!')
  }

  function handleDetails(restaurant) {
    setSelectedRestaurant(restaurant)
    setShowModal(true)
  }

  function handlePanToStop(latLng) {
    if (mapRef.current) {
      mapRef.current.panTo(latLng)
      mapRef.current.setZoom(15)
    }
  }

  function handleResetView() {
    if (!mapRef.current) return
    const bounds = directions?.routes[0]?.bounds
    if (bounds) {
      mapRef.current.fitBounds(bounds)
    }
  }

  if (!searchParams) return null

  const { numStops, radius } = searchParams
  const loading = routeLoading

  return (
    <Container fluid className="py-4">
      {/* Hidden div required by PlacesService for attributions */}
      <div ref={attrRef} style={{ display: 'none' }} />

      <Container>
        {/* Header row */}
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
          <div>
            <h1 className="h4 mb-0 fw-bold">
              {searchParams.origin}
              <span className="text-muted fw-normal"> → </span>
              {searchParams.destination}
            </h1>
            <small className="text-muted">
              {numStops} stop{numStops !== 1 ? 's' : ''} &middot; {radius} mi radius
            </small>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/')}>
            New Search
          </Button>
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

        {/* Map + sidebar */}
        <Row className="mb-4">
          <Col lg={8} className="mb-3 mb-lg-0">
            <RouteMap
              directions={directions}
              stops={stops}
              onMarkerClick={handleDetails}
              onMapLoad={onMapLoad}
              mapRef={mapRef}
            />
          </Col>
          <Col lg={4}>
            <RouteStopsSidebar stops={stops} onStopClick={handlePanToStop} onResetView={handleResetView} />
            <FilterPanel filters={filters} onChange={setFilters} />
            <Button
              variant="primary"
              className="w-100"
              onClick={handleApplyFilters}
              disabled={searching || loading || routePoints.length === 0}
            >
              {searching ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Searching…
                </>
              ) : (
                'Apply Filters'
              )}
            </Button>
          </Col>
        </Row>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Finding the best restaurants along your route…</p>
          </div>
        )}

        {/* Searching state (filter re-run) */}
        {!loading && searching && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Updating results…</p>
          </div>
        )}

        {/* No results */}
        {!loading && !searching && !error && stops.length > 0 &&
          stops.every(s => !s.restaurant) && (
          <EmptyState
            icon="🍽️"
            heading="No restaurants found"
            message="Try adjusting your filters or increasing the search radius."
          />
        )}

        {/* Stop cards */}
        {!loading && !searching && !error && stops.some(s => s.restaurant) && (
          <>
            <h2 className="h5 mb-3 fw-semibold">
              Restaurant Stops ({stops.filter(s => s.restaurant).length}/{stops.length} found)
            </h2>
            <Row className="g-3">
              {stops.map((stop, i) => (
                <Col sm={6} lg={4} key={i}>
                  <StopCard
                    stop={stop}
                    index={i}
                    origin={searchParams.origin}
                    destination={searchParams.destination}
                    onDetails={handleDetails}
                  />
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Summary bar */}
        {!loading && !error && (
          <TripSummaryBar
            origin={searchParams.origin}
            destination={searchParams.destination}
            directions={directions}
            stops={stops}
            onSave={handleSaveTrip}
          />
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
