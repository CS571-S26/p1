import { Button } from 'react-bootstrap'

export default function EmptyState({ icon = '🗺️', heading, message, actionLabel, onAction }) {
  return (
    <div className="text-center py-5 text-muted">
      <div style={{ fontSize: '3rem', lineHeight: 1 }} className="mb-3">{icon}</div>
      <h5 className="fw-semibold text-dark">{heading}</h5>
      {message && <p className="mb-3">{message}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
