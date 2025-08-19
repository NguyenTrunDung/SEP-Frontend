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
  AimOutlined,
  ShopOutlined,
  CommentOutlined,
  GlobalOutlined,
  TeamOutlined,
  TruckOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { ROLES } from "../constants/roles";
import { PERMISSIONS } from "../constants/permissions";
import UserHeader from "../components/common/UserHeader";
import BranchSwitcher from "../components/common/BranchSwitcher";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const AdminLayout = ({ children }) => {
  const { user, isSystemAdmin, logout, loginType } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate based on original login type for better UX
      const redirectPath = loginType === 'internal' ? '/login' : '/';
      navigate(redirectPath);
    } catch (error) {
      console.error('❌ AdminLayout logout failed:', error);
      const redirectPath = loginType === 'internal' ? '/login' : '/';
      navigate(redirectPath);
    }
  };

  // Helper function to check if user has required role (kept for backwards compatibility)
  const hasRequiredRole = React.useCallback((allowedRoles) => {
    return user?.role && allowedRoles.includes(user.role);
  }, [user?.role]);

  // Helper function to check permission-based access
  const canAccess = (requiredPermissions = []) => {
    // System admins can access everything
    if (isSystemAdmin) return true;

    // If no permissions required, allow access
    if (requiredPermissions.length === 0) return true;

    // Check if user has any of the required permissions
    return requiredPermissions.some((permission) => hasPermission(permission));
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
      "/branches": ["branches"],
      "/departments": ["departments"],
      "/shippers": ["shippers"],
      "/kitchen-orders": ["kitchen-orders"],
    };

    return menuKeys[pathname] || (hasRequiredRole([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER])
      ? ["dashboard"]
      : hasRequiredRole([ROLES.CASHIER])
        ? ["cashier"]
        : hasRequiredRole([ROLES.STAFF, ROLES.NURSE])
          ? ["orders"]
          : hasRequiredRole([ROLES.KITCHEN])
            ? ["kitchen"]
            : []);
  }, [location.pathname, hasRequiredRole]);

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

  // Permission-based menu items
  const menuItems = [
    // Dashboard
    canAccess([PERMISSIONS.OVERVIEW_VIEW]) && {
      key: "dashboard",
      icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/dashboard">Thống kê</Link>,
    },

    // Orders Management
    canAccess([PERMISSIONS.ORDERS_VIEW]) && {
      key: "orders",
      icon: <ShoppingOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/orders">Đơn hàng</Link>,
    },

    // Kitchen
    canAccess([PERMISSIONS.KITCHEN_VIEW]) && {
      key: "kitchen",
      icon: <FireFilled style={{ fontSize: "18px" }} />,
      label: <Link to="/kitchens">Nhà bếp</Link>,
    },
    // Kitchen
    canAccess([PERMISSIONS.ORDERS_VIEW]) && {
      key: "kitchen-orders",
      icon: <ShoppingOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/kitchen-orders">Đơn hàng bệnh nhân</Link>,
    },
    // Shippers
    canAccess([PERMISSIONS.DELIVERY_VIEW]) && {
      key: "shippers",
      icon: <TruckOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/shippers">Nhân viên giao hàng</Link>,
    },

    // Menus
    canAccess([PERMISSIONS.MENUS_VIEW]) && {
      key: "menus",
      icon: <MenuOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/menus">Thực đơn</Link>,
    },

    // Feedbacks
    canAccess([PERMISSIONS.FEEDBACKS_VIEW]) && {
      key: "feedbacks",
      icon: <CommentOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/feedbacks">Đánh giá</Link>,
    },

    // Food Management
    canAccess([PERMISSIONS.FOODS_VIEW, PERMISSIONS.FOODCATEGORIES_VIEW]) && {
      key: "food-management",
      icon: <CoffeeOutlined style={{ fontSize: "18px" }} />,
      label: "Món ăn",
      children: [
        canAccess([PERMISSIONS.FOODCATEGORIES_VIEW]) && {
          key: "food-categories",
          icon: <AppstoreOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/food-categories">Nhóm món ăn</Link>,
        },
        canAccess([PERMISSIONS.FOODS_VIEW]) && {
          key: "foods",
          icon: <ShopOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/foods">Món ăn</Link>,
        },
        canAccess([PERMISSIONS.FOODFORPATIENTS_VIEW]) && {
          key: "food-for-patients",
          icon: <ShopOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/food-for-patients">Món ăn cho bệnh nhân</Link>,
        },
      ].filter(Boolean),
    },

    // System Settings - Only show if user has any relevant permissions
    (() => {
      // Check if user has any system-related permissions
      const hasSystemPermissions = canAccess([PERMISSIONS.SYSTEM_SETTINGS]);
      const hasUserPermissions = canAccess([PERMISSIONS.USERS_VIEW, PERMISSIONS.WALLET_VIEW, PERMISSIONS.USERS_ROLES]);
      const hasCategoryPermissions = canAccess([
        PERMISSIONS.BRANCHES_VIEW,
        PERMISSIONS.AREAS_VIEW,
        PERMISSIONS.LOCATIONS_VIEW,
        PERMISSIONS.DEPARTMENTS_VIEW,
        PERMISSIONS.DISEASECATEGORIES_VIEW
      ]);

      // Only show System Settings if user has any relevant permissions
      if (!hasSystemPermissions && !hasUserPermissions && !hasCategoryPermissions) {
        return false;
      }

      // Build the System Settings menu
      const systemChildren = [];

      // User Management Group - Only show if user has user-related permissions
      const userManagementChildren = [
        canAccess([PERMISSIONS.WALLET_VIEW]) && {
          key: "user-management",
          icon: <WalletOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/admin/user-management">Quản lý ví người dùng (Mới)</Link>,
        },
        canAccess([PERMISSIONS.GROUPUSERS_VIEW]) && {
          key: "group-user",
          icon: <TeamOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/admin/group-user">Nhóm người dùng</Link>,
        },
        canAccess([PERMISSIONS.USERACCOUNTS_VIEW]) && {
          key: "user-account",
          icon: <UserOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/admin/user-account">Người dùng</Link>,
        },
      ].filter(Boolean);

      if (userManagementChildren.length > 0) {
        systemChildren.push({
          key: "user-wallet-group",
          icon: <UserOutlined style={{ fontSize: "18px" }} />,
          label: "Quản lý người dùng",
          children: userManagementChildren,
        });
      }

      // Categories Group - Only show if user has category-related permissions
      const categoryChildren = [
        canAccess([PERMISSIONS.BRANCHES_VIEW]) && {
          key: "branches",
          icon: <ShopOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/branches">Chi nhánh</Link>,
        },
        canAccess([PERMISSIONS.AREAS_VIEW]) && {
          key: "areas",
          icon: <GlobalOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/areas">Khu vực</Link>,
        },
        canAccess([PERMISSIONS.LOCATIONS_VIEW]) && {
          key: "locations",
          icon: <AimOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/locations">Vị trí</Link>,
        },
        canAccess([PERMISSIONS.DEPARTMENTS_VIEW]) && {
          key: "departments",
          icon: <TeamOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/departments">Phòng ban</Link>,
        },
        canAccess([PERMISSIONS.DISEASECATEGORIES_VIEW]) && {
          key: "disease-categories",
          icon: <AppstoreOutlined style={{ fontSize: "18px" }} />,
          label: <Link to="/disease-categories">Nhóm bệnh</Link>,
        },
      ].filter(Boolean);

      if (categoryChildren.length > 0) {
        systemChildren.push({
          key: "categories",
          icon: <AppstoreOutlined style={{ fontSize: "18px" }} />,
          label: "Danh mục",
          children: categoryChildren,
        });
      }

      // Only return the menu item if there are children to show
      return systemChildren.length > 0 ? {
        key: "settings",
        icon: <SettingOutlined style={{ fontSize: "18px" }} />,
        label: "Cài đặt hệ thống",
        children: systemChildren,
      } : false;
    })(),
  ].filter(Boolean);

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
          items={menuItems}
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
          {isSystemAdmin ? <BranchSwitcher /> : <div />}
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