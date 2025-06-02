import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Updated disease data with ingredients instead of dishes
const diseases = [
  {
    img: "images/benh1.jpg",
    heading: "Tiểu Đường",
    description:
      "Tiểu đường là tình trạng lượng đường trong máu tăng cao kéo dài do rối loạn chuyển hóa insulin. Bệnh có thể dẫn đến biến chứng nghiêm trọng về tim mạch, thận, thần kinh và thị lực nếu không kiểm soát tốt.",
    advice:
      "Hạn chế đường và các loại tinh bột nhanh hấp thụ. Ưu tiên sử dụng rau xanh, ngũ cốc nguyên hạt để duy trì ổn định đường huyết.",
    ingredients: [
      "Chất xơ (từ rau xanh, bí đao)",
      "Protein ít béo (cá hồi, đậu hũ)",
      "Carb phức tạp (yến mạch, gạo lứt)",
      "Chất béo lành mạnh (dầu ô liu)",
    ],
  },
  {
    img: "images/benh2.jpg",
    heading: "Huyết Áp Cao",
    description:
      "Huyết áp cao thường không có triệu chứng rõ rệt nhưng làm tăng nguy cơ đột quỵ và các bệnh tim mạch nghiêm trọng nếu không kiểm soát tốt.",
    advice:
      "Giảm lượng muối trong khẩu phần ăn, tránh chất béo từ mỡ động vật. Thường xuyên tập luyện thể dục để duy trì huyết áp ổn định.",
    ingredients: [
      "Kali (chuối, khoai lang)",
      "Magie (cải bó xôi, hạt chia)",
      "Omega-3 (cá thu, cá hồi)",
      "Chất xơ (đậu nành, cà chua)",
    ],
  },
  {
    img: "images/benh3.jpg",
    heading: "Đột Quỵ",
    description:
      "Đột quỵ xảy ra khi máu không thể lưu thông lên não, gây tổn thương tế bào não, có thể dẫn đến tàn tật hoặc tử vong nếu không được cấp cứu kịp thời.",
    advice:
      "Kiểm soát huyết áp, hạn chế stress, duy trì chế độ ăn uống lành mạnh và tập thể dục đều đặn để phòng ngừa đột quỵ.",
    ingredients: [
      "Omega-3 (cá béo như cá hồi)",
      "Chất chống oxy hóa (quả mọng)",
      "Chất béo không bão hòa (dầu thực vật)",
      "Chất xơ (ngũ cốc nguyên hạt)",
    ],
  },
];

// Modern styles with enhanced layout
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Inter', sans-serif",
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)',
    borderRadius: '1rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: '2rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  section: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2rem',
    background: '#fff',
    borderRadius: '0.75rem',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  textBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    padding: '1rem',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#2d3748',
    borderBottom: '2px solid #2b6cb0',
    paddingBottom: '0.5rem',
  },
  description: {
    fontSize: '1rem',
    color: '#4a5568',
    lineHeight: '1.8',
    padding: '0.5rem 0',
    background: '#f9fafb',
    borderRadius: '0.25rem',
    paddingLeft: '1rem',
  },
  adviceTitle: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: '#2b6cb0',
    marginTop: '1rem',
  },
  advice: {
    fontSize: '1rem',
    color: '#4a5568',
    lineHeight: '1.8',
    padding: '0.5rem',
    background: '#f9fafb',
    borderRadius: '0.25rem',
    borderLeft: '4px solid #2b6cb0',
  },
  ingredientsTitle: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: '#2b6cb0',
  },
  ingredients: {
    fontSize: '1rem',
    color: '#4a5568',
    lineHeight: '1.8',
    padding: '0.5rem',
    background: '#f9fafb',
    borderRadius: '0.25rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  ingredientItem: {
    background: '#edf2f7',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.5rem',
    margin: '0.25rem',
  },
  imageContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '400px',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
  },
  navDot: (isActive) => ({
    width: '12px',
    height: '12px',
    background: isActive ? '#2b6cb0' : '#cbd5e0',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: isActive ? '#2b6cb0' : '#a0aec0',
    },
  }),
  '@media (max-width: 768px)': {
    section: {
      flexDirection: 'column',
      padding: '1.5rem',
    },
    image: {
      maxWidth: '80%',
    },
    title: {
      fontSize: '1.75rem',
    },
    heading: {
      fontSize: '1.5rem',
    },
  },
};

// Animation variants for Framer Motion
const slideVariants = {
  enter: { opacity: 0, x: 100 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

const DiseaseSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Automatic slide transition
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === diseases.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Kiến Thức Bệnh & Dinh Dưỡng</div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          style={styles.section}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
        >
          <div style={styles.textBox}>
            <div style={styles.heading}>{diseases[currentIndex].heading}</div>
            <div style={styles.description}>{diseases[currentIndex].description}</div>
            <div style={styles.adviceTitle}>Lời khuyên dinh dưỡng</div>
            <div style={styles.advice}>{diseases[currentIndex].advice}</div>
            <div style={styles.ingredientsTitle}>Các thành phần nên có trong món ăn</div>
            <div style={styles.ingredients}>
              {diseases[currentIndex].ingredients.map((ingredient, idx) => (
                <span key={idx} style={styles.ingredientItem}>{ingredient}</span>
              ))}
            </div>
          </div>

          <div style={styles.imageContainer}>
            <img
              src={diseases[currentIndex].img}
              alt={diseases[currentIndex].heading}
              style={styles.image}
              onError={() => console.error(`Failed to load image: ${diseases[currentIndex].img}`)}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={styles.navContainer}>
        {diseases.map((_, index) => (
          <div
            key={index}
            style={styles.navDot(index === currentIndex)}
            onClick={() => handleDotClick(index)}
            role="button"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DiseaseSlider;