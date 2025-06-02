import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const FooterComponent = () => {
  return (
    <Footer
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#b4c80f', // Màu nền
        color: '#fff', // Màu chữ
        fontSize: '15px',
        padding: '20px 50px',
        fontFamily: 'Quicksand, sans-serif, -apple-system, blinkmacsystemfont, Segoe UI, roboto, Helvetica Neue, arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", Segoe UI Symbol !important',
      }}
    >
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div>Mã số thuế: 0301483939 do Sở KHDT TP.HCM cấp ngày 18-11-2011</div>
        <div>Mã số giấy phép ATTT số 118130-FSV-1 do Công ty CP CN và KĐ</div>
        <div>Vinacontrol cấp ngày 09/01/2024</div>
      </div>

      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>HỆ THỐNG QUẢN LÝ SUẤT ĂN BỆNH VIỆN</div>
        <div>Địa chỉ: 236/6 Điện Biên Phủ, Phường 17, Quận Ninh Kiều, TP. Cần Thơ</div>
        <div>Điện thoại: 028 3840 8379</div>
        <div>Email: homms@gmail.com</div>
        <img
          src="/images/logo.png" // Thay bằng URL logo thực tế
          alt="Đã thông báo"
          style={{ width: '40px', height: '40px', marginRight: '10px' }}
        />
      </div>

      <div style={{ flex: 1, textAlign: 'left' }}>
        <div>Chính sách bảo mật thông tin</div>
        <div>Chính sách giao, nhận hàng</div>
        <div>Chính sách thanh toán</div>
        <div>Chính sách đổi trả</div>
        <div>Copyright © Hospital Ordered Meal Management System 2025</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
          <img
            src="/images/bct.png" // Thay bằng URL logo thực tế
            alt="Bộ Công Thương"
            style={{ width: '40px', height: '40px', marginRight: '10px' }}
          />
        </div>
      </div>
    </Footer>
  );
};

export default FooterComponent;