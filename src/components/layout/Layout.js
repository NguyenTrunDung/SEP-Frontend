import React from 'react';
import { Layout as AntLayout } from 'antd';
import Header from './Header';
import Breadcrumbs from '../common/Breadcrumbs';
import './Layout.css';

const { Content } = AntLayout;

const Layout = ({ children }) => {
    return (
        <AntLayout className="layout">
            <Header />
            <Breadcrumbs />
            <Content className="layout-content">
                {children}
            </Content>
        </AntLayout>
    );
};

export default Layout; 