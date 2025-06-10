// src/routes/routes.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';

import AdminLayout from '../layouts/AdminLayout';
import DefaultLayout from '../layouts/DefaultLayout';
import ProtectedRoute from './ProtectedRoute.js';
// Pages
// import Login from '../modules/Auth/Login.js';
import Dashboard from '../modules/Dashboard/Dashboard.js';
import Home from '../modules/Home/Home.js';
import Profile from '../modules/Profile.js';
import EditProfile from '../modules/EditProfile.js';
import ChangePassword from '../modules/ChangePassword.js';
import Unauthorized from '../modules/Unauthorized.js';
// Order pages
import Order from '../modules/Admin/Order/Order.js';
import OrderDetails from '../modules/Admin/Order/OrderDetails.js';

//Cart

import Menu from '../modules/Admin/Menu/index.js';
import CustomerPage from '../modules/Admin/Staff/index.js';

import ContactPage from '../components/Contact.js';
import Navbar from '../components/Navbar.js';
import FooterComponent from '../components/Footer.js';
import Login from '../modules/Auth/Login.js';

const roleHomeRedirects = {
  [ROLES.SYSTEM_ADMIN]: '/dashboard',
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.BRANCH_MANAGER]: '/dashboard',
  [ROLES.MANAGER]: '/dashboard',

  [ROLES.NURSE]: '/nurse/home',          // Nurses go to guest-like interface
  [ROLES.PATIENT]: '/patient/home',
  [ROLES.STAFF]: '/orders',
  [ROLES.CASHIER]: '/orders',
  [ROLES.KITCHEN]: '/orders',
  [ROLES.GUEST]: '/nurse/home'           // Guests also use the same interface as nurses
};

// Route config with layout and role protection
const routes = [
  // Public home route (accessible to everyone)
  {
    path: '/',
    element: <Home />,
  },

  // Login route
  {
    path: '/login',
    element: <Login />,
  },

  // Unauthorized route
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/contact',
    element: (
      <div>
        <Navbar />
        <ContactPage />
        <FooterComponent />
      </div>
    ),
  }
  ,

  // Role-based redirect route (used for redirecting after login)
  {
    path: '/redirect',
    element: (
      <ProtectedRoute>
        {({ user }) => {
          const redirectPath = user?.role ? roleHomeRedirects[user.role] : '/login';
          return <Navigate to={redirectPath} replace />;
        }}
      </ProtectedRoute>
    ),
  },

  // Admin routes
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.DOCTOR]}>
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN]}>
        <AdminLayout>
          <Order />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN]}>
        <AdminLayout>
          <OrderDetails />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]}>
        <AdminLayout>
          <CustomerPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN]}>
        <AdminLayout>
          <div>Settings</div>
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/profile',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN]}>
        <AdminLayout>
          <Profile />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/edit-profile/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN]}>
        <AdminLayout>
          <EditProfile />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/change-password/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN]}>
        <AdminLayout>
          <ChangePassword />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/menus',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR]}>
        <AdminLayout>
          <Menu />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },




  // Nurse routes
  {
    path: '/nurse/home',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.NURSE]}>
        <DefaultLayout>
          <Home />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },


  // Kitchen specific routes (if needed later)
  {
    path: '/kitchen',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.KITCHEN]}>
        <AdminLayout>
          <Order />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },

  // Catch-all route
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
];

export default routes;