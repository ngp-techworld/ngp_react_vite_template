import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/shared/styles/index.css';
import { App } from '@/app/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('index.html must contain <div id="root">');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
