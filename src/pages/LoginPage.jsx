import { useState, useEffect, useRef } from 'react'
import { Container, Card, Tab, Tabs, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, signup, currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [tab, setTab] = useState('login')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginError, setLoginError] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupError, setSignupError] = useState('')

  // Password fields use refs so the values never enter React state
  // and are invisible to the React DevTools component inspector.
  const loginPasswordRef = useRef(null)
  const signupPasswordRef = useRef(null)
  const signupConfirmRef = useRef(null)

  useEffect(() => {
    if (currentUser) navigate(from, { replace: true })
  }, [currentUser, from, navigate])

  function clearPasswords() {
    if (loginPasswordRef.current) loginPasswordRef.current.value = ''
    if (signupPasswordRef.current) signupPasswordRef.current.value = ''
    if (signupConfirmRef.current) signupConfirmRef.current.value = ''
  }

  function resetForms() {
    setLoginUsername('')
    setLoginError('')
    setSignupUsername('')
    setSignupError('')
    clearPasswords()
  }

  function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    try {
      login(loginUsername.trim(), loginPasswordRef.current.value)
    } catch (err) {
      setLoginError(err.message)
    } finally {
      clearPasswords()
    }
  }

  function handleSignup(e) {
    e.preventDefault()
    setSignupError('')
    const password = signupPasswordRef.current.value
    const confirm = signupConfirmRef.current.value
    if (password !== confirm) {
      setSignupError('Passwords do not match.')
      clearPasswords()
      return
    }
    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters.')
      clearPasswords()
      return
    }
    try {
      signup(signupUsername.trim(), password)
    } catch (err) {
      setSignupError(err.message)
    } finally {
      clearPasswords()
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-start py-5">
      <Card style={{ width: '100%', maxWidth: 440 }} className="shadow-sm">
        <Card.Header className="bg-dark text-white text-center py-3">
          <h4 className="mb-0 fw-bold">Welcome to RoadBites</h4>
        </Card.Header>
        <Card.Body className="p-4">
          <Tabs activeKey={tab} onSelect={k => { setTab(k); resetForms() }} className="mb-4">
            <Tab eventKey="login" title="Log In">
              {loginError && <Alert variant="danger" className="py-2">{loginError}</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your username"
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    ref={loginPasswordRef}
                    required
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button variant="primary" type="submit">Log In</Button>
                </div>
              </Form>
              <p className="text-center text-muted small mt-3 mb-0">
                No account?{' '}
                <Button variant="link" className="p-0 small" onClick={() => setTab('signup')}>
                  Sign up
                </Button>
              </p>
            </Tab>

            <Tab eventKey="signup" title="Sign Up">
              {signupError && <Alert variant="danger" className="py-2">{signupError}</Alert>}
              <Form onSubmit={handleSignup}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Choose a username"
                    value={signupUsername}
                    onChange={e => setSignupUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="At least 6 characters"
                    ref={signupPasswordRef}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Repeat password"
                    ref={signupConfirmRef}
                    required
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button variant="success" type="submit">Create Account</Button>
                </div>
              </Form>
              <p className="text-center text-muted small mt-3 mb-0">
                Already have an account?{' '}
                <Button variant="link" className="p-0 small" onClick={() => setTab('login')}>
                  Log in
                </Button>
              </p>
            </Tab>
          </Tabs>
        </Card.Body>
        <Card.Footer className="text-center bg-transparent">
          <Button variant="link" className="text-muted small" onClick={() => navigate(-1)}>
            Continue without an account
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  )
}
