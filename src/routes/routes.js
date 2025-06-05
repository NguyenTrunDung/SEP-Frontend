
// src/routes/routes.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';

import AdminLayout from '../layouts/AdminLayout';
import DefaultLayout from '../layouts/DefaultLayout';
import ProtectedRoute from './ProtectedRoute.js';
// Pages
import Login from '../modules/Auth/Login.js';
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

const roleHomeRedirects = {
    [ROLES.ADMIN]: '/dashboard',
    [ROLES.DOCTOR]: '/doctor/home',
    [ROLES.NURSE]: '/nurse/home',
    [ROLES.PATIENT]: '/patient/home',
    [ROLES.STAFF]: '/orders'
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
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}>
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
        <AdminLayout>
          <Order />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
        <AdminLayout>
          <OrderDetails />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AdminLayout>
          <CustomerPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AdminLayout>
          <div>Settings</div>
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/profile',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AdminLayout>
          <Profile />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/edit-profile/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AdminLayout>
          <EditProfile />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/change-password/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AdminLayout>
          <ChangePassword />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/menus',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}>
        <AdminLayout>
          <Menu />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  // Doctor routes
  {
    path: '/doctor/home',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
        <DefaultLayout>
          <Home />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/profile',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
        <DefaultLayout>
          <Profile />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/edit-profile/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
        <DefaultLayout>
          <EditProfile />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/change-password/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
        <DefaultLayout>
          <ChangePassword />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },

  // Patient routes
  {
    path: '/patient/home',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
        <DefaultLayout>
          <Home />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/profile',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
        <DefaultLayout>
          <Profile />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/edit-profile/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
        <DefaultLayout>
          <EditProfile />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/change-password/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
        <DefaultLayout>
          <ChangePassword />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },

  // Staff routes
  {
    path: '/staff/home',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
        <AdminLayout>
          <Home />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/profile',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
        <AdminLayout>
          <Profile />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/edit-profile/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
        <AdminLayout>
          <EditProfile />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/change-password/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
        <AdminLayout>
          <ChangePassword />
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
    {
        path: '/nurse/profile',
        element: (
            <ProtectedRoute allowedRoles={[ROLES.NURSE]}>
                <DefaultLayout>
                    <Profile />
                </DefaultLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/nurse/edit-profile/:id',
        element: (
            <ProtectedRoute allowedRoles={[ROLES.NURSE]}>
                <DefaultLayout>
                    <EditProfile />
                </DefaultLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/nurse/change-password/:id',
        element: (
            <ProtectedRoute allowedRoles={[ROLES.NURSE]}>
                <DefaultLayout>
                    <ChangePassword />
                </DefaultLayout>
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