import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import './index.css'
import App from './App.jsx'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, 
  // Session Replay
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<div className="p-4 text-red-500">Ha ocurrido un error inesperado. Por favor recarga la página.</div>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
