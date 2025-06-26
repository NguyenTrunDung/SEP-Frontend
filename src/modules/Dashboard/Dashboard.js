import React from 'react';
import { Card, Row, Col, Statistic, DatePicker, Typography } from 'antd';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const { Title } = Typography;

const Dashboard = () => {
    const labels = [
        '01/06', '02/06', '03/06', '04/06', '05/06', '06/06',
        '07/06', '08/06', '09/06', '10/06', '11/06', '12/06', '13/06',
        '14/06', '15/06', '16/06', '17/06', '18/06', '19/06',
        '20/06', '21/06', '22/06', '23/06', '24/06', '25/06',
    ];

    const orderData = {
        labels,
        datasets: [
            {
                label: 'Đơn hàng',
                data: [1, 1, 0, 1, 0, 2, 0, 0, 2, 2, 1, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#FFD700',
                barPercentage: 0.5,
                borderRadius: 10,
            },
        ],
    };

    const revenueData = {
        labels,
        datasets: [
            {
                label: 'Doanh thu',
                data: [0, 0, 0, 0, 0, 200000, 0, 0, 210000, 210000, 180000, 300000, 480000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#FFD700',
                barPercentage: 0.5,
                borderRadius: 10,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: 10,
                ticks: {
                    stepSize: 1,
                    color: '#000',
                },
                grid: {
                    drawBorder: true,
                    color: (context) => {
                        // Hiện chỉ dòng ở giá trị lớn nhất (ở trên cùng)
                        return context.tick.value === 10 ? '#e0e0e0' : 'transparent';
                    },
                },
            },
            x: {
                ticks: { color: '#666' },
            },
        },
    };
    // Thêm đúng chartOptionsRevenue
    const chartOptionsRevenue = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
            },
        },
    };



    return (
        <div style={{ padding: 24 }}>
            <Row gutter={12} style={{ marginBottom: 16 }}>
                <Col>
                    <DatePicker defaultValue={null} placeholder="06/01/2025" />
                </Col>
                <Col>
                    <DatePicker defaultValue={null} placeholder="06/25/2025" />
                </Col>
            </Row>

            <Row gutter={[16, 16]} justify="center">
                <Col xs={24} sm={8}>
                    <Card
                        style={{
                            background: '#ff4d4f',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 90,
                        }}
                    >
                        <Statistic
                            title={
                                <span style={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                                    Số đơn hàng
                                </span>
                            }
                            value={22}
                            valueStyle={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        style={{
                            background: '#0d9494',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 90,
                        }}
                    >
                        <Statistic
                            title={
                                <span style={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                                    Doanh thu
                                </span>
                            }
                            value={1589200}
                            valueStyle={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        style={{
                            background: '#00CC66',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 90,
                        }}
                    >
                        <Statistic
                            title={
                                <span style={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                                    Số món ăn bán được
                                </span>
                            }
                            value={57}
                            valueStyle={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>



            <div style={{ marginTop: 32 }}>
                <Title level={4} style={{ marginBottom: 16, fontSize: 34 }}>Đơn hàng</Title>
                <Bar data={orderData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: 10 } } }} />
                <p style={{ textAlign: 'center', marginTop: 12, fontStyle: 'italic', color: '#666' }}>
                    Biểu đồ số đơn hàng trong ngày
                </p>
            </div>

            <div style={{ marginTop: 32 }}>
                <Title level={4} style={{ marginBottom: 16, fontSize: 34 }}>Doanh thu</Title>
                <Bar data={revenueData} options={chartOptionsRevenue} />
                <p style={{ textAlign: 'center', marginTop: 12, fontStyle: 'italic', color: '#666' }}>
                    Biểu đồ doanh thu trong ngày
                </p>
            </div>

        </div>
    );
};

export default Dashboard;
