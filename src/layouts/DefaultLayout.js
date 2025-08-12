import React from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/HomePage/Navbar';
import Carousel from '../components/HomePage/CarouselComponent';
import Menu from '../components/Dishes/Menu';
import Desease from '../components/HomePage/Desease';
import FooterComponent from '../components/HomePage/Footer';
import UserHeader from '../components/common/UserHeader';

const { Content } = Layout;

const DefaultLayout = () => {
  const location = useLocation();
  console.log('DefaultLayout - Rendering for path:', location.pathname, 'search:', location.search);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <div id="home">
        <Carousel />
      </div>
      <div id="menu">
        <Menu />
      </div>
      <div id="desease">
        <Desease />
      </div>
      <div id="contact">
        <FooterComponent />
      </div>
    </Layout>
  );
};

export default DefaultLayout;