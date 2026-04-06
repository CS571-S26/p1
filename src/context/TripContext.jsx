import { createContext, useContext, useState, useEffect } from 'react'

const TripContext = createContext(null)

export function TripProvider({ children }) {
  const [savedTrips, setSavedTrips] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('roadbites-trips') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('roadbites-trips', JSON.stringify(savedTrips))
  }, [savedTrips])

  function saveTrip(trip) {
    setSavedTrips(prev => [
      { ...trip, id: Date.now(), savedAt: new Date().toISOString() },
      ...prev,
    ])
  }

  function removeTrip(id) {
    setSavedTrips(prev => prev.filter(t => t.id !== id))
  }

  return (
    <TripContext.Provider value={{ savedTrips, saveTrip, removeTrip }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrips() {
  return useContext(TripContext)
}
