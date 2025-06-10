import React, { useMemo } from "react";
import { Layout, Menu, Typography } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    DashboardOutlined,
    UserOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
    MenuOutlined,
    WalletOutlined,
    FireOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import UserHeader from "../components/common/UserHeader";

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
        if (!user || !user.role) return false;
        return allowedRoles.includes(user.role);
    };

    // Helper function to check permission or role (for better flexibility)
    const canAccess = (allowedRoles = [], requiredPermissions = []) => {
        // Check roles first
        if (allowedRoles.length > 0 && hasRequiredRole(allowedRoles)) {
            return true;
        }

        // Check permissions if available
        if (requiredPermissions.length > 0) {
            return requiredPermissions.some(permission => hasPermission && hasPermission(permission));
        }

        return false;
    };

    // Map routes to menu keys for active state persistence
    const getSelectedMenuKey = useMemo(() => {
        const pathname = location.pathname;

        if (pathname === "/dashboard") return ["dashboard"];
        if (pathname === "/orders") return ["orders"];
        if (pathname === "/menus") return ["menus"];
        if (pathname === "/kitchen") return ["kitchen"];
        if (pathname === "/cashier") return ["cashier"];
        if (pathname === "/admin/users") return ["users"];
        if (pathname === "/admin/settings") return ["settings"];

        // Default fallback based on role
        if (hasRequiredRole([ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER])) return ["dashboard"];
        if (hasRequiredRole([ROLES.CASHIER])) return ["cashier"];
        if (hasRequiredRole([ROLES.KITCHEN])) return ["kitchen"];
        if (hasRequiredRole([ROLES.STAFF, ROLES.NURSE])) return ["orders"];

        return [];
    }, [location.pathname, user]);

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
                        // Dashboard - Accessible by Admin, Branch Manager, Manager, and Doctor
                        canAccess(
                            [ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.DOCTOR],
                            ['overview:view']
                        ) && {
                            key: "dashboard",
                            icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/dashboard" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Thống kê
                                </Link>
                            ),
                        },

                        // Orders - Accessible by Admin, Branch Manager, Manager, Staff, and Nurse
                        canAccess(
                            [ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF, ROLES.NURSE],
                            ['orders:view']
                        ) && {
                            key: "orders",
                            icon: <ShoppingCartOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/orders" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Quản lý đơn hàng
                                </Link>
                            ),
                        },

                        // Cashier - Accessible by Cashier and Admin
                        canAccess(
                            [ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER],
                            ['wallet:view', 'orders:edit']
                        ) && {
                            key: "cashier",
                            icon: <WalletOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/cashier" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Thu ngân
                                </Link>
                            ),
                        },

                        // Kitchen - Accessible by Kitchen Staff and Admin
                        canAccess(
                            [ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.KITCHEN],
                            ['kitchen:view']
                        ) && {
                            key: "kitchen",
                            icon: <FireOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/kitchen" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Bếp
                                </Link>
                            ),
                        },

                        // Menus - Accessible by Admin, Branch Manager, Manager, and Staff
                        canAccess(
                            [ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.STAFF],
                            ['foods:view']
                        ) && {
                            key: "menus",
                            icon: <MenuOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/menus" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Quản lý thực đơn
                                </Link>
                            ),
                        },

                        // Users Management - Admin and Branch Manager only
                        canAccess(
                            [ROLES.ADMIN, ROLES.BRANCH_MANAGER],
                            ['users:view']
                        ) && {
                            key: "users",
                            icon: <UserOutlined style={{ fontSize: '18px' }} />,
                            label: (
                                <Link to="/admin/users" style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Quản lý người dùng
                                </Link>
                            ),
                        },

                        // Settings - Admin only
                        canAccess(
                            [ROLES.ADMIN],
                            ['system:settings']
                        ) && {
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
                    <UserHeader onLogout={handleLogout} />
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