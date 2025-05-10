import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { routes } from './routes';
import './App.css';

// Loading component
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {routes.map(({ path, element, requiredRole }) => (
              <Route
                key={path}
                path={path}
                element={
                  requiredRole ? (
                    <ProtectedRoute requiredRole={requiredRole}>
                      {element}
                    </ProtectedRoute>
                  ) : (
                    element
                  )
                }
              />
            ))}
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
