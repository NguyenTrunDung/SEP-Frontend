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
import Feedbacks from '../modules/Admin/Feedback/Feedbacks.js';

//Cart

import Menu from '../modules/Admin/Menu/index.js';
import CustomerPage from '../modules/Admin/Staff/index.js';

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

const roleHomeRedirects = {
  [ROLES.SYSTEM_ADMIN]: '/dashboard',
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.BRANCH_MANAGER]: '/dashboard',
  [ROLES.MANAGER]: '/dashboard',

  [ROLES.NURSE]: '/nurse/home',          // Nurses go to nurse home interface
  [ROLES.PATIENT]: '/patient/home',
  [ROLES.STAFF]: '/orders',
  [ROLES.CASHIER]: '/orders',
  [ROLES.KITCHEN]: '/orders',
  [ROLES.GUEST]: '/'           // Guests stay on home page
};

// Route config with layout and role protection
const routes = [
  // Public home route (accessible to everyone)
  {
    path: '/',
    element: (
      <AuthRedirect roleHomeRedirects={roleHomeRedirects}>
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
      <AuthRedirect roleHomeRedirects={roleHomeRedirects}>
        <Login />
      </AuthRedirect>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthRedirect roleHomeRedirects={roleHomeRedirects}>
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
        {({ user, loginType }) => {
          if (!user?.role) {
            // If no user or role, redirect to login
            return <Navigate to="/login" replace />;
          }

          // Nếu user đăng nhập qua public login, redirect về trang chủ
          if (loginType === 'public') {
            return <Navigate to="/" replace />;
          }

          // Nếu user đăng nhập qua internal login, redirect theo role
          const redirectPath = roleHomeRedirects[user.role] || '/dashboard';
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
    path: '/admin',
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
    path: '/kitchens',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN]}>
        <AdminLayout>
          <KitchenView />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/feedbacks',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF]}>
        <AdminLayout>
          <Feedbacks />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/shippers',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN]}>
        <AdminLayout>
          <DeliveryStaff />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/branches',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN]}>
        <AdminLayout>
          <BranchesPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/departments',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN]}>
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
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]}>
        <AdminLayout>
          <UserManagement />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/group-user',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]}>
        <AdminLayout>
          <GroupUser />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/user-account',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]}>
        <AdminLayout>
          <UserAccount />
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
  {
    path: '/food-categories',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR]}>
        <AdminLayout>
          <FoodCategories />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/foods', // Added Foods route
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR]}>
        <AdminLayout>
          <Food />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/areas', // Thêm route cho Areas
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR]}>
        <AdminLayout>
          <AreasPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/locations', // Thêm route cho Areas
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR]}>
        <AdminLayout>
          <LocationsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/disease-categories',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR]}>
        <AdminLayout>
          <DiseaseCategoriesTable />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/food-for-patients',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR]}>
        <AdminLayout>
          <FoodForPatientPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/test/images', // Test route for image loading system
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR]}>
        <AdminLayout>
          <ImageTestComponent />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/test/vnpay', // Test route for VNPay integration
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR]}>
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
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.KITCHEN]}>
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
      <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.DOCTOR]}>
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