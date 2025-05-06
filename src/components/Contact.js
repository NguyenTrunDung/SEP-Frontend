import React from 'react';
import { Card, Row, Col } from 'antd';
import { PhoneOutlined, MessageOutlined, MailOutlined } from '@ant-design/icons';

const ContactComponent = () => {
  const iconStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#3399ff',
    color: '#fff',
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
  };

  const cardStyle = {
    textAlign: 'center',
    borderRadius: '8px',
    padding: '50px 20px 20px',
    backgroundColor: '#f5f6f7',
    border: 'none',
    position: 'relative',
    minHeight: '280px',
    height: '100%',
  };

  const buttonStyle = {
    marginTop: '12px',
    borderRadius: '4px',
    padding: '8px 20px',
    border: 'none',
    backgroundColor: '#3399ff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
  };

  return (
    <div style={{ padding: '40px 16px', background: '#ffffff' }}>
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} md={8}>
          <Card style={cardStyle}>
            <div style={iconStyle}>
              <PhoneOutlined />
            </div>
            <h3 style={{ marginTop: '30px', fontSize: '20px' }}>Call Us</h3>
            <p style={{ margin: '10px 0', fontSize: '16px', color: '#333' }}>
              028 3840 8379
            </p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={cardStyle}>
            <div style={iconStyle}>
              <MessageOutlined />
            </div>
            <h3 style={{ marginTop: '30px', fontSize: '20px' }}>Chat Live</h3>
            <p style={{ margin: '10px 0', fontSize: '16px', color: '#333' }}>
              We're available Sun 7:00pm EST - Sunday 7:00pm EST
            </p>
            <button style={buttonStyle}>Chat Now</button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={cardStyle}>
            <div style={iconStyle}>
              <MailOutlined />
            </div>
            <h3 style={{ marginTop: '30px', fontSize: '20px' }}>Ask a Question</h3>
            <p style={{ margin: '10px 0', fontSize: '16px', color: '#333' }}>
              Email: canteen@gmail.com
            </p>
            <p style={{ margin: '10px 0', fontSize: '16px', color: '#333' }}>
              Fill out our form and we'll get back to you in 24 hours.
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContactComponent;
