import React from 'react';

const BannerComponent = () => {
  return (
    <div style={{ position: 'relative', width: 'auto', height: '580px', overflow: 'hidden' }}>
      <img
        src="/images/a_vibrant_hospital_image_.png" // Hình banner
        alt="Banner"
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Giữ nguyên để ảnh bao phủ toàn bộ
          filter: 'brightness(1.1)',
        }}
      />
    </div>
  );
};

export default BannerComponent;