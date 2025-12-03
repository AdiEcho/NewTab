import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QuickAddCard } from '@/components/QuickAddCard';
import './popup.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QuickAddCard />
  </StrictMode>
);
