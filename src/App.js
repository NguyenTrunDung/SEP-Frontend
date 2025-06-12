// import React, { Suspense } from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/common/ProtectedRoute';
// import { routes } from './routes';
// import './App.css';

// // Loading component
// const Loading = () => (
//   <div className="loading-container">
//     <div className="loading-spinner" />
//   </div>
// );

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Suspense fallback={<Loading />}>
//           <Routes>
//             {routes.map(({ path, element, requiredRole }) => (
//               <Route
//                 key={path}
//                 path={path}
//                 element={
//                   requiredRole ? (
//                     <ProtectedRoute requiredRole={requiredRole}>
//                       {element}
//                     </ProtectedRoute>
//                   ) : (
//                     element
//                   )
//                 }
//               />
//             ))}
//           </Routes>
//         </Suspense>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;


// // src/App.js
// import React, { Suspense } from "react";
// import { RouterProvider } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import "./App.css";
// import router from "./routes/routes";

// // Loading component for Suspense
// const Loading = () => (
//   <div className="loading-spinner">
//     <p>Loading...</p>
//   </div>
// );

// function App() {
//   return (
//     <AuthProvider>
//       <Suspense fallback={<Loading />}>
//         <RouterProvider router={router} />
//       </Suspense>
//     </AuthProvider>
//   );
// }

// export default App;


// src/App.js
import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from './context/CartContext';
import { FoodCategoryProvider } from './context/FoodCategoryContext';
import "./App.css";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import router from "./router";
import { queryClient } from './lib/reactQuery';

// Loading component for Suspense
const Loading = () => (
  <div className="loading-spinner">
    <p>Loading...</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <FoodCategoryProvider>
            <Suspense fallback={<Loading />}>
              <RouterProvider router={router} />
            </Suspense>
          </FoodCategoryProvider>
        </CartProvider>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export default App;