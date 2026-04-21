import { Navbar, Nav, Container, Badge } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTrips } from '../context/TripContext'

export default function NavBar() {
  const { savedTrips } = useTrips()

  return (
    <Navbar bg="dark" variant="dark" expand="md" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="fw-bold fs-4">
          RoadBites
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto gap-1">
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
