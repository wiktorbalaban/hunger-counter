# Hunger Counter

A mobile app for tracking hunger episodes — log when they happen, how intense they are, and whether concentration problems occurred. View your history for today and a weekly breakdown chart.

Built with React Native + Expo. Android only (iOS support not yet implemented).

<p align="center">
  <img src="app-rn/assets/yin_yang_icon.png" width="180" alt="Hunger Counter icon" />
</p>

## Features

- Log hunger episodes with start time and duration
- Intensity levels: low, medium, high
- Flag concentration problems per episode
- Today tab — all entries for the current day
- Report tab — horizontal stacked bar chart for the last 10 days
- More tab — privacy policy link
- Dynamic launcher icon: switches automatically when you log an entry today (Android)
- All data stored locally — no account, no cloud, no tracking

## Tech stack

- React Native 0.81 + Expo SDK 54
- NativeWind v4 (Tailwind CSS)
- React Navigation (bottom tabs)
- MMKV (synchronous local storage)
- victory-native v36 (chart)

## Development

```bash
cd app-rn
npm install
npx expo start              # start Metro dev server
npx expo run:android        # build and install on connected device/emulator
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
