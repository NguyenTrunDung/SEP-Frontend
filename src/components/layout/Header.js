import React from 'react';
import { Layout, Menu, Button, Space, Avatar } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import {
    DashboardOutlined,
    UserOutlined,
    MenuOutlined,
    ShoppingCartOutlined,
    LogoutOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import './Header.css';

const { Header: AntHeader } = Layout;

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getNavigationItems = () => {
        if (!user) return [];

        const items = [
            {
                key: '/dashboard',
                icon: <DashboardOutlined />,
                label: <Link to="/dashboard">Dashboard</Link>,
            },
            {
                key: '/profile',
                icon: <UserOutlined />,
                label: <Link to="/profile">Profile</Link>,
            },
        ];

        // Add role-specific navigation items
        switch (user.role) {
            case ROLES.ADMIN:
                items.push(
                    {
                        key: '/users',
                        icon: <TeamOutlined />,
                        label: <Link to="/users">User Management</Link>,
                    },
                    {
                        key: '/menu',
                        icon: <MenuOutlined />,
                        label: <Link to="/menu">Menu Management</Link>,
                    },
                    {
                        key: '/orders',
                        icon: <ShoppingCartOutlined />,
                        label: <Link to="/orders">All Orders</Link>,
                    }
                );
                break;
            case ROLES.DOCTOR:
                items.push({
                    key: '/orders',
                    icon: <ShoppingCartOutlined />,
                    label: <Link to="/orders">Patient Orders</Link>,
                });
                break;
            case ROLES.STAFF:
                items.push(
                    {
                        key: '/menu',
                        icon: <MenuOutlined />,
                        label: <Link to="/menu">Menu Management</Link>,
                    },
                    {
                        key: '/orders',
                        icon: <ShoppingCartOutlined />,
                        label: <Link to="/orders">Orders</Link>,
                    }
                );
                break;
            case ROLES.PATIENT:
                items.push({
                    key: '/orders',
                    icon: <ShoppingCartOutlined />,
                    label: <Link to="/orders">My Orders</Link>,
                });
                break;
            default:
                break;
        }

        return items;
    };

    return (
        <AntHeader className="header">
            <div className="header-content">
                <div className="header-logo">
                    <Link to="/dashboard">Hospital Canteen</Link>
                </div>

                {user && (
                    <>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectedKeys={[location.pathname]}
                            items={getNavigationItems()}
                            className="header-nav"
                        />

                        <Space className="header-user">
                            <Avatar icon={<UserOutlined />} />
                            <span className="user-info">
                                {user.name} ({user.role})
                            </span>
                            <Button
                                type="text"
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                                className="logout-button"
                            >
                                Logout
                            </Button>
                        </Space>
                    </>
                )}
            </div>
        </AntHeader>
    );
};

export default Header; 