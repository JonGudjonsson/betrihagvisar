import { HashRouter, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./state/AppState";
import { AppShell } from "./components/AppShell";
import { OverviewPage } from "./pages/OverviewPage";
import { ChapterStreamPage } from "./pages/ChapterStreamPage";
import { SearchPage } from "./pages/SearchPage";
import { SpotlightPage } from "./pages/SpotlightPage";
import { SetsIndexPage } from "./pages/SetsIndexPage";
import { SetDetailPage } from "./pages/SetDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { UpdatesPage } from "./pages/UpdatesPage";
import { AboutPage } from "./pages/AboutPage";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * Hash routing keeps deep links working on GitHub Pages project sites
 * (https://<user>.github.io/betrihagvisar/#/figure/I-1) without a 404 fallback.
 */
export default function App() {
  return (
    <HashRouter>
      <AppStateProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="section/:chapterId" element={<ChapterStreamPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="figure/:figureId" element={<SpotlightPage />} />
            <Route path="sets" element={<SetsIndexPage />} />
            <Route path="sets/:setId" element={<SetDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="updates" element={<UpdatesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AppStateProvider>
    </HashRouter>
  );
}
