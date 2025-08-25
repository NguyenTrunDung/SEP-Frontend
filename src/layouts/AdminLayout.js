import React, { useMemo, useState, useEffect } from "react";
import { Layout, Menu, Typography, Button } from "antd";
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
  TruckOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

  // State for sidebar collapse
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize to toggle mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      const redirectPath = loginType === "internal" ? "/login" : "/";
      navigate(redirectPath);
    } catch (error) {
      console.error("❌ AdminLayout logout failed:", error);
      const redirectPath = loginType === "internal" ? "/login" : "/";
      navigate(redirectPath);
    }
  };

  const hasRequiredRole = React.useCallback(
    (allowedRoles) => {
      return user?.role && allowedRoles.includes(user.role);
    },
    [user?.role]
  );

  const canAccess = (requiredPermissions = []) => {
    if (isSystemAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some((permission) => hasPermission(permission));
  };

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
      "/order-patients": ["order-patients"],
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
    position: isMobile ? "fixed" : "relative",
    height: "100vh",
    zIndex: 1000,
    transition: "all 0.3s",
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

  const headerStyle = {
    background: "#fff",
    padding: "0 16px",
    borderBottom: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px", // Fixed height for consistency
    lineHeight: "64px",
    width: "100%",
  };

  const leftHeaderStyle = {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    gap: "8px",
  };

  const rightHeaderStyle = {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  };

  const menuItems = [
    canAccess([PERMISSIONS.OVERVIEW_VIEW]) && {
      key: "dashboard",
      icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/dashboard">Thống kê</Link>,
    },
    canAccess([PERMISSIONS.ORDERS_VIEW]) && {
      key: "orders",
      icon: <ShoppingOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/orders">Đơn hàng</Link>,
    },
    canAccess([PERMISSIONS.KITCHEN_VIEW]) && {
      key: "kitchen",
      icon: <FireFilled style={{ fontSize: "18px" }} />,
      label: <Link to="/kitchens">Nhà bếp</Link>,
    },
    canAccess([PERMISSIONS.KITCHEN_VIEW]) && {
      key: "kitchen-orders",
      icon: <ShoppingOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/kitchen-orders">Đơn hàng bệnh nhân</Link>,
    },
    canAccess([PERMISSIONS.DELIVERY_VIEW]) && {
      key: "shippers",
      icon: <TruckOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/shippers">Nhân viên giao hàng</Link>,
    },
    canAccess([PERMISSIONS.MENUS_VIEW]) && {
      key: "menus",
      icon: <MenuOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/menus">Thực đơn</Link>,
    },
    canAccess([PERMISSIONS.FEEDBACKS_VIEW]) && {
      key: "feedbacks",
      icon: <CommentOutlined style={{ fontSize: "18px" }} />,
      label: <Link to="/feedbacks">Đánh giá</Link>,
    },
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
    (() => {
      const hasSystemPermissions = canAccess([PERMISSIONS.SYSTEM_SETTINGS]);
      const hasUserPermissions = canAccess([PERMISSIONS.USERS_VIEW, PERMISSIONS.WALLET_VIEW, PERMISSIONS.USERS_ROLES]);
      const hasCategoryPermissions = canAccess([
        PERMISSIONS.BRANCHES_VIEW,
        PERMISSIONS.AREAS_VIEW,
        PERMISSIONS.LOCATIONS_VIEW,
        PERMISSIONS.DEPARTMENTS_VIEW,
        PERMISSIONS.DISEASECATEGORIES_VIEW,
      ]);

      if (!hasSystemPermissions && !hasUserPermissions && !hasCategoryPermissions) {
        return false;
      }

      const systemChildren = [];
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

      return systemChildren.length > 0
        ? {
            key: "settings",
            icon: <SettingOutlined style={{ fontSize: "18px" }} />,
            label: "Cài đặt hệ thống",
            children: systemChildren,
          }
        : false;
    })(),
  ].filter(Boolean);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && !collapsed && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={toggleCollapsed}
        />
      )}

      <Sider
        width={280}
        theme="light"
        style={siderStyle}
        collapsible
        collapsed={collapsed}
        collapsedWidth={isMobile ? 0 : 80}
        trigger={null}
      >
        <div style={logoStyle}>
          <Title
            level={3}
            style={{
              margin: 0,
              color: "#1890ff",
              fontSize: collapsed ? "16px" : "20px",
            }}
          >
            <img
              src="/images/lg.png"
              alt="Logo"
              style={{ height: 'clamp(50px, 10vw, 80px)', maxHeight: '50px', objectFit: 'contain' }}
            /> {collapsed ? "" : "Hệ Thống Quản Lý"}
          </Title>
          {!collapsed && (
            <Text style={{ color: "#666", fontSize: "14px" }}>
              Căn tin Bệnh viện
            </Text>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={getSelectedMenuKey}
          style={menuStyle}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={headerStyle}>
          <div style={leftHeaderStyle}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              style={{ marginRight: 8 }}
            />
            {isSystemAdmin ? <BranchSwitcher /> : <div />}
          </div>
          <div style={rightHeaderStyle}>
            <UserHeader
              onLogout={handleLogout}
              style={{
                flexShrink: 0,
                gap: isMobile ? "8px" : "12px",
              }}
              greetingStyle={{
                fontSize: isMobile ? "12px" : "15px",
                color: "#666",
              }}
              avatarSize={isMobile ? "small" : "default"}
              showGreeting={!isMobile} // Hide greeting text on mobile to save space
            />
          </div>
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