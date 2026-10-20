# Supplements

A few sheets are published without values because the bank may not redistribute the
underlying data (Kodiak, Bloomberg): VI-15, VIII-18 and X-33 to X-36. The site shows the
bank's note for them instead of a chart.

If you have the values, put them here as `<figure id>.csv` (for example `X-33.csv`) and
rebuild. `build_data.py` puts them into the sheet's own layout, so titles, notes, units and
series names still come from the workbook.

Format: a header row, then one row per observation. First column a date (`YYYY-MM-DD`) or a
label, then one column per series in the workbook's order. Comma or semicolon separated;
with semicolons a decimal comma is accepted.

```
Dagsetning;Frakkland;Þýskaland;Bretland;Bandaríkin;Japan
2008-01-02;12,5;9,1;10,0;8,3;6,7
```

These values end up in `public/data`, which is published with the site. Check that the
licence allows that before committing them.
