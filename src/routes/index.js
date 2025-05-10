import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';

// Lazy load pages
const Login = React.lazy(() => import('../pages/Login'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const OrderList = React.lazy(() => import('../pages/OrderList'));
const OrderDetails = React.lazy(() => import('../pages/OrderDetails'));
const MenuManagement = React.lazy(() => import('../pages/MenuManagement'));
const UserManagement = React.lazy(() => import('../pages/UserManagement'));
const Unauthorized = React.lazy(() => import('../pages/Unauthorized'));

export const routes = [
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/unauthorized',
        element: <Unauthorized />,
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
        requiredRole: ROLES.PATIENT, // Accessible by all authenticated users
    },
    {
        path: '/orders',
        element: <OrderList />,
        requiredRole: ROLES.PATIENT,
    },
    {
        path: '/orders/:id',
        element: <OrderDetails />,
        requiredRole: ROLES.PATIENT,
    },
    {
        path: '/menu',
        element: <MenuManagement />,
        requiredRole: ROLES.STAFF, // Only staff and above can manage menu
    },
    {
        path: '/users',
        element: <UserManagement />,
        requiredRole: ROLES.ADMIN, // Only admin can manage users
    },
]; 