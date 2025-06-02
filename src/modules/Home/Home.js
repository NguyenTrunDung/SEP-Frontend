import React, { useState, useEffect } from 'react';
import { Layout, BackTop } from 'antd';
import Navbar from '../../components/Navbar';
import CarouselComponent from '../../components/CarouselComponent';
import MenuComponent from '../../components/Dishes/Menu';
import DeseaseComponent from '../../components/Desease';
import FooterComponent from '../../components/Footer';

const { Content } = Layout;

const Home = () => {
  // State to persist menu data
  const [menuState, setMenuState] = useState(() => {
    // Initialize from localStorage to persist across reloads
    const savedMenuState = localStorage.getItem('menuState');
    return savedMenuState ? JSON.parse(savedMenuState) : null;
  });

  // Save menu state to localStorage whenever it changes
  useEffect(() => {
    if (menuState) {
      localStorage.setItem('menuState', JSON.stringify(menuState));
    }
  }, [menuState]);

  // Handler to update menu state when something is saved
  const handleMenuUpdate = (newMenuData) => {
    setMenuState(newMenuData);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        <Navbar />
        <Content style={{ padding: '4px', background: '#fff', position: 'relative' }}>
          <div id="home" style={{ position: 'relative', zIndex: 0 }}>
            <CarouselComponent />
          </div>
          <div
            id="menu"
            style={{
              marginTop: '-80px', // Overlap the banner and extend into white space
              background: '#fff',
              padding: '2px',
              borderRadius: '2px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 1, // Ensure it sits above the banner
              width: '100%',
              maxWidth: '1040px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <MenuComponent menuState={menuState} onMenuUpdate={handleMenuUpdate} />
          </div>
          <div id="contact" style={{ paddingTop: '10px' }}>
            <DeseaseComponent />
          </div>
        </Content>
        <BackTop>
          <div
            style={{
              height: 50,
              width: 50,
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              color: '#fff',
              textAlign: 'center',
              lineHeight: '45px',
              fontSize: '25px',
            }}
          >
            ↑
          </div>
        </BackTop>
        <FooterComponent />
      </Layout>
    </Layout>
  );
};

export default Home;