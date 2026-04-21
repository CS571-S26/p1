import { useState } from 'react'
import { Modal, Tab, Tabs, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ show, onHide }) {
  const { login, signup } = useAuth()
  const [tab, setTab] = useState('login')

  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [signupUsername, setSignupUsername] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [signupError, setSignupError] = useState('')

  function resetForms() {
    setLoginUsername(''); setLoginPassword(''); setLoginError('')
    setSignupUsername(''); setSignupPassword(''); setSignupConfirm(''); setSignupError('')
  }

  function handleHide() {
    resetForms()
    onHide()
  }

  function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    try {
      login(loginUsername.trim(), loginPassword)
      handleHide()
    } catch (err) {
      setLoginError(err.message)
    }
  }

  function handleSignup(e) {
    e.preventDefault()
    setSignupError('')
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.')
      return
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.')
      return
    }
    try {
      signup(signupUsername.trim(), signupPassword)
      handleHide()
    } catch (err) {
      setSignupError(err.message)
    }
  }

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Welcome to RoadBites</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={tab} onSelect={k => { setTab(k); resetForms() }} className="mb-3">
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
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
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
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Repeat password"
                  value={signupConfirm}
                  onChange={e => setSignupConfirm(e.target.value)}
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
      </Modal.Body>
    </Modal>
  )
}
