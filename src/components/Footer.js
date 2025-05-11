import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const FooterComponent = () => {
  return (
    <Footer
      style={{
        textAlign: 'center',
        backgroundColor: '#000',
        color: '#fff',
        fontSize: '14px',
        padding: '16px 0',
      }}
    >
      <div>
        <a href="/privacy-policy" style={{ color: '#fff', margin: '0 15px' }}>
          Privacy Policy
        </a>
        |
        <a href="/delivery-policy" style={{ color: '#fff', margin: '0 15px' }}>
          Delivery Policy
        </a>
        |
        <a href="/payment-policy" style={{ color: '#fff', margin: '0 15px' }}>
          Payment Policy
        </a>
        |
        <a href="/return-policy" style={{ color: '#fff', margin: '0 15px' }}>
          Return Policy
        </a>
      </div>
      <div style={{ marginTop: '10px' }}>
        Tax ID: 0301483939 issued by the Department of Planning and Investment of Ho Chi Minh City on November 18, 2011
      </div>
      <div>
        Food Safety License No. 118130-FSV-1 issued by Vinacontrol Certification and Inspection Joint Stock Company on January 9, 2024
      </div>
      <div>
        © {new Date().getFullYear()} SEP490_33. All rights reserved.
      </div>
    </Footer>
  );
};

export default FooterComponent;