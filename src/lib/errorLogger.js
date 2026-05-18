const MAX_CLIENT_ERROR_LOGS = 80;

const toSerializableError = (error) => {
  if (!error) {
    return null;
  }

  return {
    name: error.name || 'Error',
    message: error.message || String(error),
    stack: error.stack || null,
  };
};

export const logClientError = ({ source = 'unknown', error = null, metadata = {} } = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    source,
    error: toSerializableError(error),
    metadata,
  };

  if (typeof window !== 'undefined') {
    const buffer = window.__lifelapssClientErrors || [];
    buffer.push(payload);
    if (buffer.length > MAX_CLIENT_ERROR_LOGS) {
      buffer.splice(0, buffer.length - MAX_CLIENT_ERROR_LOGS);
    }
    window.__lifelapssClientErrors = buffer;
  }

  // Keep console logging as the default transport for now.
  console.error('[client-error]', payload);

  return payload;
};
