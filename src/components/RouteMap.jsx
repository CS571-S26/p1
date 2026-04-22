import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api'
import ErrorBoundary from './ErrorBoundary'

const MAP_CONTAINER_STYLE = { width: '100%', height: '480px', borderRadius: '8px' }
const DEFAULT_CENTER = { lat: 39.5, lng: -98.35 } // geographic center of the US
const MAP_OPTIONS = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
}

export default function RouteMap({ directions, stops, onMarkerClick, onMapLoad, mapRef }) {
  function handleLoad(map) {
    if (mapRef) mapRef.current = map
    if (onMapLoad) onMapLoad(map)
  }

  return (
    <ErrorBoundary inline>
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      zoom={5}
      center={DEFAULT_CENTER}
      onLoad={handleLoad}
      options={MAP_OPTIONS}
    >
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,         // we draw our own numbered markers
            polylineOptions: { strokeColor: '#0d6efd', strokeWeight: 5 },
          }}
        />
      )}

      {stops.map((stop, i) =>
        stop.restaurant ? (
          <Marker
            key={stop.restaurant.place_id ?? i}
            position={{
              lat: stop.restaurant.geometry.location.lat(),
              lng: stop.restaurant.geometry.location.lng(),
            }}
            label={{
              text: String(i + 1),
              color: 'white',
              fontWeight: 'bold',
            }}
            title={stop.restaurant.name}
            onClick={() => onMarkerClick(stop.restaurant)}
          />
        ) : null,
      )}
    </GoogleMap>
    </ErrorBoundary>
  )
}
