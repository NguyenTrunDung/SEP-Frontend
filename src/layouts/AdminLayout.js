// src/layouts/AdminLayout.js
import React, { useMemo } from "react";
import { Layout, Menu, Typography } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  ShoppingOutlined,
  MenuOutlined,
  WalletOutlined,
  FireFilled,
  AppstoreOutlined,
  CoffeeOutlined,
  EnvironmentOutlined,
  AimOutlined,
  ShopOutlined,
  CommentOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import UserHeader from "../components/common/UserHeader";
import BranchSwitcher from "../components/common/BranchSwitcher";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const AdminLayout = ({ children }) => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/login");
  };

  // Helper function to check if user has required role
  const hasRequiredRole = (allowedRoles) => {
    return user?.role && allowedRoles.includes(user.role);
  };

  // Helper function to check permission or role
  const canAccess = (allowedRoles = [], requiredPermissions = []) => {
    // Check roles first
    if (allowedRoles.length > 0 && hasRequiredRole(allowedRoles)) {
      return true;
    }

    // Check permissions if available
    if (requiredPermissions.length > 0 && hasPermission) {
      return requiredPermissions.some((permission) => hasPermission(permission));
    }

    return false;
  };

  // Map routes to menu keys for active state persistence
  const getSelectedMenuKey = useMemo(() => {
    const pathname = location.pathname;

    const menuKeys = {
      "/dashboard": ["dashboard"],
      "/orders": ["orders"],
      "/menus": ["menus"],
      "/kitchens": ["kitchen"],
      "/cashier": ["cashier"],
      "/admin/users": ["users"],
      "/admin/settings": ["settings"],
      "/food-categories": ["food-categories"],
      "/foods": ["foods"],
      "/food-for-patients": ["food-for-patients"],
      "/areas": ["areas"],
      "/locations": ["locations"],
      "/disease-categories": ["disease-categories"],

      "/feedbacks": ["feedbacks"],
      "/admin/user-management": ["user-management"],
      "/admin/group-user": ["group-user"],
      "/admin/user-account": ["user-account"],
      "/branchs": ["branchs"],
    };

    return menuKeys[pathname] || (hasRequiredRole([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER])
      ? ["dashboard"]
      : hasRequiredRole([ROLES.CASHIER])
        ? ["cashier"]
        : hasRequiredRole([ROLES.KITCHEN])
          ? ["kitchen"]
          : hasRequiredRole([ROLES.STAFF, ROLES.NURSE])
            ? ["orders"]
            : []);
  }, [location.pathname, user]);

  const siderStyle = {
    background: "#fff",
    borderRight: "1px solid #f0f0f0",
    boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
  };

  const logoStyle = {
    padding: "24px 20px",
    textAlign: "center",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
  };

  const menuStyle = {
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={280} theme="light" style={siderStyle}>
        <div style={logoStyle}>
          <Title
            level={3}
            style={{ margin: 0, color: "#1890ff", fontSize: "20px" }}
          >
            🏥 Hệ Thống Quản Lý
          </Title>
          <Text style={{ color: "#666", fontSize: "14px" }}>
            Căn tin Bệnh viện
          </Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={getSelectedMenuKey}
          style={menuStyle}
          items={[
            // Dashboard - Accessible by Admin, Branch Manager, Manager, and Doctor
            canAccess([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.DOCTOR], ["overview:view"]) && {
              key: "dashboard",
              icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/dashboard">Thống kê</Link>,
            },

            // Orders - Accessible by Admin, Branch Manager, Manager, Staff, and Nurse
            canAccess([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.NURSE], ["orders:view"]) && {
              key: "orders",
              icon: <ShoppingOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/orders">Đơn hàng</Link>,
            },

            // Cashier - Accessible by Cashier, Admin, and Branch Manager
            canAccess([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER], ["wallet:view", "orders:edit"]) && {
              key: "cashier",
              icon: <WalletOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/cashier">Thu ngân</Link>,
            },

            // Kitchen - Accessible by Kitchen Staff, Admin, and Branch Manager
            canAccess([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.KITCHEN], ["kitchen:view"]) && {
              key: "kitchen",
              icon: <FireFilled style={{ fontSize: "18px" }} />,
              label: <Link to="/kitchens">Bếp</Link>,
            },

            // Menus - Accessible by Admin, Branch Manager, Manager, and Staff
            canAccess([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF], ["foods:view"]) && {
              key: "menus",
              icon: <MenuOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/menus">Thực đơn</Link>,
            },

            canAccess([ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF], ["feedbacks:view"]) && {
              key: "feedbacks",
              icon: <CommentOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/feedbacks">Đánh giá</Link>,
            },


            // Food Management - Admin, Branch Manager, Manager, Staff, Doctor
            canAccess([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.DOCTOR], ["foods:view"]) && {
              key: "food-management",
              icon: <CoffeeOutlined style={{ fontSize: "18px" }} />,
              label: "Món ăn",
              children: [
                {
                  key: "food-categories",
                  icon: <AppstoreOutlined style={{ fontSize: "18px" }} />,
                  label: <Link to="/food-categories">Nhóm món ăn</Link>,
                },
                {
                  key: "foods",
                  icon: <ShopOutlined style={{ fontSize: "18px" }} />,
                  label: <Link to="/foods">Món ăn</Link>,
                },
                {
                  key: "food-for-patients",
                  icon: <ShopOutlined style={{ fontSize: "18px" }} />,
                  label: <Link to="/food-for-patients">Món ăn cho bệnh nhân</Link>,
                },
              ],
            },

            // Settings - Admin only
            canAccess([ROLES.ADMIN], ["system:settings"]) && {
              key: "settings",
              icon: <SettingOutlined style={{ fontSize: "18px" }} />,
              label: "Cài đặt hệ thống",
              children: [
                // Users Management - Admin only

                {
                  key: "users",
                  icon: <UserOutlined style={{ fontSize: "18px" }} />,
                  label: <Link to="/admin/users">Quản lý nhân viên</Link>,
                },
                {
                  key: "user-wallet-group",
                  icon: <WalletOutlined style={{ fontSize: "18px" }} />,
                  label: "Quản lý ví người dùng",
                  children: [
                    {
                      key: "user-management",
                      label: <Link to="/admin/user-management">Quản lý ví người dùng (Mới)</Link>,
                    },
                    {
                      key: "group-user",
                      label: <Link to="/admin/group-user">Nhóm người dùng</Link>,
                    },
                    {
                      key: "user-account",
                      label: <Link to="/admin/user-account">Người dùng</Link>,
                    },
                  ],
                },
                // Categories - Admin only
                {
                  key: "categories",
                  icon: <AppstoreOutlined style={{ fontSize: "18px" }} />,
                  label: "Danh mục",
                  children: [
                    {
                      key: "branchs",
                      icon: <ShopOutlined style={{ fontSize: "18px" }} />,
                      label: <Link to="/branchs">Chi nhánh</Link>,
                    },
                    {
                      key: "areas",
                      icon: <GlobalOutlined style={{ fontSize: "18px" }} />,
                      label: <Link to="/areas">Khu vực</Link>,
                    },
                  
                    {
                  key: "locations",
                  icon: <AimOutlined style={{ fontSize: "18px" }} />,
                  label: <Link to="/locations">Vị trí</Link>,
                },
                {
                  key: "disease-categories",
                  icon: <AppstoreOutlined style={{ fontSize: "18px" }} />,
                  label: <Link to="/disease-categories">Nhóm bệnh</Link>,
                },
              ],
            },
          ],
            },
          ].filter(Boolean)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Branch Switcher - Only for System Admin */}
          {hasRequiredRole([ROLES.SYSTEM_ADMIN]) ? <BranchSwitcher /> : <div />}
          <UserHeader onLogout={handleLogout} />
        </Header>

        <Content style={{ margin: "24px 16px 0" }}>
          <div
            style={{
              background: "#fff",
              minHeight: 360,
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            }}
          >
            {children}
          </div>
        </Content>

        <Footer
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
            background: "#fafafa",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Text style={{ color: "#666" }}>
            Hệ Thống Quản Lý Căng tin Bệnh viện © {new Date().getFullYear()}
          </Text>
          <br />
          <Text style={{ color: "#999", fontSize: "12px" }}>
            Phát triển bởi SEP490 Team
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;