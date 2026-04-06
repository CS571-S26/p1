import { Container, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import SearchForm from '../components/SearchForm'

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Smart Route Planning',
    desc: 'We calculate your driving route and evenly space restaurant stops along the way.',
  },
  {
    icon: '⭐',
    title: 'Top-Rated Picks',
    desc: 'At each stop we surface the highest-rated restaurant within your chosen radius.',
  },
  {
    icon: '🔍',
    title: 'Powerful Filters',
    desc: 'Filter by cuisine, price range, or only show places that are open right now.',
  },
  {
    icon: '💾',
    title: 'Save Your Trips',
    desc: 'Bookmark any trip or individual restaurant to revisit later.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  function handleSearch(params) {
    navigate('/results', { state: { searchParams: params } })
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)' }} className="text-white py-5">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col md={8}>
              <h1 className="display-4 fw-bold mb-3">Road Trip Restaurant Finder</h1>
              <p className="lead text-white-50">
                Enter your route and we'll find the best restaurants at every stop along the way —
                no more mid-trip browser searches.
              </p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={10} lg={9}>
              <div className="card shadow-lg p-4">
                <SearchForm onSearch={handleSearch} />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Feature highlights */}
      <Container className="py-5">
        <h2 className="text-center fw-bold mb-4">How It Works</h2>
        <Row className="g-4 justify-content-center">
          {FEATURES.map(f => (
            <Col key={f.title} sm={6} lg={3}>
              <div className="text-center p-3 h-100">
                <div className="fs-1 mb-2">{f.icon}</div>
                <h5 className="fw-semibold">{f.title}</h5>
                <p className="text-muted small">{f.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  )
}
