import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { RELEASE } from "../data/figures";
import { TopNav } from "./TopNav";

/**
 * Scrolls to top and moves focus to main content on route change. The chapter pages
 * (/section/…) scroll themselves, and moving between chapters keeps focus where it is.
 */
function RouteFocus() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const prev = useRef(pathname);
  useEffect(() => {
    const chapters = pathname.startsWith("/section/");
    const withinChapters = chapters && prev.current.startsWith("/section/");
    prev.current = pathname;
    if (!chapters) window.scrollTo({ top: 0 });
    if (first.current) {
      first.current = false;
      return;
    }
    if (!withinChapters) document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

export function AppShell() {
  return (
    <div id="app-shell">
      <a className="skip-link" href="#main" onClick={(e) => {
        e.preventDefault();
        document.getElementById("main")?.focus();
      }}>
        Fara beint í efni
      </a>
      <RouteFocus />
      <TopNav />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <img className="wordmark__img wordmark__img--sm" src={`${import.meta.env.BASE_URL}brand/hagvisar-wordmark.svg`} alt="Hagvísar" />
          <p>
            Tölur úr Hagvísum Seðlabanka Íslands, útgáfa {RELEASE.label}. Sýnidæmi að nýrri vefútgáfu; innskráning og áskriftir eru hermdar.
          </p>
          <Link to="/about">Um verkefnið</Link>
        </div>
      </footer>
    </div>
  );
}
