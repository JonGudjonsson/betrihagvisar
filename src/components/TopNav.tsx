import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useBrowse } from "../state/AppState";
import { EMPTY_FILTERS } from "../lib/filters";
import { Menu } from "./Menu";
import { IconClose, IconMenu, IconSearch } from "./Icons";

const NAV = [
  { to: "/", label: "Yfirlit", end: true },
  { to: "/section/I", label: "Flokkar", match: ["/section", "/search", "/figure"] },
  { to: "/sets", label: "Mín söfn" },
  { to: "/updates", label: "Uppfærslur" },
  { to: "/about", label: "Um" },
];

function SearchBox({ id, onDone }: { id: string; onDone?: () => void }) {
  const { filters, setFilters } = useBrowse();
  const navigate = useNavigate();
  const [q, setQ] = useState(filters.query);
  useEffect(() => setQ(filters.query), [filters.query]);
  return (
    <form
      role="search"
      className="topnav__search"
      onSubmit={(e) => {
        e.preventDefault();
        setFilters({ ...EMPTY_FILTERS, query: q.trim() });
        navigate("/search");
        onDone?.();
      }}
    >
      <IconSearch className="topnav__search-icon" size={16} />
      <label htmlFor={id} className="sr-only">
        Leita að myndum
      </label>
      <input id={id} className="input input--nav" type="search" placeholder="Leita að myndum…" value={q} onChange={(e) => setQ(e.target.value)} />
    </form>
  );
}

function UserArea() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) {
    return (
      <Link className="btn btn--secondary btn--sm topnav__login" to={`/login?next=${encodeURIComponent(location.pathname)}`}>
        Skrá inn
      </Link>
    );
  }
  return (
    <Menu
      label={`Notandi: ${user.name}`}
      triggerClassName="avatar"
      trigger={<span aria-hidden="true">{user.initials}</span>}
      header={
        <>
          <strong>{user.name}</strong>
          <span className="muted small">Sýnidæmi · {user.maskedId}</span>
        </>
      }
      items={[
        { label: "Mín söfn", onSelect: () => navigate("/sets") },
        { label: "Uppfærslur", onSelect: () => navigate("/updates") },
        {
          label: "Skrá út",
          separatorBefore: true,
          onSelect: async () => {
            await logout();
            navigate("/");
          },
        },
      ]}
    />
  );
}

export function TopNav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const isActive = (item: (typeof NAV)[number]) =>
    item.match ? item.match.some((m) => location.pathname.startsWith(m)) : item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <header className="topnav">
      <div className="topnav__inner">
        <Link to="/" className="wordmark" aria-label="Hagvísar, forsíða">
          <img className="wordmark__img" src={`${import.meta.env.BASE_URL}brand/hagvisar-wordmark.svg`} alt="" />
        </Link>
        <nav className="topnav__nav" aria-label="Aðalvalmynd">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={() => `topnav__link${isActive(item) ? " is-active" : ""}`} aria-current={isActive(item) ? "page" : undefined}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="topnav__right">
          <div className="topnav__search-wrap">
            <SearchBox id="nav-search" />
          </div>
          <UserArea />
          <button
            type="button"
            className="icon-btn topnav__burger"
            aria-label={mobileOpen ? "Loka valmynd" : "Opna valmynd"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div id="mobile-nav" className="mobile-nav">
          <SearchBox id="mobile-search" onDone={() => setMobileOpen(false)} />
          <nav aria-label="Aðalvalmynd (farsími)">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={() => `mobile-nav__link${isActive(item) ? " is-active" : ""}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
