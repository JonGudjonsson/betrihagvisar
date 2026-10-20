import type { Chapter } from "../types";

export const CHAPTERS: Chapter[] = [
  {
    id: "I",
    number: 1,
    title: "Verðlagsþróun og verðbólguvæntingar",
    shortTitle: "Verðlag og verðbólga",
    description: "Þróun vísitölu neysluverðs, undirliða hennar og væntinga heimila, fyrirtækja og markaðsaðila um verðbólgu.",
  },
  {
    id: "II",
    number: 2,
    title: "Framleiðsla og eftirspurn",
    shortTitle: "Framleiðsla og eftirspurn",
    description: "Hagvöxtur, framlag einstakra liða til vaxtar og vísbendingar um þróun innlendrar eftirspurnar.",
  },
  {
    id: "III",
    number: 3,
    title: "Utanríkisviðskipti og ytri skilyrði",
    shortTitle: "Utanríkisviðskipti",
    description: "Viðskiptajöfnuður, ferðaþjónusta, verð helstu útflutningsafurða og erlend staða þjóðarbúsins.",
  },
  {
    id: "IV",
    number: 4,
    title: "Vinnumarkaður og tekjur",
    shortTitle: "Vinnumarkaður",
    description: "Atvinnuleysi, starfandi fólk, launaþróun og kaupmáttur.",
  },
  {
    id: "V",
    number: 5,
    title: "Opinber fjármál",
    shortTitle: "Opinber fjármál",
    description: "Afkoma og skuldir hins opinbera, tekjur og gjöld ríkissjóðs.",
  },
  {
    id: "VI",
    number: 6,
    title: "Eignamarkaðir",
    shortTitle: "Eignamarkaðir",
    description: "Íbúða- og atvinnuhúsnæðisverð, umsvif á fasteignamarkaði og hlutabréfaverð.",
  },
  {
    id: "VII",
    number: 7,
    title: "Heimili og fyrirtæki",
    shortTitle: "Heimili og fyrirtæki",
    description: "Skuldastaða heimila og fyrirtækja, samsetning íbúðalána og gjaldþrot.",
  },
  {
    id: "VIII",
    number: 8,
    title: "Fjármálamarkaðir",
    shortTitle: "Fjármálamarkaðir",
    description: "Vextir Seðlabankans, gengi krónunnar, ávöxtunarkrafa ríkisbréfa, peningamagn og útlán.",
  },
  {
    id: "IX",
    number: 9,
    title: "Fjármálakerfið",
    shortTitle: "Fjármálakerfið",
    description: "Eiginfjár- og lausafjárstaða kerfislega mikilvægra banka og gæði útlána.",
  },
  {
    id: "X",
    number: 10,
    title: "Alþjóðleg efnahagsmál og erlendur samanburður",
    shortTitle: "Alþjóðlegur samanburður",
    description: "Hagvöxtur, verðbólga, vextir og opinberar skuldir í helstu viðskiptalöndum og samanburður við Ísland.",
  },
];

export const CHAPTER_BY_ID: Record<string, Chapter> = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));

export function getChapter(id: string | undefined): Chapter | undefined {
  return id ? CHAPTER_BY_ID[id] : undefined;
}
