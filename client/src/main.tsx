import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

// 高德地图安全密钥 — 2021年12月后申请的Key必须配置
// 必须在 AMap SDK 加载前设置
const securityCode = import.meta.env.VITE_AMAP_SECURITY_CODE;
if (securityCode) {
  (window as any)._AMapSecurityConfig = {
    securityJsCode: securityCode,
  };
  console.log('[AMap] Security code configured');
} else {
  console.warn('[AMap] No security code set — geocoding may fail');
}

const baseUrl = import.meta.env.BASE_URL;
const routerBasename =
  baseUrl && baseUrl !== '/' ? baseUrl.replace(/\/$/, '') : undefined;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={routerBasename}>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
