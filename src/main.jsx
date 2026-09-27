import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import App from '@/App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Synclet could not start: the #root element is missing from index.html.');
}

createRoot(rootElement).render(
  <QueryClientProvider client={queryClientInstance}>
    <BrowserRouter>
      <TooltipProvider delayDuration={0}>
        <App />
        <Toaster />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
