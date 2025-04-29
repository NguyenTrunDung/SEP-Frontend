import React from 'react';
import { Layout } from 'antd';
import Navbar from './Navbar';
import CarouselComponent from './CarouselComponent';

const { Content } = Layout;

const HomePage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Content
        style={{
          padding: '16px',
          background: '#fff',
        }}
      >
        <CarouselComponent />
      </Content>
    </Layout>
  );
};

export default HomePage;