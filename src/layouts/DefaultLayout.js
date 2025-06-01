import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Carousel from '../components/CarouselComponent'
import Menu from '../components/Dishes/Menu'
import Desease from '../components/Desease'
import FooterComponent from '../components/Footer';

const { Content } = Layout;

const DefaultLayout = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Navbar />
            <Carousel/>
            <Menu/>
            <Desease/>
            <Content style={{ padding: '24px', background: '#fff' }}>
                <Outlet />
            </Content>
            <FooterComponent />
        </Layout>
    );
};

export default DefaultLayout; 