// src/components/examples/RealOrderIntegrationTest.js
import React, { useState } from 'react';
import { Button, Card, Space, Typography, Input, Alert, Tag, Spin } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, CookingOutlined } from '@ant-design/icons';
import { useCreateOrder, useSearchOrders, useChefOrders, useUpdateOrderStatus } from '../../hooks/queries/userOrderQueries';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

/**
 * Test component demonstrating real order API integration
 */
const RealOrderIntegrationTest = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('create');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedBranch] = useState({ id: 1, name: 'Chi nhánh test' });

    const createOrderMutation = useCreateOrder();
    const { data: searchResults, isLoading: searchLoading, error: searchError } = useSearchOrders(searchKeyword, {
        enabled: !!searchKeyword && searchKeyword.length >= 2
    });
    const { data: chefOrders, isLoading: chefLoading, error: chefError } = useChefOrders(selectedBranch?.id, {
        enabled: activeTab === 'kitchen'
    });
    const updateStatusMutation = useUpdateOrderStatus();

    const sampleCartItems = [
        {
            FoodId: 1,
            dishName: 'Cơm gà luộc',
            price: 25000,
            quantity: 2,
            note: 'Không cay'
        },
        {
            FoodId: 2,
            dishName: 'Phở bò',
            price: 30000,
            quantity: 1,
            note: 'Thêm rau'
        }
    ];

    const handleCreateTestOrder = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để test');
            return;
        }

        const orderData = {
            userId: user.id,
            customerName: 'Nguyễn Test',
            customerPhone: '0123456789',
            customerAddress: 'Khoa Nội - Phòng Test',
            receiveMethod: 'Giao tận nơi',
            receiveTime: '30 phút',
            paymentMethod: 'Tiền mặt',
            note: 'Đơn hàng test API',
            includeUtensils: true,
            total: 65000,
            shippingFee: 5000,
            cartItems: sampleCartItems
        };

        try {
            await createOrderMutation.mutateAsync({
                orderData,
                branchId: selectedBranch.id
            });
        } catch (error) {
            console.error('Test failed:', error);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <Title level={2}>Real Order API Integration Test</Title>

            <div style={{ marginBottom: 16 }}>
                <Button.Group>
                    <Button
                        type={activeTab === 'create' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('create')}
                    >
                        Tạo Đơn Hàng
                    </Button>
                    <Button
                        type={activeTab === 'search' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('search')}
                    >
                        Tìm Kiếm
                    </Button>
                    <Button
                        type={activeTab === 'kitchen' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('kitchen')}
                    >
                        Quản Lý Bếp
                    </Button>
                </Button.Group>
            </div>

            {activeTab === 'create' && (
                <Card title="Test Order Creation">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>Test với cart items mẫu</Text>
                        <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={handleCreateTestOrder}
                            loading={createOrderMutation.isPending}
                        >
                            Test Tạo Đơn Hàng
                        </Button>
                    </Space>
                </Card>
            )}

            {activeTab === 'search' && (
                <Card title="Test Order Search">
                    <Input
                        placeholder="Nhập từ khóa tìm kiếm"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        prefix={<SearchOutlined />}
                    />
                    {searchLoading && <Spin />}
                    {searchResults?.data && (
                        <div style={{ marginTop: 16 }}>
                            <Text>Tìm thấy {searchResults.data.length} đơn hàng</Text>
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'kitchen' && (
                <Card title="Test Kitchen Management">
                    {chefLoading && <Spin />}
                    {chefOrders?.data && (
                        <Text>Có {chefOrders.data.length} đơn hàng trong bếp</Text>
                    )}
                </Card>
            )}
        </div>
    );
};

export default RealOrderIntegrationTest; 