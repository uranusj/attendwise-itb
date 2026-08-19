# Verified Data and Administrator Workflow

## Student Data Rules

The student app displays the public GNDEC ITB1/ITB2 timetable as the initial **published timetable**, effective from 10 August 2026. Every attendance record starts as **NOT_MARKED**; counts, percentages, and lecture recommendations remain unavailable until the student records real outcomes. The app must never replace unknown history with invented present or absent values.

## Local Publishing Model

The Android MVP maintains two timetable copies on the device. Students view only the published copy. The administrator screen maintains a working draft. Editing a class affects the draft only; an explicit **Publish to student timetable** action copies the draft to the published timetable, adds a local publication timestamp, and reschedules reminders. This prevents partial edits from immediately appearing in the student timetable.

## WhatsApp File Review

An administrator can select a PDF, image, HTML, or document saved from WhatsApp. The selected filename and file type are recorded as an import item marked **Review required**. The app does not claim automatic OCR or extraction. The administrator uses the editable draft rows to apply the verified classes, then publishes.

## Scope Boundary

This is a device-local administrator workspace, appropriate for testing and a single delegated timetable editor. Publishing changes to all students’ independently installed apps requires a shared authenticated backend and an approved administrator identity; that production synchronization is not enabled in the current MVP.
