type LogFn = (message: string, payload?: unknown) => void;

const info: LogFn = (message, payload) => {
  if (payload !== undefined) {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, payload);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`[INFO] ${message}`);
};

const error: LogFn = (message, payload) => {
  if (payload !== undefined) {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, payload);
    return;
  }

  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${message}`);
};

export const logger = {
  info,
  error
};
