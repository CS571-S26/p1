import { useState } from 'react'
import { Navbar, Nav, Container, Badge, Button, NavDropdown } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTrips } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function NavBar() {
  const { savedTrips } = useTrips()
  const { currentUser, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md" sticky="top">
        <Container>
          <Navbar.Brand as={NavLink} to="/" className="fw-bold fs-4">
            RoadBites
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto gap-1 align-items-md-center">
              <Nav.Link
                as={NavLink}
                to="/"
                end
                className={({ isActive }) => isActive ? 'active fw-semibold' : ''}
              >
                Home
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/saved"
                className={({ isActive }) => isActive ? 'active fw-semibold' : ''}
              >
                My Trips
                {savedTrips.length > 0 && (
                  <Badge bg="warning" text="dark" className="ms-1">
                    {savedTrips.length}
                  </Badge>
                )}
              </Nav.Link>

              {currentUser ? (
                <NavDropdown
                  title={<span className="text-white">{currentUser.username}</span>}
                  id="user-dropdown"
                  align="end"
                  menuVariant="dark"
                >
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>Log Out</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Button
                  variant="outline-light"
                  size="sm"
                  className="ms-2"
                  onClick={() => setShowAuth(true)}
                >
                  Log In / Sign Up
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <AuthModal show={showAuth} onHide={() => setShowAuth(false)} />
    </>
  )
}
