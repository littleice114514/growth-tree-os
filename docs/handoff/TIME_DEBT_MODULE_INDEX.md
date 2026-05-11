# Time Debt Module Index

## 1. Current Anchor

- Project: `growth-tree-os`
- Branch: `feature/mac-time-debt-plan-flow-overlap-ui`
- Module: Time Debt Calendar
- Device role: Mac UI / page experience / frontend interaction
- Last stable base commit before resize round: `a3192fe`
- Latest verified base before M13 seal: `8d941ce`
- Push status: this M13 seal round should be committed and pushed from the active Codex device after validation

## 2. Entry Points

- Time Debt page entry: `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- Calendar shell: `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- Day view: `app/renderer/src/features/time-debt/calendar/DayCalendarView.tsx`
- Week view: `app/renderer/src/features/time-debt/calendar/WeekCalendarView.tsx`
- Custom days view: `app/renderer/src/features/time-debt/calendar/CustomDaysCalendarView.tsx`
- Month view: `app/renderer/src/features/time-debt/calendar/MonthCalendarView.tsx`

## 3. Calendar Components

- Calendar grid: `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- Event block: `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- Detail panel: `app/renderer/src/features/time-debt/calendar/CalendarEventDetailPanel.tsx`
- View switcher: `app/renderer/src/features/time-debt/calendar/CalendarViewSwitcher.tsx`
- Time axis: `app/renderer/src/features/time-debt/calendar/CalendarTimeAxis.tsx`

## 4. Calendar Utilities

- Date range and day keys: `app/renderer/src/features/time-debt/calendar/calendarDateUtils.ts`
- Time positioning: `app/renderer/src/features/time-debt/calendar/calendarTimePositionUtils.ts`
- Overlap layout: `app/renderer/src/features/time-debt/calendar/calendarOverlapLayoutUtils.ts`
- Drag and resize preview: `app/renderer/src/features/time-debt/calendar/calendarDragPreviewUtils.ts`
- Daily segment splitting: `app/renderer/src/features/time-debt/calendar/calendarDailySegmentUtils.ts`
- Calendar types: `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`

## 5. State and Persistence

- Calendar block building: `buildCalendarBlocks` in `TimeDebtDashboard.tsx`
- Completed logs storage: `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- Planned tasks storage: `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- Active timer storage: `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- Active timer state: `runningTimer` in `TimeDebtDashboard.tsx`
- Historical task-name options: `buildTaskHistoryOptions` and `TaskNameCombobox` in `TimeDebtDashboard.tsx`
- Reminder linkage: `updateTimePlanReminderBySource` from `app/renderer/src/features/reminders/timePlanReminderStorage.ts`

## 6. Current Stable Abilities

- Calendar supports day / week / month / custom days views.
- Event click keeps the right detail panel open.
- Completed and planned blocks can be dragged to a new date/time.
- Active blocks can be selected but cannot be dragged.
- Current time line uses a Notion-style left label, 1px red line, and today-column dot.
- Overlapping same-day events are arranged into side-by-side columns.

## 7. Current Round Changes

- Event colors use readable Notion-style status colors.
- Completed, Planned, and Missed blocks expose top/bottom resize handles.
- Resize snaps to 15 minutes and enforces a 15-minute minimum duration.
- Active blocks do not show resize handles.
- Resize writes back to logs or planned tasks and updates linked reminders for planned tasks.
- 2026-04-30 sync closeout confirmed branch `feature/mac-time-debt-plan-flow-overlap-ui`, clean worktree, HEAD `e4ebcff`.
- 2026-04-30 sync closeout reran both TypeScript checks successfully.
- 2026-05-05 detail edit round: `CalendarEventDetailPanel.tsx` now edits Completed actual start/end and Planned/Missed planned start/end through the same `resizeCalendarBlock` persistence path.
- 2026-05-05 detail edit round: Active blocks stay read-only with the required warning, and resize previews are shown in the right detail panel while dragging a resize handle.
- 2026-05-05 smoke fix: `CalendarEventDetailPanel.tsx` syncs datetime-local draft on input/change, and `CalendarEventBlock.tsx` detects top/bottom edge hits in the parent mouse handler so resize does not lose to normal block dragging.
- Validation: both TypeScript checks passed; direct dev startup is blocked by Codex App Node versus Rollup native package signing, but Electron's bundled Node workaround successfully starts the app at `http://localhost:5173/`.
- 2026-05-07 P0 active timer fix: `finishTimer` now also completes legacy active plans that no longer have `runningTimer`, writes actual end/duration, archives reminders, and clears active timer localStorage.
- 2026-05-07 P0 calendar fix: `CalendarViewShell` splits Active and Completed cross-day blocks into daily segments before layout; cross-day segments are displayed read-only for drag/resize safety.
- 2026-05-07 P0 entry fix: Start Timer, Manual Log, and Plan modals use a searchable historical task Combobox derived from existing logs/plans.
- Validation: `pnpm typecheck` and `pnpm smoke` passed on 2026-05-07.
- 2026-05-07 short-task rule fix: real saved `durationMinutes` remains actual duration; calendar positioning uses `minVisualCalendarEventDurationMinutes = 15` only for visual height.
- 2026-05-07 short-task detail fix: saved short tasks show their real duration in detail, while resize/time-range editing still requires at least 15 minutes.
- Validation: `pnpm typecheck` and `pnpm smoke` passed after the short-task rule split.
- 2026-05-10 M13 stabilization acceptance: timer closeout paths, short-task actual duration versus visual height, day/week/month/custom switching, overlap readability, non-today record access, and cross-day segmentation were reviewed against current code paths.
- 2026-05-10 M13 minimal fix: cross-day daily segments now stay read-only in `CalendarEventDetailPanel.tsx`, so the detail panel no longer exposes a time-range editor that would pass a `::segment::` id into the persistence path.
- Validation: `pnpm typecheck`, `pnpm build`, and `pnpm smoke` passed on the M13 branch after the daily-segment detail fix.
- Remaining risk: real Electron click smoke should still be repeated on the receiving Mac after pull, especially for active timer start/finish and dense overlap click targets.
- 2026-05-10 calendar UI polish: `CalendarTimeAxis.tsx` hides the first visible axis label so the clipped top `12 AM` no longer appears, while later `12:30`, `1 AM`, and half-hour labels remain unchanged.
- 2026-05-10 calendar UI polish: `CalendarGrid.tsx` moves the empty-range message out of the time-grid overlay into a light hint under the sticky day header, using `当前范围暂无时间块` so it no longer blocks the calendar grid.
- 2026-05-10 timezone entry MVP: `CalendarViewShell.tsx` adds a toolbar timezone selector with system timezone, GMT+8, GMT-7 Los Angeles, GMT-4 New York, and GMT+1 London options.
- Timezone status: selector is UI-only state for this round; it changes the displayed button label only and does not recalculate logs, plans, timers, drag/resize math, reminders, storage, or historical time interpretation.
- Validation target for this UI polish round: run `pnpm typecheck`, `pnpm build`, optional `pnpm smoke`, and real Electron UI smoke for axis labels, empty state, timezone menu, view switching, and timer start/finish.
- 2026-05-11 M13 real Electron UI smoke: Time Debt page, calendar page, day/week/month switching, hidden top `12 AM`, header-level empty state, timezone menu open/select, timer start, timer finish, generated log display, log detail open, and timezone UI-only non-interference were verified in the real Electron window.
- 2026-05-11 M13 minimal fix: short visual calendar blocks no longer expose resize hit zones when the rendered block is too small, preventing a normal click from being treated as a resize and writing the 15-minute visual minimum back into the real log.
- 2026-05-11 short-task verification: a post-fix 2-minute timer log displayed as a minimum-height calendar block, opened in detail on click, and preserved real start/end plus `实际时长 2 分钟`; timezone selection to `GMT-7 Los Angeles` did not alter the record or detail values.
- Validation: `pnpm typecheck` and `pnpm smoke` passed before the UI smoke; after the short-block click fix, `pnpm typecheck` and `pnpm smoke` passed again.
- M13 seal judgment: Time Debt M13 is sealable after this commit/push. Timezone remains UI-only MVP by design; real timezone conversion should be a later data-layer design pass if needed.
- Next unique entry: after pulling this M13 seal commit, start either Wealth P1 or develop integration; do not continue Time Debt timezone conversion without a separate data-layer task card.

## 8. Backlog Only

- FUTURE | Property System: configurable fields across Time Debt, Wealth, and Growth Tree: text, number, percent, select, multi_select, status, datetime, checkbox, relation, rollup, formula.
- FUTURE | Time Debt Dashboard: charts for time structure, plan drift, debt trend, effective time, category share, and weekly/monthly heatmaps.

## 9. Next Token-Saving Rule

- Next round should first read only this file and `docs/handoff/MAC_NEXT_ACTION.md` if present.
- Then read at most 8 related code files.
- Do not read full dev logs unless the current bug cannot be located from this index.
- Next unique entry: choose Wealth P1 or develop integration after pulling the M13 seal commit; Time Debt M13 does not need another UI smoke pass unless the receiving device sees a regression.
