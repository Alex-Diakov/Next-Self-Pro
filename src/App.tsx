import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

