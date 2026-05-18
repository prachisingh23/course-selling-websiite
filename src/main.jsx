import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '../index.css';
import { logClientError } from './lib/errorLogger';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logClientError({
      source: 'window.error',
      error: event.error || new Error(event.message || 'Unknown window error'),
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const error = reason instanceof Error ? reason : new Error(String(reason));

    logClientError({
      source: 'window.unhandledrejection',
      error,
      metadata: {
        rawReason: reason,
      },
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);