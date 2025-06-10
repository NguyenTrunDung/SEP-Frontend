// src/layouts/DefaultLayout.js
import React from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Carousel from '../components/CarouselComponent';
import Menu from '../components/Dishes/Menu';
import Desease from '../components/Desease';
import FooterComponent from '../components/Footer';
import UserHeader from '../components/common/UserHeader';

const { Content } = Layout;

const DefaultLayout = () => {
  const location = useLocation();
  console.log('DefaultLayout - Rendering for path:', location.pathname, 'search:', location.search);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Carousel />
      <Menu />
      <Desease />
      <Content style={{ padding: '24px', background: '#fff' }}>
        <div style={{ minHeight: '360px' }}>
          <Outlet />
        </div>
      </Content>
      <FooterComponent />
    </Layout>
  );
};

export default DefaultLayout;