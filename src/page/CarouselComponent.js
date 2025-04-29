import React from 'react';
import { Carousel } from 'antd';

const slides = [
  { src: '/images/ca.jpg', alt: 'Slide 1' },
  { src: '/images/rau.png', alt: 'Slide 2' },
  { src: '/images/sua.jpg', alt: 'Slide 3' },
];

const CarouselComponent = () => {
  return (
    <Carousel autoplay autoplaySpeed={3000} effect="fade">
      {slides.map((slide, index) => (
        <div key={index} style={{ position: 'relative', height: '40vh' }}>
          <img
            src={slide.src}
            alt={slide.alt}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(1.1)',
            }}
          />
        </div>
      ))}
    </Carousel>
  );
};

export default CarouselComponent;