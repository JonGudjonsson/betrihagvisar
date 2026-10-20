import { Link } from "react-router-dom";
import { FIGURES, RELEASE } from "../data/figures";

export function AboutPage() {
  return (
    <div className="page page--narrow prose">
      <p className="eyebrow">Um verkefnið</p>
      <h1 className="page-title">Hagvísar, lausir af síðunni</h1>
      <p className="lead">
        Þetta er sýnidæmi að nútímalegri vefútgáfu Hagvísa. Markmiðið er að fara úr illa útfærðri PowerBI lausn í vefviðmót sem heldur því sem virkaði í prentuðu útgáfunni, en auðgar hana um leið með betri notendaupplifun.
      </p>

      <div className="notice" role="note">
        <strong>Tölurnar eru úr Hagvísum Seðlabanka Íslands, útgáfu {RELEASE.label}.</strong> Þær eru sóttar úr Excel-skjölum bankans („Tölur í myndir“) og breytt í
        JSON. Innskráning og tölvupóstsáskriftir eru hins vegar hermdar: engin raunveruleg auðkenning fer fram og enginn tölvupóstur er sendur.
      </div>

      <h2>Hvað er hægt að prófa</h2>
      <ul>
        <li>
          <strong>Kaflar og myndir.</strong> {FIGURES.length} myndir í tíu köflum, hver með númeri, einingu, skýringum og heimildum.
        </li>
        <li>
          <strong>Síur og leit.</strong> Leitaðu eftir efni, kafla, tíðni, tegund myndar eða heimild án þess að fara af síðunni.
        </li>
        <li>
          <strong>Kastljós.</strong> Opnaðu mynd í fullri breidd, breyttu tímabili og tíðni, sæktu gögnin eða deildu tengli sem geymir stillingarnar.
        </li>
        <li>
          <strong>Raða myndum.</strong> Dragðu myndir til í sérstökum röðunarham, eða notaðu lyklaborð og valmynd.
        </li>
        <li>
          <strong>Mín söfn.</strong> <Link to="/login">Skráðu þig inn</Link> sem prófunarnotandi og settu saman eigin söfn mynda með áskrift að uppfærslum.
        </li>
      </ul>

      <h2>Tækni</h2>
      <p>
        Forritað í React, TypeScript og Vite með Claude Code. Myndir eru teiknaðar með Apache ECharts og röðun notar dnd-kit. Gögn koma úr Excel skjölum af síðu Seðlabankans, sem síðan eru færð á JSON form með Python scriptum. Vefurinn sækir gögn hverrar myndar í þessi skjöl þegar hún birtist (lazy loading). Söfn og stillingar eru vistuð í vafranum (localStorage).
      </p>
    </div>
  );
}
