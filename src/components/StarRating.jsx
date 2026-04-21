export default function StarRating({ rating, large = false }) {
  if (!rating) return <span className="text-muted small">No rating</span>
  const full = Math.round(rating)
  return (
    <span>
      <span className={`text-warning ${large ? 'fs-5' : ''}`}>
        {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      </span>
      <span className={`text-muted ms-1 ${large ? '' : 'small'}`}>{rating.toFixed(1)}</span>
    </span>
  )
}
