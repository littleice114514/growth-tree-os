# Time Debt Module Index

## 1. Current Anchor

- Project: `growth-tree-os`
- Branch: `feature/mac-time-debt-plan-flow-overlap-ui`
- Module: Time Debt Calendar
- Device role: Mac UI / page experience / frontend interaction
- Last stable base commit before resize round: `a3192fe`
- Latest local UI commit: `e4ebcff`
- Push status: pending; Mac currently lacks GitHub CLI and HTTPS push credentials are not configured

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
- Calendar types: `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`

## 5. State and Persistence

- Calendar block building: `buildCalendarBlocks` in `TimeDebtDashboard.tsx`
- Completed logs storage: `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- Planned tasks storage: `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- Active timer storage: `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- Active timer state: `runningTimer` in `TimeDebtDashboard.tsx`
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

## 8. Backlog Only

- FUTURE | Property System: configurable fields across Time Debt, Wealth, and Growth Tree: text, number, percent, select, multi_select, status, datetime, checkbox, relation, rollup, formula.
- FUTURE | Time Debt Dashboard: charts for time structure, plan drift, debt trend, effective time, category share, and weekly/monthly heatmaps.

## 9. Next Token-Saving Rule

- Next round should first read only this file and `docs/handoff/MAC_NEXT_ACTION.md`.
- Then read at most 8 related code files.
- Do not read full dev logs unless the current bug cannot be located from this index.
- Do not continue UI work until Mac pushes this branch and Win can pull it.
