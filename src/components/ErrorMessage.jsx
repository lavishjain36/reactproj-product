// Shown when a request fails. Retry runs the same request again.
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="notice" role="alert">
      <p>{message}</p>
      {onRetry ? <button type="button" onClick={onRetry}>Retry</button> : null}
    </div>
  );
}
