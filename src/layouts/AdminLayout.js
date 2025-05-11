// src/layouts/AdminLayout.js
import React from "react";
import { Layout, Menu } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
    DashboardOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={250} theme="light">
                <div className="logo" style={{ padding: "20px", textAlign: "center" }}>
                    <h2>Admin Panel</h2>
                </div>
                <Menu mode="inline" defaultSelectedKeys={["dashboard"]}>
                    <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                        <Link to="/admin">Dashboard</Link>
                    </Menu.Item>
                    <Menu.Item key="users" icon={<UserOutlined />}>
                        <Link to="/admin/users">Manage Users</Link>
                    </Menu.Item>
                    <Menu.Item key="settings" icon={<SettingOutlined />}>
                        <Link to="/admin/settings">Settings</Link>
                    </Menu.Item>
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