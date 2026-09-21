import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import './i18n';
import App from './App.tsx';
import { store } from './app/store';
import { NotificationProvider } from './components/feedback/NotificationProvider';
import { AppThemeProvider } from './i18n/AppThemeProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <BrowserRouter>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </BrowserRouter>
      </AppThemeProvider>
    </Provider>
  </StrictMode>,
);
