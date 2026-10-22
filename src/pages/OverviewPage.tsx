import { Link } from "react-router-dom";
import { CHAPTERS } from "../data/chapters";
import { FIGURES, RELEASE, figuresInChapter } from "../data/figures";
import { pluralFigures } from "../lib/format";

const BRAND = `${import.meta.env.BASE_URL}brand/`;

/** Front page, after sedlabanki.is/hagvisar: wordmark, chapter list and the landvættir. */
export function OverviewPage() {
  return (
    <div className="page page--overview hv-home">
      <div className="hv-home__grid">
        <section className="hv-home__main" aria-labelledby="hv-home-title">
          <h1 id="hv-home-title" className="hv-home__title">
            <img src={`${BRAND}hagvisar-wordmark.svg`} alt="Hagvísar" width={409} height={71} />
          </h1>

          <ol className="hv-home__chapters" aria-label="Kaflar">
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <span className="hv-home__num">{c.id}</span>{" "}
                <Link to={`/section/${c.id}`}>{c.title}</Link>
                <span className="hv-home__count">{pluralFigures(figuresInChapter(c.id).length)}</span>
              </li>
            ))}
          </ol>

          <aside className="hv-home__disclaimer" role="note" aria-label="Mikilvægur fyrirvari">
            <p className="hv-home__disclaimer-title">Þetta er ekki opinber vefsíða Seðlabanka Íslands.</p>
            <p>
              Þetta er sjálfstætt verkefni og hvorki á vegum Seðlabankans né tengt honum. Vörumerki, merki og gögn eru eign viðkomandi rétthafa, þar á meðal Seðlabanka Íslands.
            </p>
          </aside>

          <div className="hv-home__text">
            <p>
              Gagnvirkir Hagvísar sýna helstu hagtölur Íslands í tíu köflum.
              {" "}Hugmyndin með verkefninu er aðallega að sýna hvernig mætti útfæra Gagnvirka Hagvísa á betri máta.
            </p>
            <p className="hv-home__meta">
              Tölur úr útgáfu {RELEASE.label} · {pluralFigures(FIGURES.length)} · <Link to="/search">Leita í öllum myndum</Link>
            </p>
          </div>
        </section>

        <img className="hv-home__art" src={`${BRAND}landvaettir.svg`} alt="" aria-hidden="true" width={720} height={723} />
      </div>
    </div>
  );
}
