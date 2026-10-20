import { Link, useLocation } from "react-router-dom";

export function LoginPrompt({ title, text }: { title: string; text: string }) {
  const location = useLocation();
  return (
    <div className="page page--narrow">
      <div className="empty-state empty-state--page">
        <h1 className="page-title">{title}</h1>
        <p className="muted">{text}</p>
        <Link className="btn btn--primary" to={`/login?next=${encodeURIComponent(location.pathname)}`}>
          Skrá inn
        </Link>
        <p className="small muted">Sýnidæmi: innskráning er hermd.</p>
      </div>
    </div>
  );
}
