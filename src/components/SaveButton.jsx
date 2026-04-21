import { Button } from 'react-bootstrap'
import { useTrips } from '../context/TripContext'

export default function SaveButton({ restaurant, origin, destination, size = 'sm' }) {
  const { saveTrip, isRestaurantSaved } = useTrips()
  const saved = isRestaurantSaved(restaurant.place_id)

  function handleSave() {
    if (saved) return
    saveTrip({
      origin,
      destination,
      stops: [{
        name: restaurant.name,
        address: restaurant.vicinity,
        rating: restaurant.rating,
        placeId: restaurant.place_id,
      }],
    })
  }

  return (
    <Button
      size={size}
      variant={saved ? 'success' : 'outline-success'}
      onClick={handleSave}
      disabled={saved}
      title={saved ? 'Already saved' : 'Save this restaurant'}
    >
      {saved ? '★ Saved' : '☆ Save'}
    </Button>
  )
}
