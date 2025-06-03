import React from 'react';
import { Button, Space, message, Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CreateFoodsMenu from '../features/CreateFoodsMenu';
import { useAntModal } from '../../hooks/useAntModal';

const { Title, Paragraph } = Typography;

/**
 * Example component demonstrating the enhanced CreateFoodsMenu
 * This shows the complete integration with improved food selection and search
 */
const CreateFoodsMenuExample = () => {
    const { open, showModal, handleCancel } = useAntModal();

    // Enhanced mock data for available dishes
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

    const handleSubmit = async (formData) => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Enhanced Menu data submitted:', formData);

                // Count total selected dishes
                const totalDishes = Object.keys(formData)
                    .filter(key => !['date', 'serviceTime', 'search'].includes(key))
                    .reduce((total, categoryKey) => {
                        return total + (formData[categoryKey]?.length || 0);
                    }, 0);

                // Here you would typically send data to your API
                // Example:
                // await menuService.createMenu(formData);

                message.success(`Menu đã được tạo thành công với ${totalDishes} món ăn!`);
                resolve();
            }, 1500);
        });
    };

    const handleError = (error) => {
        console.error('Error creating menu:', error);
        message.error('Có lỗi xảy ra khi tạo menu!');
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>🍽️ Enhanced Food Menu Creator</Title>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Title level={4}>🚀 Major Enhancements:</Title>
                    <ul>
                        <li><strong>🎯 Improved Food Selection:</strong> Click "Thêm" to see all available foods in that category</li>
                        <li><strong>🚫 Duplicate Prevention:</strong> Selected foods are removed from the list to avoid duplicates</li>
                        <li><strong>↩️ Smart Restoration:</strong> When you remove a food, it returns to the available list</li>
                        <li><strong>🔍 Enhanced Search:</strong> Search filters categories and shows only relevant ones</li>
                        <li><strong>📱 Compact Configuration:</strong> All pricing options in one clean row</li>
                        <li><strong>📊 Visual Indicators:</strong> Shows count of selected items per category</li>
                        <li><strong>🎨 Better UX:</strong> Smooth animations and hover effects</li>
                    </ul>
                </Card>

                <Card>
                    <Title level={4}>📋 How to Use the Enhanced Version:</Title>
                    <ol>
                        <li><strong>📅 Select Date:</strong> Choose the date for your menu</li>
                        <li><strong>⏰ Service Time:</strong> Optionally enable service time tracking</li>
                        <li><strong>🔍 Smart Search:</strong> Use the search box to find specific foods (try "bánh", "cơm", "nước")</li>
                        <li><strong>➕ Add Foods:</strong> Click "Thêm" in any category to see available foods</li>
                        <li><strong>🎯 Select Items:</strong> Click on any food to add it to your menu</li>
                        <li><strong>⚙️ Configure:</strong> Set quantities, prices for different customer types, and discounts</li>
                        <li><strong>❌ Remove Items:</strong> Use the "Xóa" button to remove unwanted items</li>
                        <li><strong>💾 Save Menu:</strong> Submit your complete menu configuration</li>
                    </ol>
                </Card>

                <Card>
                    <Title level={4}>🔍 Search Examples:</Title>
                    <Paragraph>
                        Try these search terms to see the smart filtering in action:
                    </Paragraph>
                    <ul>
                        <li><strong>"bánh"</strong> - Shows breakfast and dessert categories</li>
                        <li><strong>"cơm"</strong> - Shows main dishes and vegetarian categories</li>
                        <li><strong>"nước"</strong> - Shows only beverages category</li>
                        <li><strong>"chay"</strong> - Shows only vegetarian category</li>
                        <li><strong>"bún"</strong> - Shows main dishes and vegetarian categories</li>
                    </ul>
                </Card>

                <Card>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showModal}
                        size="large"
                        style={{
                            width: '250px',
                            height: '60px',
                            fontSize: '18px',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                        }}
                    >
                        Tạo Menu Mới
                    </Button>
                    <Paragraph style={{ marginTop: '8px', color: '#666' }}>
                        Click to experience the enhanced menu creation flow
                    </Paragraph>
                </Card>

                <CreateFoodsMenu
                    open={open}
                    onCancel={handleCancel}
                    onSubmit={handleSubmit}
                    availableDishes={mockDishes}
                    initialValues={{
                        serviceTime: false,
                    }}
                />

                <Card>
                    <Title level={4}>🛠️ Enhanced Component Props:</Title>
                    <ul>
                        <li><strong>open:</strong> Boolean to control modal visibility</li>
                        <li><strong>onCancel:</strong> Function called when modal is cancelled</li>
                        <li><strong>onSubmit:</strong> Function called when form is submitted</li>
                        <li><strong>availableDishes:</strong> Array of available dishes with categories</li>
                        <li><strong>initialValues:</strong> Initial form values (optional)</li>
                        <li><strong>loading:</strong> Boolean to show loading state (optional)</li>
                    </ul>
                </Card>

                <Card>
                    <Title level={4}>📊 Enhanced Data Structure:</Title>
                    <Paragraph>
                        Each selected dish now includes compact configuration in a single row:
                    </Paragraph>
                    <pre style={{
                        background: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        overflow: 'auto'
                    }}>
                        {`{
  date: "2024-01-15",
  serviceTime: true,
  breakfast: [
    {
      dishId: 1,
      quantity: 2,
      largeQuantity: true,
      guestPrice: 25000,     // Set for guests
      patientPrice: 20000,   // Auto-calculated 20% discount
      staffPrice: 20000,     // Auto-calculated 20% discount
      discount: 2000,        // Additional discount
      autoDiscount: false,
      maxDiscount: 5000
    }
  ],
  mainDish: [
    {
      dishId: 10,
      quantity: 1,
      largeQuantity: false,
      guestPrice: 55000,
      patientPrice: 44000,
      staffPrice: 44000,
      discount: 0,
      autoDiscount: true,
      maxDiscount: 10000
    }
  ]
  // ... other categories
}`}
                    </pre>
                </Card>

                <Card>
                    <Title level={4}>✨ Key Features:</Title>
                    <ul>
                        <li><strong>🎯 Smart Selection:</strong> No duplicate foods, automatic list management</li>
                        <li><strong>🔍 Intelligent Search:</strong> Category filtering based on search results</li>
                        <li><strong>💰 Auto-pricing:</strong> Smart price calculations with discounts</li>
                        <li><strong>📱 Compact Layout:</strong> All options in a single efficient row</li>
                        <li><strong>📊 Visual Feedback:</strong> Clear indicators and smooth animations</li>
                        <li><strong>🚀 Better Performance:</strong> Optimized rendering and state management</li>
                        <li><strong>♿ Accessibility:</strong> Better keyboard navigation and screen reader support</li>
                    </ul>
                </Card>

                <Card>
                    <Title level={4}>🧪 Testing Scenarios:</Title>
                    <ol>
                        <li><strong>Search Test:</strong> Try different search terms to see category filtering</li>
                        <li><strong>Selection Test:</strong> Add multiple items and verify no duplicates appear</li>
                        <li><strong>Removal Test:</strong> Remove items and check they return to available list</li>
                        <li><strong>Pricing Test:</strong> Check auto-calculated prices and discounts</li>
                        <li><strong>Responsive Test:</strong> Try on different screen sizes</li>
                    </ol>
                </Card>
            </Space>
        </div>
    );
};

export default CreateFoodsMenuExample; 