// src/layouts/AdminLayout.js
import React, { useMemo } from "react";
import { Layout, Menu, Avatar, Dropdown, Typography } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    DashboardOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    ShoppingCartOutlined,
    MenuOutlined
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

    // Helper function to check if user has required role
    const hasRequiredRole = (allowedRoles) => {
        if (!user || !user.role) return false;
        return allowedRoles.includes(user.role);
    };

    // Map routes to menu keys for active state persistence
    const getSelectedMenuKey = useMemo(() => {
        const pathname = location.pathname;

        if (pathname === "/dashboard") return ["dashboard"];
        if (pathname === "/orders") return ["orders"];
        if (pathname === "/menus") return ["menus"];
        if (pathname === "/admin/users") return ["users"];
        if (pathname === "/admin/settings") return ["settings"];

        // Default fallback based on role
        if (hasRequiredRole([ROLES.ADMIN, ROLES.DOCTOR])) return ["dashboard"];
        if (hasRequiredRole([ROLES.ADMIN, ROLES.STAFF])) return ["orders"];

        return [];
    }, [location.pathname, user]);

    // User dropdown menu for header
    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <span style={{ fontSize: '15px' }}>Thông tin cá nhân</span>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
                key="logout"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ color: '#ff4d4f' }}
            >
                <span style={{ fontSize: '15px' }}>Đăng xuất</span>
            </Menu.Item>
        </Menu>
    );

    const siderStyle = {
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
    };

    const logoStyle = {
        padding: '24px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
    };

    const menuStyle = {
        border: 'none',
        fontSize: '16px',
        fontWeight: '500'
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={280} theme="light" style={siderStyle}>
                <div style={logoStyle}>
                    <Title level={3} style={{ margin: 0, color: '#1890ff', fontSize: '20px' }}>
                        🏥 Hệ Thống Quản Lý
                    </Title>
                    <Text style={{ color: '#666', fontSize: '14px' }}>
                        Căn tin Bệnh viện
                    </Text>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={getSelectedMenuKey}
                    style={menuStyle}
                    items={[
                        // Dashboard - Accessible by Admin and Doctor
                        hasRequiredRole([ROLES.ADMIN, ROLES.DOCTOR]) && {
                            key: "dashboard",
                            icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/dashboard" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Thống kê
                                </Link>
                            ),
                        },

                        // Orders - Accessible by Admin and Staff
                        hasRequiredRole([ROLES.ADMIN, ROLES.STAFF]) && {
                            key: "orders",
                            icon: <ShoppingCartOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/orders" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Quản lý đơn hàng
                                </Link>
                            ),
                        },

                        // Menus - Accessible by Admin and Staff
                        hasRequiredRole([ROLES.ADMIN, ROLES.STAFF]) && {
                            key: "menus",
                            icon: <MenuOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/menus" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Quản lý thực đơn
                                </Link>
                            ),
                        },

                        // Users Management - Admin only
                        hasRequiredRole([ROLES.ADMIN]) && {
                            key: "users",
                            icon: <UserOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/admin/users" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Quản lý người dùng
                                </Link>
                            ),
                        },

                        // Settings - Admin only
                        hasRequiredRole([ROLES.ADMIN]) && {
                            key: "settings",
                            icon: <SettingOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/admin/settings" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Cài đặt hệ thống
                                </Link>
                            ),
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
                        alignItems: "center"
                    }}
                >
                    <div />

                    {/* User info and dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Text style={{ fontSize: '15px', color: '#666' }}>
                            Xin chào, <strong style={{ color: '#262626' }}>{user?.firstName || user?.email}</strong>
                        </Text>
                        <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                            <Avatar
                                size="default"
                                icon={<UserOutlined />}
                                style={{
                                    backgroundColor: '#1890ff',
                                    cursor: 'pointer'
                                }}
                            />
                        </Dropdown>
                    </div>
                </Header>

                <Content style={{ margin: "24px 16px 0" }}>
                    <div
                        style={{
                            // padding: 32,
                            background: "#fff",
                            minHeight: 360,
                            borderRadius: 8,
                            border: "1px solid #f0f0f0"
                        }}
                    >
                        {children}
                    </div>
                </Content>

                <Footer style={{
                    textAlign: "center",
                    color: '#666',
                    fontSize: '14px',
                    background: '#fafafa',
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <Text style={{ color: '#666' }}>
                        Hệ Thống Quản Lý Căng tin Bệnh viện © {new Date().getFullYear()}
                    </Text>
                    <br />
                    <Text style={{ color: '#999', fontSize: '12px' }}>
                        Phát triển bởi SEP490 Team
                    </Text>
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;