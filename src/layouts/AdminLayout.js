import React, { useMemo } from "react";
import { Layout, Menu, Avatar, Dropdown, Typography } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  ShopOutlined,
  AppstoreOutlined,
  CoffeeOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const hasRequiredRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  const getSelectedMenuKey = useMemo(() => {
    const pathname = location.pathname;

    if (pathname === "/dashboard") return ["dashboard"];
    if (pathname === "/orders") return ["orders"];
    if (pathname === "/menus") return ["menus"];
    if (pathname === "/admin/users") return ["users"];
    if (pathname === "/admin/settings") return ["settings"];
    if (pathname === "/food-categories") return ["food-categories"];
    if (pathname === "/foods") return ["foods"]; // Added foods key

    if (hasRequiredRole([ROLES.ADMIN, ROLES.DOCTOR])) return ["dashboard"];
    if (hasRequiredRole([ROLES.ADMIN, ROLES.STAFF])) return ["orders"];

    return [];
  }, [location.pathname, user]);

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link
          to={
            user?.role === ROLES.ADMIN
              ? "/admin/profile"
              : user?.role === ROLES.DOCTOR
                ? "/doctor/profile"
                : user?.role === ROLES.PATIENT
                  ? "/patient/profile"
                  : user?.role === ROLES.STAFF
                    ? "/staff/profile"
                    : "#"
          }
          style={{ fontSize: "15px" }}
        >
          Thông tin cá nhân
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: "#ff4d4f" }}>
        <span style={{ fontSize: "15px" }}>Đăng xuất</span>
      </Menu.Item>
    </Menu>
  );

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
          <Title level={3} style={{ margin: 0, color: "#1890ff", fontSize: "20px" }}>
            🏥 Hệ Thống Quản Lý
          </Title>
          <Text style={{ color: "#666", fontSize: "14px" }}>Căn tin Bệnh viện</Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={getSelectedMenuKey}
          style={menuStyle}
          items={[
            hasRequiredRole([ROLES.ADMIN, ROLES.DOCTOR]) && {
              key: "dashboard",
              icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/dashboard" style={{ fontSize: "16px", fontWeight: "500" }}>Thống kê</Link>,
            },
            hasRequiredRole([ROLES.ADMIN, ROLES.STAFF]) && {
              key: "orders",
              icon: <ShoppingCartOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/orders" style={{ fontSize: "16px", fontWeight: "500" }}>Quản lý đơn hàng</Link>,
            },
            hasRequiredRole([ROLES.ADMIN, ROLES.STAFF]) && {
              key: "menus",
              icon: <MenuOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/menus" style={{ fontSize: "16px", fontWeight: "500" }}>Quản lý thực đơn</Link>,
            },
            hasRequiredRole([ROLES.ADMIN]) && {
              key: "users",
              icon: <UserOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/admin/users" style={{ fontSize: "16px", fontWeight: "500" }}>Quản lý người dùng</Link>,
            },
            hasRequiredRole([ROLES.ADMIN]) && {
              key: "foods",
              icon: <ShopOutlined style={{ fontSize: "18px" }} />,
              label: "Món ăn",
              children: [
                {
                  key: "food-categories",
                  icon: <AppstoreOutlined style={{ fontSize: "16px" }} />, // Icon for Food Categories
                  label: (
                    <Link to="/food-categories" style={{ fontSize: "16px", fontWeight: "500" }}>
                      Nhóm món ăn
                    </Link>
                  ),
                },
                {
                  key: "foods",
                  icon: <CoffeeOutlined style={{ fontSize: "16px" }} />, // Icon for Foods
                  label: (
                    <Link to="/foods" style={{ fontSize: "16px", fontWeight: "500" }}>
                      Món ăn
                    </Link>
                  ),
                },
              ],
            },
            hasRequiredRole([ROLES.ADMIN]) && {
              key: "settings",
              icon: <SettingOutlined style={{ fontSize: "18px" }} />,
              label: <Link to="/admin/settings" style={{ fontSize: "16px", fontWeight: "500" }}>Cài đặt hệ thống</Link>,
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
          <div />
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Text style={{ fontSize: "15px", color: "#666" }}>
              Xin chào, <strong style={{ color: "#262626" }}>{user?.firstName || user?.email}</strong>
            </Text>
            <Dropdown overlay={userMenu} placement="bottomRight" arrow>
              <Avatar size="default" icon={<UserOutlined />} style={{ backgroundColor: "#1890ff", cursor: "pointer" }} />
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ background: "#fff", minHeight: 360, borderRadius: 8, border: "1px solid #f0f0f0" }}>{children}</div>
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
          <Text style={{ color: "#999", fontSize: "12px" }}>Phát triển bởi SEP490 Team</Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;