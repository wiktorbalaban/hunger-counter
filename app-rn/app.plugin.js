const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const DENSITIES = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];

// ── Alternate icon assets + activity aliases ─────────────────────────────────

function withAlternateIcons(config, { icons, defaultIcon }) {
  config = withDangerousMod(config, [
    'android',
    (config) => {
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res',
      );
      for (const [, srcRelPath] of Object.entries(icons)) {
        const src = path.join(config.modRequest.projectRoot, srcRelPath);
        const buf = fs.readFileSync(src);
        const fileName = path.basename(srcRelPath);
        for (const density of DENSITIES) {
          const dir = path.join(resDir, `mipmap-${density}`);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, fileName), buf);
        }
      }
      return config;
    },
  ]);

  config = withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application[0];

    const mainActivity = app.activity?.find(
      (a) => a.$['android:name'] === '.MainActivity',
    );
    if (mainActivity?.['intent-filter']) {
      mainActivity['intent-filter'] = mainActivity['intent-filter'].filter(
        (f) =>
          !(f.category ?? []).some(
            (c) => c.$['android:name'] === 'android.intent.category.LAUNCHER',
          ),
      );
    }

    app['activity-alias'] = app['activity-alias'] ?? [];
    for (const [name, srcRelPath] of Object.entries(icons)) {
      const mipmapName = path.basename(srcRelPath, '.png');
      app['activity-alias'].push({
        $: {
          'android:name': `.MainActivity${name}`,
          'android:enabled': name === defaultIcon ? 'true' : 'false',
          'android:exported': 'true',
          'android:icon': `@mipmap/${mipmapName}`,
          'android:targetActivity': '.MainActivity',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
            category: [
              { $: { 'android:name': 'android.intent.category.LAUNCHER' } },
            ],
          },
        ],
      });
    }

    return config;
  });

  return config;
}

// ── DynamicIcon native module ─────────────────────────────────────────────────

function withDynamicIconModule(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const pkg = config.android?.package ?? 'com.anonymous.apprn';
      const pkgPath = pkg.replace(/\./g, '/');
      const javaDir = path.join(
        config.modRequest.platformProjectRoot,
        `app/src/main/java/${pkgPath}`,
      );
      const templateDir = path.join(config.modRequest.projectRoot, 'modules');

      // Copy Kotlin files, substituting the real package name
      for (const file of ['DynamicIconModule.kt', 'DynamicIconPackage.kt']) {
        const content = fs
          .readFileSync(path.join(templateDir, file), 'utf8')
          .replace(/PACKAGE_NAME/g, pkg);
        fs.writeFileSync(path.join(javaDir, file), content);
      }

      // Register the package in MainApplication.kt (idempotent)
      const mainAppPath = path.join(javaDir, 'MainApplication.kt');
      let src = fs.readFileSync(mainAppPath, 'utf8');
      if (!src.includes('DynamicIconPackage')) {
        src = src.replace(
          '// add(MyReactNativePackage())',
          '// add(MyReactNativePackage())\n              add(DynamicIconPackage())',
        );
        fs.writeFileSync(mainAppPath, src);
      }

      return config;
    },
  ]);
}

// ── Root export ───────────────────────────────────────────────────────────────

function withAll(config, options) {
  config = withAlternateIcons(config, options);
  config = withDynamicIconModule(config);
  return config;
}

module.exports = withAll;
