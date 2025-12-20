import Constants from 'expo-constants';

export type TelemetryEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

const appVersion = Constants.expoConfig?.version ?? 'unknown';

function logToConsole(prefix: string, payload: unknown) {
  // Central point to plug real analytics/crash provider (Sentry, Segment, etc.) later
  if (process.env.NODE_ENV === 'development') {
    console.log(`[telemetry:${prefix}]`, payload);
  }
}

export const telemetry = {
  track(event: TelemetryEvent) {
    logToConsole('event', { ...event, appVersion, ts: Date.now() });
  },
  logError(error: Error, context?: Record<string, unknown>) {
    logToConsole('error', { message: error.message, stack: error.stack, context });
  },
};
