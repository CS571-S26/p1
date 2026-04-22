import { Component } from 'react'
import { Container, Alert, Button } from 'react-bootstrap'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  reset() {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    const { fallback, inline } = this.props

    if (fallback) return fallback

    if (inline) {
      return (
        <Alert variant="danger" className="m-2">
          <strong>Something went wrong.</strong>{' '}
          <Button variant="link" className="p-0 align-baseline" onClick={() => this.reset()}>
            Try again
          </Button>
        </Alert>
      )
    }

    return (
      <Container className="py-5 text-center" style={{ maxWidth: 520 }}>
        <Alert variant="danger">
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p className="mb-3">{this.state.error.message || 'An unexpected error occurred.'}</p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="danger" onClick={() => this.reset()}>Try again</Button>
            <Button variant="outline-secondary" onClick={() => window.location.assign('/')}>
              Go home
            </Button>
          </div>
        </Alert>
      </Container>
    )
  }
}
