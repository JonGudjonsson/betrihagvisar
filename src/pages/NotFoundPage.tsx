import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="page page--narrow">
      <div className="empty-state empty-state--page">
        <p className="eyebrow">404</p>
        <h1 className="page-title">Síða fannst ekki</h1>
        <p className="muted">Myndin eða síðan sem þú leitar að er ekki til í þessu sýnidæmi.</p>
        <Link to="/" className="btn btn--primary">
          Fara á forsíðu
        </Link>
      </div>
    </div>
  );
}
