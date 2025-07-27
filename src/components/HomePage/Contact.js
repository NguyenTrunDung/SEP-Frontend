import React from 'react';
import { Row, Col, Typography, ConfigProvider } from 'antd';

const { Title, Paragraph, Text } = Typography;

const reasons = [
  {
    icon: 'https://img.icons8.com/color/96/000000/pineapple.png',
    title: 'Nguồn thực phẩm tươi, sạch',
    description: 'Thực phẩm chọn lọc kỹ càng, cam kết không sử dụng các hoá chất nhằm mục đích lợi nhuận',
  },
  {
    icon: 'https://img.icons8.com/color/96/000000/fish.png',
    title: 'Đặc trưng hương vị miền tây',
    description: 'Món ăn chế biến khẩu vị đậm đà, đặc trưng hương vị Miền Tây vừa miệng nhiều thực khách',
  },
  {
    icon: 'https://img.icons8.com/color/96/000000/salad.png',
    title: 'Thực đơn đổi mới mỗi ngày',
    description: 'Thực đơn mới mỗi ngày, thường xuyên có các món mới lạ, không gây cảm giác gây ngán ăn',
  },
  {
    icon: 'https://img.icons8.com/color/96/000000/clock.png',
    title: 'Giao nhanh chóng, đúng giờ',
    description: 'Cố gắng giao thức ăn đến tay khách hàng nhanh nhất, đúng giờ và đảm bảo chất lượng',
  },
  {
    icon: 'https://img.icons8.com/color/96/000000/restaurant.png',
    title: 'Phần cơm đầy đủ chất dinh dưỡng',
    description: 'Mỗi phần cơm gồm có: cơm, món mặn, canh, rau xào, trộn,... đảm bảo cân bằng dinh dưỡng',
  },
  {
    icon: 'https://img.icons8.com/color/96/000000/info.png',
    title: 'Luôn lắng nghe khách hàng',
    description: 'Đội ngũ HOMMS luôn lắng nghe mọi ý kiến từ khách hàng để cải thiện dịch vụ',
  },
];

const ReasonSection = () => {
  return (
    <ConfigProvider theme={{ token: { fontFamily: 'inherit' } }}>
      <div style={{padding: '40px 20px', marginTop: '60px' }}>
        <Title level={3} style={{ textAlign: 'center', color: '#2e2e2e' }}>
          Vì sao chọn HOMMS?
        </Title>
        <Paragraph style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto', color: '#333' }}>
          Đến với HOMMS, bạn không cần bận tâm các vấn đề về sinh an toàn thực phẩm.
          Với nguyên tắc “Cái đầu đặt lên hàng đầu”, thức ăn từ khâu chọn lọc đến khâu chế biến đều
          được đội ngũ bếp chăm chút kỹ lưỡng !
        </Paragraph>

        <Row gutter={[32, 32]} justify="center" style={{ marginTop: 40 }}>
          {reasons.map((item, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: '#1f3a5f',
                    margin: '0 auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src={item.icon} alt={item.title} style={{ width: 48, height: 48 }} />
                </div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {item.title}
                </Text>
                <Paragraph style={{ fontSize: 14, color: '#333' }}>{item.description}</Paragraph>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default ReasonSection;
