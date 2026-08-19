# GNDEC Timetable Source Inspection

## Source

The user supplied the public GNDEC timetable page at:

`https://appsc.gndec.ac.in/sites/default/files/2026-08/09_08_2026%20FINAL_FILE%20R4_subgroups_days_horizontal.html#table_73`

## Verified Structure

The document identifies **Guru Nanak Dev Engineering College Ludhiana** and groups the first-year chemistry timetable by group. Its table of contents contains an **ITB** group with individual timetable anchors for **ITB1** (`#table_73`), **ITB2** (`#table_74`), and additional `ITBM` subgroups. This means that the source presents the requested B1/B2 cohort as distinct table-level records rather than a single ITB table with an internal B1/B2 column.

## MVP Data Decision

The source page is sufficiently large that the rendered browser extraction did not expose the complete `ITB1` table body in this session. The app therefore ships with clearly labelled local sample sessions, designed with the same separate-group model, rather than claiming that complete live ITB timetable data was automatically extracted. The local parser contract will accept individual group keys (`ITB1`, `ITB2`) and retain raw source values for administrator review before any future production update.

## Safety and Traceability

No login, CAPTCHA, or restricted endpoint was accessed. The production import interface must present a preview and require administrator confirmation before a replacement timetable is published. It must not overwrite manually corrected classroom or subgroup assignments without confirmation.
