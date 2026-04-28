export default function StarRating({ rating, large = false }) {
  if (!rating) return <span className="text-muted small">No rating</span>
  const full = Math.round(rating)
  return (
    <span role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span aria-hidden="true" className={`text-warning ${large ? 'fs-5' : ''}`}>
        {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      </span>
      <span className={`text-muted ms-1 ${large ? '' : 'small'}`} aria-hidden="true">
        {rating.toFixed(1)}
      </span>
    </span>
  )
}
