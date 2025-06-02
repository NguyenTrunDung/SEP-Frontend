// src/layouts/AdminLayout.js
import React from "react";
import { Layout, Menu } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
    DashboardOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    ShoppingCartOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Helper function to check if user has required role
    const hasRequiredRole = (allowedRoles) => {
        if (!user || !user.role) return false;
        return allowedRoles.includes(user.role);
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={250} theme="light">
                <div className="logo" style={{ padding: "20px", textAlign: "center" }}>
                    <h2>Admin Panel</h2>
                </div>
                <Menu mode="inline" defaultSelectedKeys={["dashboard"]}>
                    {/* Dashboard - Accessible by Admin and Doctor */}
                    {hasRequiredRole([ROLES.ADMIN, ROLES.DOCTOR]) && (
                        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                            <Link to="/dashboard">Dashboard</Link>
                        </Menu.Item>
                    )}

                    {/* Orders - Accessible by Admin and Staff */}
                    {hasRequiredRole([ROLES.ADMIN, ROLES.STAFF]) && (
                        <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
                            <Link to="/orders">Orders</Link>
                        </Menu.Item>
                    )}

                    {/* Orders - Accessible by Admin and Staff */}
                    {hasRequiredRole([ROLES.ADMIN, ROLES.STAFF]) && (
                        <Menu.Item key="menus" icon={<ShoppingCartOutlined />}>
                            <Link to="/menus">Thực đơn</Link>
                        </Menu.Item>
                    )}

                    {/* Users Management - Admin only */}
                    {hasRequiredRole([ROLES.ADMIN]) && (
                        <Menu.Item key="users" icon={<UserOutlined />}>
                            <Link to="/admin/users">Manage Users</Link>
                        </Menu.Item>
                    )}

                    {/* Settings - Admin only */}
                    {hasRequiredRole([ROLES.ADMIN]) && (
                        <Menu.Item key="settings" icon={<SettingOutlined />}>
                            <Link to="/admin/settings">Settings</Link>
                        </Menu.Item>
                    )}

                    {/* Logout - Available for all roles */}
                    <Menu.Item
                        key="logout"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header style={{ background: "#fff", padding: 0 }} />
                <Content style={{ margin: "24px 16px 0" }}>
                    <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
                        {children}
                    </div>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    Hospital Canteen Management System ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;