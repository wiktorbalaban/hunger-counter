# Hunger Counter

React Native + Expo mobile app for tracking hunger episodes. Builds to Android APK and iOS IPA.

## Stack

- React Native 0.81 + Expo SDK 54
- NativeWind v4 (Tailwind CSS for React Native)
- Custom multi-pane navigator (replaces React Navigation's `Tab.Navigator`); `NavigationContainer` kept as inert wrapper for future deep-linking
- MMKV for storage (synchronous, replaces AsyncStorage)
- victory-native v36 for the report chart (SVG-based; v41+ is Skia-based and lacks horizontal stacked bars)
- @quidone/react-native-wheel-picker for duration selection
- @sentry/react-native for opt-in crash reporting
- i18next + react-i18next for translations (en, pl, de, fr — loaded dynamically via `require.context`)

## Project layout

```
app-rn/
  src/
    models/               HungerEntry, Intensity
    services/
      hunger.service.ts     MMKV storage (synchronous)
      sentry.service.ts     Sentry init + opt-in consent stored in MMKV
    context/              HungerContext.tsx — app-wide state, ThemeContext.tsx — theme + dark mode
    components/
      IntensityPicker.tsx          Low/Medium/High segmented control
      DateTimeInput.tsx            native date+time picker (Android dialog flow)
      AnimatedDot.tsx              twinkling dot for concentration indicator
      DurationPickerModal.tsx      wheel picker for duration (uses @quidone/react-native-wheel-picker)
      CrashReportingConsentModal.tsx  first-launch consent dialog for Sentry
      LanguageSetting.tsx          settings row + modal for picking language
      ScreenContainer.tsx          max-width (600px) wrapper for screens — centers content on tablets
    screens/
      AddHungerScreen.tsx   Tab 1 — Track now + Log past
      TodayScreen.tsx       Tab 2 — Today's entries
      ReportScreen.tsx      Tab 3 — Horizontal stacked bar chart (last 10 days)
      MoreScreen.tsx        Tab 4 — Language, crash reporting, privacy policy
    navigation/
      TabNavigator.tsx      custom multi-pane navigator + bottom tab bar
      Pane.tsx              single pane wrapper with local header
      PaneContext.tsx       custom navigation context (usePaneNavigation, usePaneFocusEffect)
    native/
      DynamicIcon.ts        JS wrapper for the custom Android icon-switching module
    hooks/
      useAppIconSync.ts     syncs launcher icon with today's entry state
    tasks/
      iconSyncTask.ts       background task — resets icon after 3am
    utils/
      entry.ts              shared helpers (isTodayEntry)
    theme/
      default-theme.ts      light/dark Theme objects shared by ThemeContext
    i18n/
      index.ts              i18next init, loads locales dynamically via require.context
      locales/              en.json, pl.json, de.json, fr.json — each starts with `_name` (self-name in own language)
  App.tsx                   root — NavigationContainer + HungerProvider + ThemeProvider + Sentry init
  app.plugin.js             config plugin: dynamic icons + no-tablet supports-screens (currently disabled)
  tailwind.config.js        darkMode: 'media' + custom accent colors
  global.css                Tailwind directives
  babel.config.js           NativeWind babel preset
  metro.config.js           NativeWind preset + unstable_allowRequireContext for i18n
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
| textPrimary | #111827 | #f3f4f6 | main body text |
| secondarySurface | #f3f4f6 | #374151 | wheel picker overlay, secondary surfaces |
| modalOverlay | rgba(0,0,0,0.4) | rgba(0,0,0,0.6) | full-screen modal scrim |
| companionHeaderBg | #d1d5db | #1f2937 | header background of the non-active (companion) pane on tablets |
| companionHeaderText | #374151 | #9ca3af | header text of the non-active pane on tablets |
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
| After 3am (background task) | `ICON_SYNC_TASK` via `expo-background-task` (WorkManager on Android) |

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
      iconSyncTask.ts         expo-background-task — 3am daily reset
    utils/
      entry.ts                shared isTodayEntry() helper
  assets/
    full_icon.png             default icon (no hunger today)
    yin_yang_icon.png         alternate icon (hunger logged today)
```

## Navigation (custom multi-pane)

The app does not use `@react-navigation/bottom-tabs`. Instead it has a custom navigator in [src/navigation/TabNavigator.tsx](app-rn/src/navigation/TabNavigator.tsx) that supports 1 pane (phone) or 2 panes side-by-side (tablet in landscape).

### How it works

- `useWindowDimensions()` determines pane count: 2 if `width >= 768 && width > height`, otherwise 1
- Active tab state is held in `TabNavigator` via `useState`
- Visible panes = `[activeTab, ...next N-1 tabs]`, clipped at the end (so tapping "More" with N=2 shows just `[More]`)
- Each pane is wrapped in `<Pane>` which renders a local header bar + the screen, and provides a custom navigation context
- A history stack (`tabHistoryRef`) tracks tab changes; Android back button pops from it before the OS exits the app

### PaneContext (drop-in replacement for React Navigation hooks)

[src/navigation/PaneContext.tsx](app-rn/src/navigation/PaneContext.tsx) exports two hooks that screens use instead of `@react-navigation/native`:

| Custom hook | Replaces | Behavior difference |
|---|---|---|
| `usePaneNavigation()` | `useNavigation()` | `navigate(name)` no-ops if `name` is in currently visible panes (already on screen) |
| `usePaneFocusEffect(cb)` | `useFocusEffect(cb)` | Fires when the pane becomes visible; cleanup when hidden |

`setOptions({ title })` is also supported and updates the pane's local header in real time (used by `TodayScreen` for "Today: 1h 30m" suffix).

### When to add a new screen
1. Add it to the `SCREENS`, `TABS`, `ICONS`, and `TITLE_KEYS` maps in `TabNavigator.tsx`
2. Add translation keys under `tabs.<name>` in all locale files
3. Inside the screen, use `usePaneNavigation()` / `usePaneFocusEffect()` instead of React Navigation imports

## Tablet support

Two layers cooperate:

1. **`ScreenContainer`** ([src/components/ScreenContainer.tsx](app-rn/src/components/ScreenContainer.tsx)) — wraps each screen's content in a 600px max-width container, centered. Background spans full tablet width; content has comfortable gutters.
2. **Multi-pane navigator** — splits the screen area into two panes side-by-side when landscape + width ≥ 768.

The companion (right) pane on tablets gets a muted header via `companionHeaderBg` / `companionHeaderText` theme tokens; the active (left) pane keeps the vibrant primary header.

For `ReportScreen` the chart uses `useWindowDimensions()` for width/height so the chart re-sizes on rotation. The chart has a minimum height of 350px (`Math.max(windowHeight - 420, 350)`).

## Internationalization

Supported locales: en, pl, de, fr.

### Dynamic locale loading

[src/i18n/index.ts](app-rn/src/i18n/index.ts) uses `require.context('./locales', false, /\.json$/)` to import all JSON files in the locales folder at build time. Adding a new language is purely additive — drop `xx.json` into `src/i18n/locales/` and it will appear in the language picker on the next Metro rebuild.

`require.context` requires `config.transformer.unstable_allowRequireContext = true` in [metro.config.js](app-rn/metro.config.js).

### Locale file conventions

Each JSON file starts with a `_name` field containing the language's name **in its own language** (e.g. `"_name": "English"`, `"_name": "Polski"`). This name is shown in the language picker.

The TypeScript types for `t()` are inferred from `en.json` (configured in `i18next-types.d.ts` — check if you need to add it for new top-level keys).

### Language preference storage

`langStorage` (MMKV instance, id `lang-storage`) stores either a language code (`'en'`, `'pl'`, ...) or the literal string `'default'` (use device locale). The `LanguageSetting` component manages this; see [src/components/LanguageSetting.tsx](app-rn/src/components/LanguageSetting.tsx).

## Crash reporting (opt-in)

Sentry is integrated via [src/services/sentry.service.ts](app-rn/src/services/sentry.service.ts) with **explicit opt-in** consent — no analytics, no session tracking, no user data.

### Consent flow

1. `App.tsx` calls `initSentry()` before the React tree mounts. Sentry initializes with `enabled: getConsent() === true`, so it's silent until the user opts in.
2. On first launch, if `getConsent() === undefined`, `CrashReportingConsentModal` is shown.
3. The user's choice is stored in MMKV (`sentry-storage` instance, key `crash_reporting_consent`).
4. The user can toggle it anytime from the More tab.

### Sentry configuration

Hard-coded to crash-only mode — no breadcrumbs from HTTP/console, no performance traces, no PII, no screenshots. See `initSentry()` in `sentry.service.ts`.

### Source maps (release builds)

`@sentry/react-native` Gradle plugin uploads source maps during release builds. Configured via `android/sentry.properties` (gitignored — contains the auth token).

The Expo plugin entry in `app.json` has `organization` and `project` set so EAS builds know where to upload (not currently used; local builds use `sentry.properties`).

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

- MMKV storage is synchronous — no async/await, no loading states. Use `createMMKV({ id: 'storage-name' })` (NOT `new MMKV()`).
- `HungerContext` initialises directly from MMKV on mount (no flicker)
- `DateTimeInput` opens date picker then time picker sequentially (Android native dialogs)
- Concentration dots use React Native `Animated` API (twinkling loop)
- Report chart uses **horizontal** stacked bars (victory-native `VictoryChart horizontal`) — day labels on Y axis, duration on X axis
- Day labels use `toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })` — locale-aware DD/MM (or MM/DD, DD.MM, etc. depending on device language)
- Chart sizing uses `useWindowDimensions()` (not `Dimensions.get()`) so it updates on rotation; chart height has a minimum of 350px
- Log past mode: if no start time selected, defaults to current time on save
- Screens use the custom navigation hooks from [PaneContext](app-rn/src/navigation/PaneContext.tsx), NOT `@react-navigation/native` — see "Navigation" section above
- Screens should be wrapped in `<ScreenContainer>` to constrain max width on tablets — see [src/components/ScreenContainer.tsx](app-rn/src/components/ScreenContainer.tsx)
- Edge-to-edge mode is implicitly enabled (SDK 35+). The nav-bar button icons follow the theme via `NavigationBar.setButtonStyleAsync()` in `App.tsx`. No `setBackgroundColorAsync` — colors come from your `SafeAreaView` content drawn behind the transparent system bar.
- For RTL support, use logical Tailwind classes (`ms-*`, `me-*`, `ps-*`, `pe-*`) instead of `ml-*`/`mr-*`/`pl-*`/`pr-*`. React Native's flexbox auto-mirrors in RTL; icons that imply direction need manual flipping.
