import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const TripContext = createContext(null)

function loadTrips(userId) {
  if (!userId) return []
  try {
    return JSON.parse(localStorage.getItem(`roadbites-trips-${userId}`) || '[]')
  } catch {
    return []
  }
}

export function TripProvider({ children }) {
  const { currentUser } = useAuth()
  const userId = currentUser?.id ?? null

  const [savedTrips, setSavedTrips] = useState(() => loadTrips(userId))

  // Reload from localStorage when user logs in/out
  useEffect(() => {
    setSavedTrips(loadTrips(userId))
  }, [userId])

  // Only persist to localStorage for logged-in users
  useEffect(() => {
    if (!userId) return
    localStorage.setItem(`roadbites-trips-${userId}`, JSON.stringify(savedTrips))
  }, [savedTrips, userId])

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
