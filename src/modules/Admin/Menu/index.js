import React, { useState, useEffect } from 'react'
import { Typography, Space, Button, message, Card } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import MenuTable from '../../../components/features/MenuTable'
import CreateFoodsMenu from '../../../components/features/CreateFoodsMenu'
import { useAntModal } from '../../../hooks/useAntModal'

const { Title } = Typography;

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

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Page Header */}
                <Card>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div>
                            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                                🍽️ Quản Lý Thực Đơn
                            </Title>
                            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                                Tạo và quản lý thực đơn hằng ngày
                            </p>
                        </div>

                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                style={{ height: '40px' }}
                            >
                                Làm mới
                            </Button>

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={showModal}
                                style={{
                                    height: '40px',
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                                }}
                            >
                                Thêm Menu Mới
                            </Button>
                        </Space>
                    </div>
                </Card>

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