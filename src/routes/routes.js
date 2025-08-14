// src/routes/routes.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';

import AdminLayout from '../layouts/AdminLayout';
import DefaultLayout from '../layouts/DefaultLayout';
import ProtectedRoute, { AuthRedirect } from './ProtectedRoute.js';
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
import OrderPatient from '../modules/Admin/OrderPatient/OrderPatient.js';
import Feedbacks from '../modules/Admin/Feedback/Feedbacks.js';

//Cart

import Menu from '../modules/Admin/Menu/index.js';

import ContactPage from '../components/HomePage/Contact.js';
import Navbar from '../components/HomePage/Navbar.js';
import FooterComponent from '../components/HomePage/Footer.js';

import FoodCategories from '../modules/Admin/FoodCategories/index.js';
import Food from '../modules/Admin/Food/index.js'
import Login from '../modules/Auth/Login.js';
import Register from '../modules/Auth/Register.js';
import PatientComponent from '../components/Nurse/Patient/PatientComponent.js';
import ImageTestComponent from '../components/examples/ImageTestComponent.js';
import VnPayTest from '../components/examples/VnPayTest.js';
import VnPayReturn from '../components/Payment/VnPayReturn.js';

import AreasPage from '../modules/Admin/Area/AreasPage.js';
import LocationsPage from '../modules/Admin/Locations/LocationPage.js';
import DiseaseCategoriesTable from '../modules/Admin/DiseaseCategory/DiseaseCategoryPage.js';
import FoodForPatientPage from '../modules/Admin/FoodForPatients/index.js';
import VnPayIntegrationExample from '../components/examples/VnPayIntegrationExample.js';

import UserManagement from '../modules/Admin/User/index.js';
import GroupUser from '../modules/Admin/GroupUser/index.js';
import UserAccount from '../modules/Admin/UserAccount/index.js';

import KitchenView from '../modules/Admin/Kitchen/KitchenPage.js';
import BranchesPage from '../modules/Admin/Branch/BranchesPage.js';
import DepartmentsPage from '../modules/Admin/Department/DepartmentsPage.js';

import DeliveryStaff from '../modules/Admin/Shipper/DeliveryStaff.js'

// Helper function to find any accessible route for user permissions
const findAnyAccessibleRoute = (userPermissions) => {
  // Create a comprehensive permission-to-route mapping
  const allPermissionRoutes = {
    'overview:view': '/dashboard',
    'orders:view': '/orders',
    'menus:view': '/menus',
    'foods:view': '/foods',
    'foodcategories:view': '/food-categories',
    'kitchen:view': '/kitchens',
    'branches:view': '/branches',
    'areas:view': '/areas',
    'locations:view': '/locations',
    'departments:view': '/departments',
    'diseasecategories:view': '/disease-categories',
    'feedbacks:view': '/feedbacks',
    'delivery:view': '/shippers',
    'users:view': '/admin/user-account',
    'users:roles': '/admin/group-user',
    'wallet:view': '/admin/user-management',
  };

  // Find the first permission that has a corresponding route
  for (const permission of userPermissions) {
    if (allPermissionRoutes[permission]) {
      return allPermissionRoutes[permission];
    }
  }

  return null; // No accessible route found
};

// Smart redirect function based on user permissions
const getSmartRedirectPath = (userRole, userPermissions) => {
  // Priority order: try to find the first page the user has access to
  const permissionToRouteMap = [
    { permission: 'overview:view', route: '/dashboard' },
    { permission: 'orders:view', route: '/orders' },
    { permission: 'menus:view', route: '/menus' },
    { permission: 'foods:view', route: '/foods' },
    { permission: 'foodcategories:view', route: '/food-categories' },
    { permission: 'kitchen:view', route: '/kitchens' },
    { permission: 'branches:view', route: '/branches' },
    { permission: 'areas:view', route: '/areas' },
    { permission: 'locations:view', route: '/locations' },
    { permission: 'departments:view', route: '/departments' },
    { permission: 'diseasecategories:view', route: '/disease-categories' },
    { permission: 'feedbacks:view', route: '/feedbacks' },
    { permission: 'delivery:view', route: '/shippers' },
  ];

  // Find first route user has permission for
  for (const { permission, route } of permissionToRouteMap) {
    if (userPermissions.includes(permission)) {
      return route;
    }
  }

  // Enhanced fallback: try role-based redirect only if user has permission for it
  const roleBasedRoute = roleHomeRedirects[userRole];
  if (roleBasedRoute && roleBasedRoute !== '/dashboard') {
    // For special routes like /nurse/home, /patient/home, /, use them directly
    return roleBasedRoute;
  }

  // Final fallback: check if user can access dashboard, otherwise find any accessible page
  if (userPermissions.includes('overview:view')) {
    return '/dashboard';
  }

  // Last resort: find ANY page the user can access from their permissions
  const anyAccessibleRoute = findAnyAccessibleRoute(userPermissions);
  if (anyAccessibleRoute) {
    return anyAccessibleRoute;
  }

  // If user has no permissions for any known routes, send to unauthorized
  console.warn('User has no permissions for any known routes:', userPermissions);
  return '/unauthorized';
};

const roleHomeRedirects = {
  [ROLES.SYSTEM_ADMIN]: '/dashboard',
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.BRANCH_MANAGER]: '/dashboard',
  [ROLES.MANAGER]: '/dashboard',

  [ROLES.NURSE]: '/nurse/home',          // Nurses go to nurse home interface
  [ROLES.DOCTOR]: '/nurse/home', 
  [ROLES.PATIENT]: '/patient/home',
  [ROLES.STAFF]: '/dashboard',           // ✅ FIXED: Changed from /orders to /dashboard (safer default)
  [ROLES.CASHIER]: '/dashboard',         // ✅ FIXED: Changed from /orders to /dashboard (safer default)
  [ROLES.KITCHEN]: '/dashboard',         // ✅ FIXED: Changed from /orders to /dashboard (safer default)
  [ROLES.GUEST]: '/'                     // Guests stay on home page
};

// Route config with layout and role protection
const routes = [
  // Public home route (accessible to everyone)
  {
    path: '/',
    element: (
      <AuthRedirect roleHomeRedirects={roleHomeRedirects} getSmartRedirectPath={getSmartRedirectPath}>
        <Home />
      </AuthRedirect>
    ),
  },

  // Nurse public home route (for NURSE role)
  {
    path: '/nurse/public',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.NURSE]}>
        <Home />
      </ProtectedRoute>
    ),
  },

  // Login route
  {
    path: '/login',
    element: (
      <AuthRedirect roleHomeRedirects={roleHomeRedirects} getSmartRedirectPath={getSmartRedirectPath}>
        <Login />
      </AuthRedirect>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthRedirect roleHomeRedirects={roleHomeRedirects} getSmartRedirectPath={getSmartRedirectPath}>
        <Register />
      </AuthRedirect>
    ),
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
        {({ user, loginType, loading, permissions }) => {
          // Wait for authentication to complete before redirecting
          if (loading) {
            return (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '16px' }}>🔄 Redirecting...</div>
                  <div style={{ color: '#666' }}>Setting up your workspace...</div>
                </div>
              </div>
            );
          }

          if (!user?.role) {
            // If no user or role after loading, redirect to login
            console.log('❌ No user role found after loading, redirecting to login');
            return <Navigate to="/login" replace />;
          }

          // Nếu user đăng nhập qua public login, redirect về trang chủ
          if (loginType === 'public') {
            console.log('✅ Public login user, redirecting to home');
            return <Navigate to="/" replace />;
          }

          // Nếu user đăng nhập qua internal login, redirect theo permissions
          const redirectPath = getSmartRedirectPath(user.role, permissions || []);
          console.log(`✅ Internal login user with role ${user.role}, redirecting to ${redirectPath}`);
          return <Navigate to={redirectPath} replace />;
        }}
      </ProtectedRoute>
    ),
  },

  // Admin routes - Now using permission-based access
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <Order />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders/:id',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <OrderDetails />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/order-patients',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <OrderPatient />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/kitchens',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <KitchenView />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/feedbacks',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <Feedbacks />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/shippers',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <DeliveryStaff />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/branches',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <BranchesPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/departments',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <DepartmentsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  // {
  //   path: '/admin/users',
  //   element: (
  //     <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]}>
  //       <AdminLayout>
  //         <CustomerPage />
  //       </AdminLayout>
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: '/admin/user-management',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <UserManagement />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/group-user',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <GroupUser />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/user-account',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <UserAccount />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <div>Settings</div>
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/profile',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <Profile />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/edit-profile/:id',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <EditProfile />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/change-password/:id',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <ChangePassword />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/menus',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <Menu />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/food-categories',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <FoodCategories />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/foods', // Added Foods route
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <Food />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/areas', // Thêm route cho Areas
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <AreasPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/locations', // Thêm route cho Areas
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <LocationsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/disease-categories',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <DiseaseCategoriesTable />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/food-for-patients',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <FoodForPatientPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/test/images', // Test route for image loading system
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <ImageTestComponent />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/test/vnpay', // Test route for VNPay integration
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <VnPayIntegrationExample />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/vnpay-return', // VNPay return URL (public access)
    element: <VnPayReturn />,
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
      <ProtectedRoute allowedRoles={[ROLES.NURSE, ROLES.DOCTOR]}>
        <DefaultLayout>
          <Profile />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/nurse/edit-profile/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.NURSE, ROLES.DOCTOR]}>
        <DefaultLayout>
          <EditProfile />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/nurse/change-password/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.NURSE, ROLES.DOCTOR]}>
        <DefaultLayout>
          <ChangePassword />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/nurse/patient',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.NURSE]}>
        <Navbar />
        <PatientComponent />
        <FooterComponent />
      </ProtectedRoute>
    ),
  },

  // Kitchen specific routes (if needed later)
  {
    path: '/kitchen',
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <Order />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },

  // Test route for debugging admin access
  {
    path: '/test-admin',
    element: (
      <ProtectedRoute>
        <div style={{ padding: '20px' }}>
          <h1>Admin Test Page</h1>
          <p>If you can see this, you have admin access.</p>
        </div>
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
export { getSmartRedirectPath };