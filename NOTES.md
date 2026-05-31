# RiseRank Mobile App — Developer Notes

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| JDK | 17 | `brew install openjdk@17` |
| Android Studio | Latest | https://developer.android.com/studio |
| React Native CLI | Latest | `npm install -g react-native-cli` |

Android Studio setup:
1. Install **Android SDK 34** (API level 34) via SDK Manager
2. Install **Android Emulator** and create a device (Pixel 6, API 34)
3. Set environment variables in `~/.zshrc` or `~/.bashrc`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

---

## Setup

```bash
cd riserank-app
npm install

# Link native dependencies (React Native auto-linking handles most)
cd android && ./gradlew clean && cd ..
```

---

## Running on Android

```bash
# Start Metro bundler
npm start

# In a second terminal, build and run on emulator/device
npm run android
```

If Metro starts but the app fails to build, try:
```bash
npm run start:clean   # clears Metro cache
```

---

## Environment Config

The API base URL lives in `src/utils/constants.ts`:

```ts
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5001/api/v1'   // Android emulator → localhost:5001
  : 'https://api.riserank.in/api/v1'; // Production
```

`10.0.2.2` is the Android emulator's alias for your host machine's `localhost`.
For a physical device on the same Wi-Fi: replace with your machine's local IP, e.g. `http://192.168.1.x:5001/api/v1`.

---

## Google Sign-In Setup

Google OAuth is fully implemented (backend + app). You need two credentials from Google Cloud Console.

### Step 1 — Google Cloud Console
1. Go to https://console.cloud.google.com → APIs & Services → Credentials
2. Create an **OAuth 2.0 Web application** client → copy the **Client ID**
3. Create an **OAuth 2.0 Android** client:
   - Package name: `com.riserank.app`
   - SHA-1: run `cd android && ./gradlew signingReport` to get your debug SHA-1

### Step 2 — Backend
Add to `riserank-backend/.env`:
```
GOOGLE_CLIENT_ID=<your Web Client ID>
```

### Step 3 — App
In `App.tsx`, replace `YOUR_WEB_CLIENT_ID_HERE` with your **Web Client ID**:
```ts
configureGoogleSignIn('YOUR_WEB_CLIENT_ID_HERE');
```
Or use `react-native-config`: set `GOOGLE_WEB_CLIENT_ID=...` in `.env` and read via `Config.GOOGLE_WEB_CLIENT_ID`.

### Flow
- App calls `signInWithGoogle()` (SDK) → gets `idToken`
- App sends `POST /api/v1/auth/google { idToken }` to backend
- Backend verifies token with Google, finds or creates user, returns JWT
- Existing email/password accounts are automatically linked on first Google login
- Google users skip email OTP verification (Google already verified the email)

---

## Firebase Setup (FCM Push Notifications)

1. Create a Firebase project at https://console.firebase.google.com
2. Add an Android app with package name `com.riserank.app`
3. Download `google-services.json` → place at `android/app/google-services.json`
4. The app uses `@react-native-firebase/messaging` (already in dependencies)

If you skip Firebase setup, the app still works — `notification.service.ts` catches import errors and degrades gracefully.

> **Note:** `google-services.json` is in `.gitignore`. For CI/CD, store it as a base64-encoded GitHub secret `GOOGLE_SERVICES_JSON_BASE64`.

---

## NativeWind (Tailwind CSS for React Native)

- Config: `tailwind.config.js` (colors, spacing, border radius)
- CSS entry: `global.css` (imported in `index.js`)
- Metro processes it via `withNativeWind()` in `metro.config.js`
- TypeScript types: `global.d.ts` re-exports NativeWind's type declarations
- **Dark mode**: `darkMode: 'class'` in tailwind.config.js — root View gets `className="dark"` when `isDark` is true (via `useDarkMode` hook)

**Gotcha:** `className` props only work on React Native core components (`View`, `Text`, `TouchableOpacity`, etc.), not on third-party components. Wrap them in a `View` if needed.

---

## Deep Linking

Registered URL schemes:
- `riserank://` — custom scheme
- `https://riserank.in` — universal links

Config: `src/navigation/linking.ts`
Android manifest: intent-filters already added in `android/app/src/main/AndroidManifest.xml`

Test from adb:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "riserank://quiz/abc123" com.riserank.app
```

---

## Sentry Crash Reporting

The app uses `src/services/crashReporter.ts` which lazily loads `@sentry/react-native`.
It degrades gracefully when the package isn't installed or the DSN is not set.

### Setup
1. Install the package (already in package.json):
   ```bash
   npm install
   cd android && ./gradlew clean && cd ..
   ```
2. Run the Sentry wizard (adds native Gradle config automatically):
   ```bash
   npx @sentry/wizard -i reactNative
   ```
3. Expose your DSN to the Metro bundler by adding to `babel.config.js`:
   ```js
   plugins: [
     ['transform-inline-environment-variables', { include: ['SENTRY_DSN'] }],
   ]
   ```
   Then set `SENTRY_DSN=https://xxx@sentry.io/yyy` in your CI environment or `.env`.

Sentry is **disabled in `__DEV__` mode** so local development is never polluted.
Errors are sent to Sentry via `ErrorBoundary.onError` and user identity is tagged
on login/register/hydrate and cleared on logout.

---

## Signing a Release APK

1. Generate a keystore (one-time):
   ```bash
   keytool -genkey -v -keystore riserank.keystore -alias riserank -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Place it at `android/app/riserank.keystore` (gitignored)
3. Create `android/local.properties` (gitignored):
   ```properties
   KEYSTORE_FILE=riserank.keystore
   KEYSTORE_PASSWORD=<your-password>
   KEY_ALIAS=riserank
   KEY_PASSWORD=<your-password>
   ```
4. Build:
   ```bash
   cd android && ./gradlew assembleRelease
   ```
   Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/mobile-ci.yml`

| Trigger | Job |
|---------|-----|
| Push to `main`/`develop`, PR | TypeScript type-check |
| Push to `main`/`develop` | Build debug APK, upload as artifact |
| Tag `v*.*.*` (e.g. `v1.0.0`) | Build signed release APK + create GitHub Release |

Required GitHub Secrets:
- `KEYSTORE_BASE64` — base64-encoded keystore file
- `KEYSTORE_PASSWORD` — keystore password
- `KEY_ALIAS` — key alias (riserank)
- `KEY_PASSWORD` — key password
- `GOOGLE_SERVICES_JSON_BASE64` — base64-encoded google-services.json

---

## App Version Gate

The app calls `GET /api/v1/app/config` on launch. Backend returns:

```json
{ "data": { "minimumVersion": "1.0.0", "latestVersion": "1.0.0", "maintenanceMode": false } }
```

Set these environment variables on the backend server:

| Variable | Purpose |
|----------|---------|
| `MINIMUM_APP_VERSION` | Minimum version still supported — below this shows a non-dismissable update dialog |
| `LATEST_APP_VERSION` | Latest released version — below this shows a dismissable update nudge |
| `MAINTENANCE_MODE` | `"true"` to show a maintenance screen (blocks all usage) |

`APP_VERSION` in `src/utils/constants.ts` must match the version in `android/app/build.gradle`. Bump both on every release.

---

## Known Gotchas

### Reanimated plugin order
`react-native-reanimated/plugin` must be the **last** Babel plugin in `babel.config.js`. It's already set up correctly — don't reorder.

### NativeWind v4 + Metro
If you see "cannot find module 'nativewind/metro'" after install, run:
```bash
npm run start:clean
```

### @react-native-firebase/messaging
Requires `google-services.json`. Without it the Gradle build will fail. Either add the file or comment out the Firebase dependency in `package.json` for a no-FCM build.

### react-native-image-picker permissions
Already added to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
<uses-permission android:name="android.permission.CAMERA"/>
```

### @react-native-community/netinfo
No extra native setup required on Android (auto-linked). Adds `ACCESS_NETWORK_STATE` permission automatically.

### Onboarding shown only on first launch
`SplashScreen` checks `ONBOARDING_DONE` in AsyncStorage. To reset during development, clear app data:
Android Settings → Apps → RiseRank → Clear Data.

---

## Project Structure

```
src/
├── api/           Axios client + service modules (auth, quiz, user, currentAffairs, report)
├── components/    Button, Input, OTPInput, Cards, QuizStatsCard, CategoryFilterBar,
│                  ErrorBoundary, QuestionCard, ReportQuestionModal, LoadingSpinner, etc.
├── hooks/         useAuth, useLanguage, usePagination, useApiError, useFCM,
│                  useNetworkStatus, useDarkMode
├── navigation/    RootNavigator → AuthNavigator / AppNavigator (bottom tabs + nested stacks)
│                  linking.ts — deep link config (riserank:// + https://riserank.in)
├── screens/       auth/, home/, quiz/, currentAffairs/, leaderboard/, profile/
├── services/      notification.service (FCM + local history), upload.service (S3 avatar)
├── store/         Zustand: authStore, appStore (language + theme), quizStore
├── types/         api.types.ts, navigation.types.ts
└── utils/         constants, storage, format, validators
```

---

## Features Implemented

| Feature | Status |
|---------|--------|
| Auth (register/login/OTP/forgot password) | ✅ |
| JWT refresh with single-flight queue | ✅ |
| Daily quiz CTA on Home — deep-links directly to QuizDetail | ✅ |
| Stats summary banner on Home (streak / quizzes / accuracy) | ✅ |
| Time-aware greeting on Home (morning / afternoon / evening) | ✅ |
| Unread notification badge on bell icon (clears on open) | ✅ |
| Quiz list with category filter chips + text search (debounced) | ✅ |
| Category pre-select from Search screen chips | ✅ |
| MCQ quiz attempt with countdown timer | ✅ |
| Timer pauses when app is backgrounded (AppState) | ✅ |
| Stale-closure fix — submitRef keeps doSubmit current inside intervals | ✅ |
| Animated slide transitions between questions (next/prev/dot navigator) | ✅ |
| Offline quiz cache — AsyncStorage write-through, stale fallback, cached banner | ✅ |
| Sentry crash reporting — lazy init, ErrorBoundary.onError, user identity tagging | ✅ |
| Axios exponential-backoff retry (network errors only, max 3×, 504 gateways) | ✅ |
| Offline warning banner + disabled Submit in QuizAttemptScreen when disconnected | ✅ |
| React.memo on all FlatList cards (QuizCard, CurrentAffairCard, LeaderboardItem, QuizHistoryCard) | ✅ |
| "Rate us on Play Store" prompt after 5th quiz (snooze / never support) | ✅ |
| App version check on launch — force-update, soft-update, maintenance mode | ✅ |
| Streak milestone celebration modal (7/30/100 days) — animated particles + share | ✅ |
| Haptic feedback on answer selection + submit | ✅ |
| Bookmark questions during attempt (optimistic toggle, synced to backend) | ✅ |
| Quiz results with share sheet (native Share API) | ✅ |
| Quiz review — all questions, colour-coded answers + explanations | ✅ |
| Quiz history tap → opens review for that attempt | ✅ |
| QuizDetailScreen — category badge, error+retry state | ✅ |
| Current affairs list + search + topic tag filter | ✅ |
| Current affairs detail (bilingual) + share button | ✅ |
| Error + retry state on all list screens and detail screens | ✅ |
| FlatList perf opts — maxToRenderPerBatch, windowSize, removeClippedSubviews | ✅ |
| Leaderboard (daily/weekly/all-time) — stale data cleared on tab switch | ✅ |
| Global search (quizzes + articles, debounced, parallel fetch) | ✅ |
| Profile + stats + accuracy progress bar | ✅ |
| Edit profile + avatar upload (S3) | ✅ |
| Change password (forces re-login) | ✅ |
| Bookmarks (paginated, optimistic inline remove, pull-to-refresh) | ✅ |
| Quiz history (paginated, pull-to-refresh) | ✅ |
| Report question (5 reasons + note field) | ✅ |
| FCM push notifications + local history screen | ✅ |
| FCM token deregistered from backend on logout | ✅ |
| FCM background/killed notification tap → navigate to quiz/article/leaderboard | ✅ |
| 🔔 Bell icon on Home → Notification history | ✅ |
| Onboarding carousel (first launch only) | ✅ |
| Animated splash screen (spring + progress bar) | ✅ |
| Deep linking — all screens including QuizReview, Search, Notifications | ✅ |
| Dark mode (Light / Dark / System) | ✅ |
| Bilingual content (EN/HI toggle) | ✅ |
| Offline banner (animated slide-down) | ✅ |
| Pull-to-refresh on all list screens | ✅ |
| ErrorBoundary with retry + dev stack trace | ✅ |
| Android native config + ProGuard rules | ✅ |
| GitHub Actions CI/CD (debug + signed release) | ✅ |
| SettingsScreen language toggle uses useLanguage hook | ✅ |
| usePagination — removeItem for optimistic list mutations | ✅ |
| Category-wise accuracy breakdown on ProfileScreen (GET /user/category-stats) | ✅ |
| Input component uses React.forwardRef — enables focus chaining between fields | ✅ |
| Accessibility labels on all icon buttons, answer options, LanguageToggle, menu rows | ✅ |
| Answer option scale-pop animation (Animated.spring) on tap in QuestionCard | ✅ |
| Skeleton shimmer loading placeholders — QuizListScreen, HomeScreen daily quiz + news | ✅ |

---

## Deep Link Reference

| URL | Destination |
|-----|-------------|
| `riserank://home` | Home tab |
| `riserank://search` | Search screen |
| `riserank://quiz` | Quiz list |
| `riserank://quiz/:quizId` | Quiz detail |
| `riserank://quiz/result/:attemptId` | Quiz result |
| `riserank://quiz/review/:attemptId` | Quiz review |
| `riserank://articles` | Current affairs list |
| `riserank://article/:id` | Article detail |
| `riserank://leaderboard` | Leaderboard |
| `riserank://profile` | Profile |
| `riserank://profile/history` | Quiz history |
| `riserank://profile/bookmarks` | Bookmarks |
| `riserank://profile/notifications` | Notification history |

---

## FCM Notification Payload Format

The backend should include a `data` object on every FCM message so the app can deep-navigate on tap:

```json
{
  "notification": { "title": "Daily Quiz Ready!", "body": "Test your SSC knowledge today" },
  "data": {
    "type": "quiz",
    "quizId": "abc123"
  }
}
```

Supported `type` values: `quiz` (+ `quizId`), `article` (+ `articleId`), `leaderboard`, `streak`.

---

## Pending / TODO

- [ ] iOS support (needs Xcode + `cd ios && pod install` + APNs config)
- [x] Google OAuth — `POST /auth/google`, `googleAuth.service.ts`, wired into Login + Register screens
- [x] Offline quiz caching (AsyncStorage, TTL-aware, stale fallback + cached banner)
- [x] Animated question swipe transitions in quiz attempt
- [x] Admin panel web app (`riserank-admin/` — React + Vite + Tailwind)
- [ ] iPad / tablet layout
- [ ] Play Store listing assets (screenshots, feature graphic)
- [x] Sentry crash reporting (crashReporter service, wired into ErrorBoundary + authStore)
