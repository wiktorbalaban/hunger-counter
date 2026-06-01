# Hunger Counter

A mobile app for tracking hunger episodes — log when they happen, how intense they are, and whether concentration problems occurred. View your history for today and a weekly breakdown chart.

Built with React Native + Expo. Android only (iOS support not yet implemented).

<p align="center">
  <img src="app-rn/assets/yin_yang_icon.png" width="180" alt="Hunger Counter icon" />
</p>

## A word from the author

I built this app because I struggled with constant hunger — not just the body weight side of it, but the feeling. The overwhelming feeling of being hungry all the time. Tracking my daily hunger helps me manage it. I hope it can help you too!

## Features

- Two ways to log: **Track now** (start a timer, finish later) or **Log past** (enter a finished episode in one go)
- Intensity levels: low, medium, high
- Flag focus issues per episode
- Today tab — all entries for the current day with running total in the header
- Report tab — horizontal stacked bar chart for the last 10 days
- More tab — language picker, opt-in crash reporting toggle, privacy policy link
- Light + dark mode (follows system setting)
- Localized in English, Polish, German, French
- Tablet support — two panes side-by-side in landscape
- Dynamic launcher icon: switches automatically when you log an entry today (Android)
- All data stored locally — no account, no cloud, no analytics

## Tech stack

- React Native 0.81 + Expo SDK 54
- NativeWind v4 (Tailwind CSS)
- Custom multi-pane navigator (phone / tablet)
- MMKV (synchronous local storage)
- victory-native v36 (chart)
- @quidone/react-native-wheel-picker (duration selection)
- i18next (4 locales, loaded dynamically)
- @sentry/react-native (opt-in crash reporting only — no analytics)

## Development

```bash
cd app-rn
npm install
npx expo start              # start Metro dev server
npx expo run:android        # build and install on connected device/emulator
npx expo run:android --device Name_of_the_device
```

Requires Android Studio with SDK API 34+ and JDK 21.

## Build debug APK

```bash
cd app-rn
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

To run the debug APK on a device, Metro must be running and tunnelled:

```bash
adb reverse tcp:8081 tcp:8081
cd app-rn && npx expo start
```

## Links

- [Privacy Policy](https://wiktorbalaban.github.io/hunger-counter/privacy-policy.html)
