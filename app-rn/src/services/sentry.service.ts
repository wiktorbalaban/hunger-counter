import * as Sentry from '@sentry/react-native';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'sentry-storage' });
const CONSENT_KEY = 'crash_reporting_consent';

const DSN = 'https://0781ad62402af193522dbb29227509cd@o4511349364293632.ingest.de.sentry.io/4511349366259792';

export function getConsent(): boolean | undefined {
  const raw = storage.getString(CONSENT_KEY);
  if (raw === undefined) return undefined;
  return raw === 'true';
}

export function setConsent(value: boolean): void {
  storage.set(CONSENT_KEY, String(value));
  const client = Sentry.getClient();
  if (client) client.getOptions().enabled = value;
}

export function initSentry(): void {
  Sentry.init({
    dsn: DSN,
    enabled: getConsent() === true,

    // No analytics or usage data
    sendDefaultPii: false,
    enableAutoSessionTracking: false,
    enableUserInteractionTracing: false,
    attachScreenshot: false,

    // No performance monitoring
    tracesSampleRate: undefined,
    profilesSampleRate: undefined,

    // Drop breadcrumbs from network requests and console — keep only navigation/error context
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.type === 'http' || breadcrumb.category === 'console') return null;
      return breadcrumb;
    },
  });
}
