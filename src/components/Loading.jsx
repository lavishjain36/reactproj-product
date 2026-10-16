// Shown while a request is in progress.
export default function Loading({ label = 'Loading…' }) {
  return <p className="status" role="status">{label}</p>;
}
