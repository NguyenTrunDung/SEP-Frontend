// // src/routes/index.jsx
// import React from 'react';
// import { createBrowserRouter, Navigate } from 'react-router-dom';
// import { ROLES } from '../constants/roles';
// import ProtectedRoute from './ProtectedRoute';
// import AdminLayout from '../components/layout/AdminLayout';
// import DefaultLayout from '../components/layout/DefaultLayout';

// // Pages
// import Login from '../pages/Auth/Login';
// import Dashboard from '../pages/Dashboard/Dashboard';
// import Home from '../pages/Home/Home';
// import Orders from '../pages/Orders/Orders';
// import Menu from '../pages/Menu/Menu';
// import Users from '../pages/Users/Users';
// import Unauthorized from '../pages/Unauthorized/Unauthorized';
// import NotFound from '../pages/NotFound/NotFound';

// // Define role-specific home redirects
// const roleHomeRedirects = {
//   [ROLES.ADMIN]: '/dashboard',
//   [ROLES.DOCTOR]: '/doctor/appointments',
//   [ROLES.PATIENT]: '/patient/profile',
//   [ROLES.STAFF]: '/staff/dashboard'
// };

// const router = createBrowserRouter([
//   // Public routes
//   {
//     path: '/login',
//     element: <Login />,
//   },
//   {
//     path: '/unauthorized',
//     element: <Unauthorized />,
//   },

//   // Admin routes
//   {
//     path: '/',
//     element: <AdminLayout />,
//     children: [
//       {
//         path: 'dashboard',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.ADMIN}>
//             <Dashboard />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: 'orders',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.ADMIN}>
//             <Orders />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: 'menu',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.ADMIN}>
//             <Menu />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: 'users',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.ADMIN}>
//             <Users />
//           </ProtectedRoute>
//         ),
//       },
//     ],
//   },

//   // Doctor routes
//   {
//     path: '/doctor',
//     element: <DefaultLayout />,
//     children: [
//       {
//         path: 'appointments',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.DOCTOR}>
//             <Home />
//           </ProtectedRoute>
//         ),
//       },
//       // Other doctor routes
//     ],
//   },

//   // Patient routes
//   {
//     path: '/patient',
//     element: <DefaultLayout />,
//     children: [
//       {
//         path: 'profile',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.PATIENT}>
//             <Home />
//           </ProtectedRoute>
//         ),
//       },
//       // Other patient routes
//     ],
//   },

//   // Staff routes
//   {
//     path: '/staff',
//     element: <DefaultLayout />,
//     children: [
//       {
//         path: 'dashboard',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.STAFF}>
//             <Home />
//           </ProtectedRoute>
//         ),
//       },
//       // Other staff routes
//     ],
//   },

//   // Root redirect based on role
//   {
//     path: '/',
//     element: (
//       <ProtectedRoute>
//         {({ user }) => {
//           const redirectPath = user?.role ? roleHomeRedirects[user.role] : '/login';
//           return <Navigate to={redirectPath} replace />;
//         }}
//       </ProtectedRoute>
//     ),
//   },

//   // Catch all route
//   {
//     path: '*',
//     element: <NotFound />
//   }
// ]);

// export default router;

// src/routes/routes.js
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';

import AdminLayout from '../layouts/AdminLayout';
import DefaultLayout from '../layouts/DefaultLayout';
import ProtectedRoute from './ProtectedRoute.js';
// Pages
import Login from '../Modules/Auth/Login.js';
import Dashboard from '../Modules/Dashboard/Dashboard.js';
import Home from '../Modules/Home/Home.js';
import Profile from '../Modules/Profile.js';
import Unauthorized from '../Modules/Unauthorized.js';
//import NotFound from '../pages/NotFound/NotFound';

// Admin pages - adjust paths if they're in the Admin folder
// import Orders from '../pages/Admin/Orders';
// import Menu from '../pages/Admin/Menu';
// import Users from '../pages/Admin/Users';

// Define role-specific home redirects
// const roleHomeRedirects = {
//   [ROLES.ADMIN]: '/dashboard',
//   [ROLES.DOCTOR]: '/doctor/home',
//   [ROLES.PATIENT]: '/patient/profile',
//   [ROLES.STAFF]: '/staff/home'
// };

// const router = createBrowserRouter([
//   // Public routes
//   {
//     path: '/login',
//     element: <Login />,
//   },
//   {
//     path: '/unauthorized',
//     element: <Unauthorized />,
//   },

//   // Admin routes
//   {
//     path: '/',
//     element: <AdminLayout />,
//     children: [
//       {
//         path: 'dashboard',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.ADMIN}>
//             <Dashboard />
//           </ProtectedRoute>
//         ),
//       },
//       // {
//       //   path: 'orders',
//       //   element: (
//       //     <ProtectedRoute requiredRole={ROLES.ADMIN}>
//       //       <Orders />
//       //     </ProtectedRoute>
//       //   ),
//       // },
//       // {
//       //   path: 'menu',
//       //   element: (
//       //     <ProtectedRoute requiredRole={ROLES.ADMIN}>
//       //       <Menu />
//       //     </ProtectedRoute>
//       //   ),
//       // },
//       // {
//       //   path: 'users',
//       //   element: (
//       //     <ProtectedRoute requiredRole={ROLES.ADMIN}>
//       //       <Users />
//       //     </ProtectedRoute>
//       //   ),
//       // },
//       // {
//       //   path: 'profile',
//       //   element: (
//       //     <ProtectedRoute requiredRole={ROLES.ADMIN}>
//       //       <Profile />
//       //     </ProtectedRoute>
//       //   ),
//       // },
//     ],
//   },

//   // Doctor routes
//   {
//     path: '/doctor',
//     element: <DefaultLayout />,
//     children: [
//       {
//         path: 'home',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.DOCTOR}>
//             <Home />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: 'profile',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.DOCTOR}>
//             <Profile />
//           </ProtectedRoute>
//         ),
//       },
//     ],
//   },

//   // Patient routes
//   {
//     path: '/patient',
//     element: <DefaultLayout />,
//     children: [
//       {
//         path: 'home',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.PATIENT}>
//             <Home />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: 'profile',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.PATIENT}>
//             <Profile />
//           </ProtectedRoute>
//         ),
//       },
//     ],
//   },

//   // Staff routes
//   {
//     path: '/staff',
//     element: <DefaultLayout />,
//     children: [
//       {
//         path: 'home',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.STAFF}>
//             <Home />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: 'profile',
//         element: (
//           <ProtectedRoute requiredRole={ROLES.STAFF}>
//             <Profile />
//           </ProtectedRoute>
//         ),
//       },
//     ],
//   },

//   // Root redirect based on role
//   {
//     path: '/',
//     element: <DefaultLayout />,
//     children: [
//       {
//         index: true,
//         element: <Navigate to={({ location }) => {
//           const user = JSON.parse(localStorage.getItem('user') || '{}');
//           const redirectPath = user?.role ? roleHomeRedirects[user.role] : '/login';
//           return redirectPath;
//         }} replace />,
//       }
//     ]
//   },

//   // Catch all route
//   // {
//   //   path: '*',
//   //   element: <NotFound />
//   // }
// ]);

// Export as array of route objects
const router = [
  // Public routes
  {
    path: '/',
    element: <DefaultLayout />,
  },
  {
    path: '/login',
    element: <Login />,
    roles: null
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
    roles: null
  },

  // Admin routes
  {
    path: '/dashboard',
    element: <Dashboard />,
    layout: AdminLayout,
    roles: [ROLES.ADMIN, ROLES.DOCTOR]
  },
  {
    path: '/orders',
    element: <DefaultLayout />,
    layout: AdminLayout,
    roles: [ROLES.ADMIN]
  },
  {
    path: '/menu',
    element: <DefaultLayout />,
    layout: AdminLayout,
    roles: [ROLES.ADMIN]
  },
  {
    path: '/users',
    element: <DefaultLayout />,
    layout: AdminLayout,
    roles: [ROLES.ADMIN]
  },
  {
    path: '/admin/profile',
    element: <Profile />,
    layout: AdminLayout,
    roles: [ROLES.ADMIN]
  },

  // Doctor routes
  {
    path: '/doctor/home',
    element: <Home />,
    layout: DefaultLayout,
    roles: [ROLES.DOCTOR]
  },
  {
    path: '/doctor/profile',
    element: <Profile />,
    layout: DefaultLayout,
    roles: [ROLES.DOCTOR]
  },

  // Patient routes
  {
    path: '/patient/home',
    element: <Home />,
    layout: DefaultLayout,
    roles: [ROLES.PATIENT]
  },
  {
    path: '/patient/profile',
    element: <Profile />,
    layout: DefaultLayout,
    roles: [ROLES.PATIENT]
  },

  // Staff routes
  {
    path: '/staff/home',
    element: <Home />,
    layout: DefaultLayout,
    roles: [ROLES.STAFF]
  },
  {
    path: '/staff/profile',
    element: <Profile />,
    layout: DefaultLayout,
    roles: [ROLES.STAFF]
  },

  // // Catch all route
  // {
  //   path: '*',
  //   element: <NotFound />,
  //   roles: null
  // }
];


export default router;