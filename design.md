# AttendWise ITB — Mobile Interface Design

## Product Intent

AttendWise ITB is a portrait-first Android experience for Guru Nanak Dev Engineering College students in the ITB section. The MVP is focused on one-handed, fast daily decisions: identifying the next relevant lecture, recording attendance in one tap, and understanding whether a lecture may be safely missed while maintaining the 75% requirement.

The initial release uses clearly labelled local sample data for the student experience. The timetable parser, import preview, and data model are intentionally separated from attendance calculations so a verified administrator import or future authorised GNDEC data integration can replace the sample source without changing student-facing logic.

## Screen List

| Screen | Primary content and functionality |
| --- | --- |
| Welcome and section setup | A short introduction, fixed GNDEC section selection of **ITB**, and prominent B1/B2 subsection choices. The chosen subsection filters all student lecture occurrences. |
| Home dashboard | Overall attendance, safety status, next lecture, today’s filtered schedule, and one attention-required subject. Each scheduled class gives direct Present and Absent controls. |
| Timetable | A day selector and B1/B2-aware lecture list. Common ITB lectures and subsection-only lectures have distinct labels and colours. |
| Attendance | Subject-by-subject present, absent, total, percentage, target status, and mathematically calculated “can miss” or “must attend” guidance. |
| Calendar | Lecture occurrences grouped by date, with an attendance status that can be set individually without changing the timetable pattern. |
| Settings | Current section/subsection, reminder lead time, timetable source status, refresh/import entry point, and an option to restart setup. |
| Timetable import preview | An administrator-oriented local preview surface that documents source URL handling and provides a safe path to review an imported timetable before it replaces current data. |

## Key User Flows

| Flow | Steps |
| --- | --- |
| First use | Open app → read overview → select ITB → select B1 or B2 → enter dashboard with filtered schedule. |
| Mark attendance | Home or Calendar → tap Present or Absent on a lecture occurrence → app persists the status locally → dashboard and subject calculation refresh. |
| Decide whether to attend | Home next-lecture card or Attendance subject card → view exact projected percentage after attending or missing → receive a computed recommendation. |
| Review timetable | Timetable tab → choose weekday → see common ITB and selected-subsection sessions only → open schedule details. |
| Adjust reminder timing | Settings → select 5, 10, 15, or 30 minutes → permit notifications on device if requested → apply the selected lead time to future scheduled reminders. |
| Update subgroup | Settings → change B1/B2 → confirm → attendance remains associated with existing historical occurrences while future schedule display uses the updated filtering rule. |

## Layout and Interaction Design

All primary actions are placed in the lower half of the screen where practical. The dashboard uses a vertical hierarchy: greeting and cohort first, overall attendance second, then the next lecture and today’s activities. Status information uses text and colour together, so it remains understandable without relying on colour perception. The bottom navigation has four concise destinations: Home, Timetable, Attendance, and Settings.

Lecture cards contain time, subject, room, and an explicit **Common ITB**, **B1**, or **B2** chip. Present and Absent are separated, large touch targets with confirmation feedback. The attendance screen surfaces formula-driven outcomes rather than a generic progress bar: a student sees the attendance percentage, the 75% target, the number of lectures they can miss, or the exact consecutive lectures required to recover.

## Color Choices

| Role | Colour | Purpose |
| --- | --- | --- |
| Primary indigo | `#2446A8` | GNDEC-oriented academic identity; primary actions and selected navigation. |
| Deep ink | `#10213F` | Headers and high-contrast primary text. |
| Canvas | `#F7F8FC` | Calm screen background that preserves card contrast. |
| Common ITB teal | `#087E8B` | Shared ITB lecture marker. |
| B1 violet | `#6D49C8` | B1-only lecture marker. |
| B2 amber | `#C77700` | B2-only lecture marker. |
| Safe green | `#1B8A5A` | Above-target attendance / safe-to-miss state. |
| Risk orange | `#B86500` | Warning or attendance-at-risk state. |
| Must-attend red | `#B33645` | Under-target / must-attend state. |

## Core Data Vocabulary

The app represents an individual scheduled session as a **LectureOccurrence**. It references a reusable **Subject** and captures date/day, start and end times, room, teacher, ITB scope, B1/B2/COMMON subgroup assignment, and a per-user attendance status. The visibility rule is deterministic: a selected B1 student sees COMMON and B1 occurrences; a B2 student sees COMMON and B2 occurrences. Attendance summaries count only lecture occurrences visible to that student and marked Present or Absent, never the other subgroup’s sessions.

For a subject with `present` sessions and `total` marked sessions, the displayed percentage is `(present ÷ total) × 100`. A missed upcoming lecture is safe only when `present ÷ (total + 1) ≥ 0.75`. If currently below 75%, the minimum recovery count is the smallest non-negative integer `n` such that `(present + n) ÷ (total + n) ≥ 0.75`.

## MVP Boundaries

The MVP will support **local student setup, B1/B2 filtering, clearly labelled sample timetable data, manual attendance, individual calendar changes, configurable on-device reminders, and 75% calculations**. The provided public GNDEC source will be inspected and its ITB table used only when reliable extraction is possible. The app will not falsely claim a live GNDEC API, server-side Firebase account, cloud reminder delivery, OCR extraction, or automatic timetable synchronization until those services are configured and verified.

