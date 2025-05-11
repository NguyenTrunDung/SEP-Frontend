import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const getBreadcrumbName = (path) => {
        const nameMap = {
            dashboard: 'Dashboard',
            orders: 'Orders',
            menu: 'Menu Management',
            users: 'User Management',
            profile: 'Profile',
            patients: 'Patients',
            reports: 'Reports',
        };
        return nameMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
    };

    const breadcrumbItems = [
        {
            title: (
                <Link to="/">
                    <HomeOutlined /> Home
                </Link>
            ),
        },
        ...pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            return {
                title: index === pathnames.length - 1 ? (
                    getBreadcrumbName(value)
                ) : (
                    <Link to={to}>{getBreadcrumbName(value)}</Link>
                ),
            };
        }),
    ];

    return (
        <div className="breadcrumbs-container">
            <Breadcrumb items={breadcrumbItems} />
        </div>
    );
};

export default Breadcrumbs; 