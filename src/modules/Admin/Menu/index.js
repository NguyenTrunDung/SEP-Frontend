import React, { useState, useEffect } from 'react'
import { Typography, Space, Button, message, Card, Row, Col, Statistic } from 'antd'
import { PlusOutlined, ReloadOutlined, MenuOutlined, CalendarOutlined } from '@ant-design/icons'
import MenuTable from './MenuTable'
import CreateFoodsMenu from './CreateFoodsMenu'
import { useAntModal } from '../../../hooks/useAntModal'

const { Title, Paragraph } = Typography;

const Menu = () => {
    const { open, showModal, handleCancel } = useAntModal();
    const [loading, setLoading] = useState(false);
    const [menuData, setMenuData] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Mock menu data - replace with actual API calls
    const mockMenuData = [
        {
            id: 1,
            date: '02/06/2025',
            serviceTime: false,
            startTime: null,
            endTime: null,
        },
        {
            id: 2,
            date: '30/05/2025',
            serviceTime: false,
            startTime: null,
            endTime: null,
        },
        {
            id: 3,
            date: '29/05/2025',
            serviceTime: false,
            startTime: null,
            endTime: null,
        },
        {
            id: 4,
            date: '27/05/2025',
            serviceTime: false,
            startTime: null,
            endTime: null,
        },
        {
            id: 5,
            date: '26/05/2025',
            serviceTime: true,
            startTime: '17:30:00',
            endTime: '22:30:00',
        },
        {
            id: 6,
            date: '07/05/2025',
            serviceTime: false,
            startTime: null,
            endTime: null,
        },
        {
            id: 7,
            date: '06/05/2025',
            serviceTime: false,
            startTime: null,
            endTime: null,
        },
        {
            id: 8,
            date: '05/05/2025',
            serviceTime: false,
            startTime: null,
            endTime: null,
        },
        {
            id: 9,
            date: '09/05/2025',
            serviceTime: false,
            startTime: null,
            endTime: null,
        },
        {
            id: 10,
            date: '08/05/2025',
            serviceTime: false,
            startTime: null,
            endTime: null,
        },
    ];

    // Mock dishes data for the create modal
    const mockDishes = [
        // Breakfast items
        { id: 1, name: 'Bánh mì thịt nướng', category: 'breakfast', price: 25000 },
        { id: 2, name: 'Phở bò tái', category: 'breakfast', price: 45000 },
        { id: 3, name: 'Cháo gà', category: 'breakfast', price: 30000 },
        { id: 4, name: 'Bánh cuốn', category: 'breakfast', price: 35000 },
        { id: 5, name: 'Xôi gà', category: 'breakfast', price: 20000 },
        { id: 6, name: 'Bánh bao', category: 'breakfast', price: 15000 },
        { id: 7, name: 'Bánh chưng', category: 'breakfast', price: 18000 },

        // Main dishes
        { id: 10, name: 'Cơm sườn nướng', category: 'mainDish', price: 55000 },
        { id: 11, name: 'Cơm gà teriyaki', category: 'mainDish', price: 60000 },
        { id: 12, name: 'Bún bò Huế', category: 'mainDish', price: 50000 },
        { id: 13, name: 'Mì Quảng', category: 'mainDish', price: 48000 },
        { id: 14, name: 'Cơm chiên hải sản', category: 'mainDish', price: 65000 },
        { id: 15, name: 'Cơm tấm', category: 'mainDish', price: 42000 },
        { id: 16, name: 'Bún chả', category: 'mainDish', price: 38000 },

        // Other dishes
        { id: 20, name: 'Nem rán', category: 'otherDish', price: 35000 },
        { id: 21, name: 'Gỏi cuốn', category: 'otherDish', price: 25000 },
        { id: 22, name: 'Chả cá Lã Vọng', category: 'otherDish', price: 40000 },
        { id: 23, name: 'Bánh xèo', category: 'otherDish', price: 30000 },
        { id: 24, name: 'Bánh tráng nướng', category: 'otherDish', price: 22000 },

        // Beverages
        { id: 30, name: 'Nước cam tươi', category: 'beverages', price: 15000 },
        { id: 31, name: 'Trà đá', category: 'beverages', price: 10000 },
        { id: 32, name: 'Cà phê sữa đá', category: 'beverages', price: 20000 },
        { id: 33, name: 'Nước dừa', category: 'beverages', price: 18000 },
        { id: 34, name: 'Sinh tố bơ', category: 'beverages', price: 25000 },
        { id: 35, name: 'Nước chanh', category: 'beverages', price: 12000 },

        // Desserts
        { id: 40, name: 'Chè ba màu', category: 'dessert', price: 20000 },
        { id: 41, name: 'Bánh flan', category: 'dessert', price: 25000 },
        { id: 42, name: 'Kem dừa', category: 'dessert', price: 22000 },
        { id: 43, name: 'Chè đậu xanh', category: 'dessert', price: 18000 },
        { id: 44, name: 'Bánh chuối', category: 'dessert', price: 16000 },

        // Vegetarian
        { id: 50, name: 'Cơm chiên chay', category: 'vegetarian', price: 45000 },
        { id: 51, name: 'Bún riêu chay', category: 'vegetarian', price: 40000 },
        { id: 52, name: 'Đậu hũ sốt cà chua', category: 'vegetarian', price: 35000 },
        { id: 53, name: 'Mì xào chay', category: 'vegetarian', price: 38000 },
        { id: 54, name: 'Bánh mì chay', category: 'vegetarian', price: 22000 },
    ];

    // Load menu data
    useEffect(() => {
        fetchMenuData();
    }, [refreshTrigger]);

    const fetchMenuData = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            setMenuData(mockMenuData);
        } catch (error) {
            message.error('Không thể tải dữ liệu menu!');
        } finally {
            setLoading(false);
        }
    };

    // Handle create menu
    const handleCreateMenu = async (formData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Simulate API call to create menu
                    const newMenu = {
                        id: Date.now(),
                        date: formData.date.format('DD/MM/YYYY'),
                        serviceTime: formData.serviceTime || false,
                        startTime: formData.serviceTime ? '07:00:00' : null,
                        endTime: formData.serviceTime ? '22:00:00' : null,
                    };

                    // Count total selected dishes
                    const totalDishes = Object.keys(formData)
                        .filter(key => !['date', 'serviceTime', 'search'].includes(key))
                        .reduce((total, categoryKey) => {
                            return total + (formData[categoryKey]?.length || 0);
                        }, 0);

                    // Add to menu data
                    setMenuData(prevData => [newMenu, ...prevData]);

                    message.success(`Menu đã được tạo thành công với ${totalDishes} món ăn!`);
                    setRefreshTrigger(prev => prev + 1);
                    resolve();
                } catch (error) {
                    message.error('Có lỗi xảy ra khi tạo menu!');
                    reject(error);
                }
            }, 1500);
        });
    };

    // Handle table actions
    const handleView = (record) => {
        message.info(`Xem chi tiết menu ngày ${record.date}`);
        // Navigate to menu details page or open detail modal
    };

    const handleEdit = (record) => {
        message.info(`Chỉnh sửa menu ngày ${record.date}`);
        // Open edit modal with menu data
    };

    const handleDelete = (record) => {
        setMenuData(prevData => prevData.filter(item => item.id !== record.id));
        message.success(`Đã xóa menu ngày ${record.date}`);
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        message.success('Đã làm mới danh sách menu');
    };

    // Calculate statistics
    const totalMenus = menuData.length;
    const menusWithService = menuData.filter(menu => menu.serviceTime).length;
    const menusWithoutService = totalMenus - menusWithService;

    return (
        <div style={{
            padding: '32px',
            maxWidth: '1600px',
            margin: '0 auto',
            background: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Simple Page Header */}
                <Card style={{ borderRadius: '12px' }}>
                    <Row justify="space-between" align="middle" gutter={[24, 24]}>
                        <Col xs={24} lg={12}>
                            <div>
                                <Title level={1} style={{
                                    margin: 0,
                                    fontSize: '2.2rem',
                                    fontWeight: '600',
                                    color: '#262626'
                                }}>
                                    🍽️ Quản Lý Thực Đơn
                                </Title>
                                <Paragraph style={{
                                    margin: '12px 0 0 0',
                                    fontSize: '1.1rem',
                                    color: '#595959'
                                }}>
                                    Tạo và quản lý thực đơn hằng ngày một cách dễ dàng và hiệu quả
                                </Paragraph>
                            </div>
                        </Col>

                        <Col xs={24} lg={12}>
                            <div style={{ textAlign: 'right' }}>
                                <Space size="large" wrap>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleRefresh}
                                        style={{
                                            height: '48px',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            borderRadius: '8px',
                                            padding: '0 24px'
                                        }}
                                        loading={loading}
                                    >
                                        Làm mới
                                    </Button>

                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={showModal}
                                        style={{
                                            height: '48px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            padding: '0 32px'
                                        }}
                                    >
                                        Thêm Menu Mới
                                    </Button>
                                </Space>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Simple Statistics Cards */}
                {/* <Row gutter={[24, 24]}>
                    <Col xs={24} sm={8}>
                        <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                            <Statistic
                                title={<span style={{ fontSize: '16px', fontWeight: '500' }}>Tổng số menu</span>}
                                value={totalMenus}
                                prefix={<MenuOutlined />}
                                valueStyle={{ fontSize: '2rem', fontWeight: '700' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={8}>
                        <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                            <Statistic
                                title={<span style={{ fontSize: '16px', fontWeight: '500' }}>Có thời gian phục vụ</span>}
                                value={menusWithService}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ fontSize: '2rem', fontWeight: '700' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={8}>
                        <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                            <Statistic
                                title={<span style={{ fontSize: '16px', fontWeight: '500' }}>Không có thời gian phục vụ</span>}
                                value={menusWithoutService}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ fontSize: '2rem', fontWeight: '700' }}
                            />
                        </Card>
                    </Col>
                </Row> */}

                {/* Menu Table */}
                <MenuTable
                    dataSource={menuData}
                    loading={loading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {/* Create Menu Modal */}
                <CreateFoodsMenu
                    open={open}
                    onCancel={handleCancel}
                    onSubmit={handleCreateMenu}
                    availableDishes={mockDishes}
                    initialValues={{
                        serviceTime: false,
                    }}
                />
            </Space>
        </div>
    );
}

export default Menu