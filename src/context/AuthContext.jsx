import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem('roadbites-users') || '[]')
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem('roadbites-users', JSON.stringify(users))
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem('roadbites-session') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)
  const [currentUser, setCurrentUser] = useState(() => {
    const sessionId = loadSession()
    if (!sessionId) return null
    const all = loadUsers()
    return all.find(u => u.id === sessionId) || null
  })

  function signup(username, password) {
    const all = loadUsers()
    if (all.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('That username is already taken.')
    }
    const user = { id: String(Date.now()), username, password }
    const updated = [...all, user]
    saveUsers(updated)
    setUsers(updated)
    localStorage.setItem('roadbites-session', JSON.stringify(user.id))
    setCurrentUser(user)
  }

  function login(username, password) {
    const all = loadUsers()
    const user = all.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )
    if (!user) throw new Error('Incorrect username or password.')
    localStorage.setItem('roadbites-session', JSON.stringify(user.id))
    setCurrentUser(user)
  }

  function logout() {
    localStorage.removeItem('roadbites-session')
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
