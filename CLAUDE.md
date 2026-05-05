# Hunger Counter

React Native + Expo mobile app for tracking hunger episodes. Builds to Android APK and iOS IPA.

## Stack

- React Native 0.81 + Expo SDK 54
- NativeWind v4 (Tailwind CSS for React Native)
- React Navigation (bottom tabs)
- MMKV for storage (synchronous, replaces AsyncStorage)
- victory-native v36 for the report chart (SVG-based; v41+ is Skia-based and lacks horizontal stacked bars)

## Project layout

```
app-rn/
  src/
    models/               HungerEntry, Intensity
    services/             hunger.service.ts — MMKV storage (synchronous)
    context/              HungerContext.tsx — app-wide state, ThemeContext.tsx — theme + dark mode
    components/
      IntensityPicker.tsx   Low/Medium/High segmented control
      DateTimeInput.tsx     native date+time picker (Android dialog flow)
      AnimatedDot.tsx       twinkling dot for concentration indicator
    screens/
      AddHungerScreen.tsx   Tab 1 — Track + Log manually
      TodayScreen.tsx       Tab 2 — Today's entries
      ReportScreen.tsx      Tab 3 — Horizontal stacked bar chart (last 10 days)
      MoreScreen.tsx        Tab 4 — Privacy policy link (opens GitHub Pages)
    navigation/
      TabNavigator.tsx      bottom tab bar
    native/
      DynamicIcon.ts        JS wrapper for the custom Android icon-switching module
    hooks/
      useAppIconSync.ts     syncs launcher icon with today's entry state
    tasks/
      iconSyncTask.ts       background task — resets icon after 3am
    utils/
      entry.ts              shared helpers (isTodayEntry)
  App.tsx                   root — NavigationContainer + HungerProvider
  tailwind.config.js        darkMode: 'media' + custom accent colors
  global.css                Tailwind directives
  babel.config.js           NativeWind babel preset
  metro.config.js           NativeWind metro preset
```

## Dark mode

The app supports light and dark mode with two complementary systems working together.

### NativeWind `dark:` variants
Used for standard surface/text/border colors that map cleanly to Tailwind's gray palette:
- `bg-white dark:bg-gray-800` — card surfaces
- `bg-gray-50 dark:bg-gray-900` — screen backgrounds
- `border-gray-200 dark:border-gray-700` — borders
- `text-gray-500 dark:text-gray-400` — label text

`darkMode: 'media'` is set in `tailwind.config.js` so `dark:` variants activate from the system setting automatically.

### Theme object (`useTheme()`)
Used for brand/accent colors that can't be expressed as static Tailwind classes — chart fills, hunger intensity colors, primary buttons, navigation bar. Defined in `src/theme/default-theme.ts` as `lightTheme` / `darkTheme` objects sharing a `Theme` interface.

```ts
const { theme, isDark, toggleTheme } = useTheme();
```

`ThemeProvider` uses NativeWind's `useColorScheme` (not React Native's) so both systems are driven by the same source. Calling `toggleTheme()` updates both `dark:` class resolution and the `theme` object simultaneously.

### Rule of thumb
- Gray backgrounds, borders, plain text → NativeWind `dark:` class
- Brand colors, chart fills, intensity colors, numeric values (e.g. bar width) → `theme.*`

### Theme tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| primary | #508c76 | #6aad96 | buttons, active tab, switch track |
| buttonSurface | #508c76 | #374151 | filled button/header/tab background |
| onPrimary | #ffffff | #111827 | text on top of buttonSurface |
| lowHunger | #d4b84a | #e0c45a | low intensity |
| mediumHunger | #d48850 | #e09660 | medium intensity |
| highHunger | #c45050 | #d46060 | high intensity |
| conc | #4a4a5a | #5a5a70 | focus issues chip background |
| concLight | #5c5c6b | #9090a8 | focus issues text / dot |
| chartBarWidth | 32 | 12 | VictoryBar barWidth |

## Dynamic app icon (Android only)

The launcher icon switches automatically based on whether the user has logged any hunger entries today:

- **No entries today** → `full_icon.png` (full apple)
- **Entries exist today** → `yin_yang_icon.png` (yin yang apple)

**iOS is not yet supported.** The entire mechanism is Android-specific.

### How it works

Android uses *activity aliases* — multiple `<activity-alias>` entries in `AndroidManifest.xml` each pointing at `.MainActivity` with a different icon. Only one alias is enabled at a time; the enabled one is what appears in the launcher.

Switching is done by a custom Kotlin native module (`DynamicIconModule.kt`) that calls `PackageManager.setComponentEnabledSetting()` for both aliases in the same method call — enable the new one, disable the old one atomically. This avoids the "two icons" bug that occurs when enable and disable are separated by a lifecycle callback gap (as in the `react-native-change-icon` package).

The icon state (which alias is currently enabled) is persisted in MMKV under the `icon-storage` instance so the JS layer doesn't need to query the OS.

### When the switch fires

| Trigger | Location |
|---|---|
| App opens (mount) | `useAppIconSync` hook in `AppContent` |
| App goes to background | `AppState 'background'` listener in `useAppIconSync` |
| After 3am (background task) | `ICON_SYNC_TASK` via `expo-background-fetch` |

The background task runs approximately every hour, checks if it's past 3am and hasn't already run today (MMKV `icon_last_reset_date`), then syncs the icon. This handles the case where the day rolls over while the app is closed.

### Adding the setup to a fresh native build

The `app.plugin.js` config plugin handles everything during `expo prebuild`:
1. Copies `full_icon.png` and `yin_yang_icon.png` into all `mipmap-*` density folders
2. Adds the two `<activity-alias>` entries to `AndroidManifest.xml`
3. Copies `DynamicIconModule.kt` and `DynamicIconPackage.kt` (from `modules/`) into the Android source tree with the correct package name substituted
4. Patches `MainApplication.kt` to register `DynamicIconPackage`

Never manually edit files inside `android/` for this feature — they are regenerated on every `prebuild --clean`.

### Project layout additions

```
app-rn/
  modules/
    DynamicIconModule.kt      Kotlin template — atomic alias swap via PackageManager
    DynamicIconPackage.kt     Kotlin template — registers the module
  src/
    native/
      DynamicIcon.ts          JS wrapper around NativeModules.DynamicIcon
    hooks/
      useAppIconSync.ts       reads entries, syncs icon on mount + background
    tasks/
      iconSyncTask.ts         expo-background-fetch task — 3am daily reset
    utils/
      entry.ts                shared isTodayEntry() helper
  assets/
    full_icon.png             default icon (no hunger today)
    yin_yang_icon.png         alternate icon (hunger logged today)
```

## GitHub Pages (`docs/`)

Served from the `docs/` directory on the `main` branch.

```
docs/
  index.html          app landing page
  icon.png            app icon (copied from pics/apple-full-icon.png)
  privacy-policy.html privacy policy
```

The Google Play button in `index.html` is currently commented out — uncomment and set the correct URL once the app is published.

## Dev commands

```bash
cd app-rn
npx expo start              # Metro dev server
npx expo run:android        # build + install on connected device/emulator
npx expo prebuild           # generate android/ and ios/ native folders
```

## Android APK build

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

Requires: JDK 21, Android Studio with SDK API 34+.

### Running debug APK on a device

Debug APKs load JS from Metro at runtime. Before launching the app:

```bash
adb reverse tcp:8081 tcp:8081   # tunnel Metro through USB
cd app-rn && npx expo start     # start Metro
```

Without Metro running the app will crash with "unable to load script".

## Future: Expo EAS Build (cloud CI)

**Why it's a good fit:**
- Builds Android APK and iOS IPA in the cloud — no Mac required for iOS builds
- Free tier covers personal/hobby projects
- Single command: `eas build --platform all`
- Handles signing, certificates, and provisioning profiles automatically
- Can be triggered from git push

## Key design notes

- MMKV storage is synchronous — no async/await, no loading states
- `HungerContext` initialises directly from MMKV on mount (no flicker)
- `DateTimeInput` opens date picker then time picker sequentially (Android native dialogs)
- Concentration dots use React Native `Animated` API (twinkling loop)
- Report chart uses **horizontal** stacked bars (victory-native `VictoryChart horizontal`) — day labels on Y axis, duration on X axis
- Day labels use `toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })` — locale-aware DD/MM (or MM/DD, DD.MM, etc. depending on device language)
- `onLayout` for chart sizing must be on an outer `View` sized by the tab navigator, not on the card containing the chart — measuring the card that holds the chart causes an infinite height growth loop
- Log manually mode: if no start time selected, defaults to current time on save
