# Study Rotation Scheduler
Run: open `index.html` in a browser (no server, no install; works offline). Tests: `node tests/engine.test.js`.

## Queue algorithm
- `nextCourseId` is a pointer into the circular course list. Drawing a course for a new session advances it (wraps after the ninth).
- Each study day has 2 slots. `reconcile(state, today)` fills them: sessions already completed today keep their slot; pending sessions (oldest first = carryovers) take the remaining slots; only if slots are still free are new sessions drawn from the pointer.
- Sessions are created once, so completing/undoing never moves the pointer: no duplicates, no accidental advancement. Study days are chosen in Settings (default: every day); rest days create nothing. Days the app was not opened create nothing; the last unfinished sessions simply carry to today.
- Reversing an old completion makes that session pending again. As the oldest pending session it takes priority in today's open slots; newer pending sessions are pushed forward. Other completed records are untouched.
- The 5-day preview (`plan`) is read-only: today's real slots, then queued overflow, then projected draws from the pointer assuming each day's sessions get done.

## Data model (localStorage key `rotation.state.v1`, schema 2; schema 1 backups auto-migrate)
`{schema, settings:{theme, studyDays:[0-6]}, courses:[{id,name,active}], cseq, nextCourseId, seq, lastDay, sessions:[{id, seq, courseId, courseName, origNo, origDate, curDate, status:'pending'|'done'|'void', doneAt, carried}]}`
Removed courses stay as `active:false` so queue position and history survive.

## Pages
Hash routes: `#/today`, `#/upcoming`, `#/history`, `#/settings` (Back button and refresh keep your place). Liquid-glass styling uses `backdrop-filter`; browsers without it show plain translucent panels.

## Android APK and desktop apps
Files are in `www/` (the app), `electron/` (desktop shell), `capacitor.config.json` (Android shell).
**Easiest (no installs):** push this folder to a new GitHub repo. Actions → "Build apps" builds the APK plus Windows (.exe), Linux (.AppImage) and macOS (.dmg) installers; download them from the run's Artifacts.
The APK is debug-signed: copy it to your phone and allow "install unknown apps".
**Local desktop:** `npm install`, then `npm run desktop` to run, `npm run dist` to build an installer for your current OS.
**Local Android:** install Android Studio + JDK 17, then `npm install`, `npx cap add android`, `npx cap sync android`, `npx cap open android`, and Build > Build APK.
