import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FooterComponent from '../components/Footer';

const { Content } = Layout;

const DefaultLayout = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ padding: '24px', background: '#fff' }}>
                <Outlet />
            </Content>
            <FooterComponent />
        </Layout>
    );
};

export default DefaultLayout; 