import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined, MenuOutlined, CalendarOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import MenuTable from './MenuTable';
import CreateFoodsMenu from './CreateFoodsMenu';
import { useAntModal } from '../../../hooks/useAntModal';

/**
 * Example: Refactoring the Menu page to use PageWrapper HOC
 * This shows how to convert the existing Menu page structure to use the HOC
 */

// Step 1: Extract the main content into a separate component
const MenuPageContent = ({
    menuData,
    loading,
    onView,
    onEdit,
    onDelete,
    modalProps,
    availableDishes,
    onCreateMenu
}) => {
    return (
        <>
            {/* Menu Table - this is now the main content */}
            <MenuTable
                dataSource={menuData}
                loading={loading}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            {/* Create Menu Modal */}
            <CreateFoodsMenu
                open={modalProps.open}
                onCancel={modalProps.handleCancel}
                onSubmit={onCreateMenu}
                availableDishes={availableDishes}
                initialValues={{
                    serviceTime: false,
                }}
            />
        </>
    );
};

// Step 2: Wrap the content component with PageWrapper HOC
const MenuPageWithWrapper = withPageWrapper(MenuPageContent);

// Step 3: Create the main container component
const MenuWithWrapperExample = () => {
    const { open, showModal, handleCancel } = useAntModal();
    const [loading, setLoading] = useState(false);
    const [menuData, setMenuData] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Mock menu data - same as original
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
        // ... more data
    ];

    // Mock dishes data
    const mockDishes = [
        { id: 1, name: 'Bánh mì thịt nướng', category: 'breakfast', price: 25000 },
        { id: 2, name: 'Phở bò tái', category: 'breakfast', price: 45000 },
        { id: 10, name: 'Cơm sườn nướng', category: 'mainDish', price: 55000 },
        { id: 11, name: 'Cơm gà teriyaki', category: 'mainDish', price: 60000 },
        // ... more dishes
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
                    handleCancel(); // Close modal
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
    };

    const handleEdit = (record) => {
        message.info(`Chỉnh sửa menu ngày ${record.date}`);
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
        <MenuPageWithWrapper
            // Page header configuration
            pageTitle="Quản Lý Thực Đơn"
            pageDescription="Tạo và quản lý thực đơn hằng ngày một cách dễ dàng và hiệu quả"
            pageIcon="🍽️"
            loading={loading}

            // Primary action button
            primaryButton={{
                text: 'Thêm Menu Mới',
                icon: <PlusOutlined />,
                onClick: showModal
            }}

            // Refresh functionality
            onRefresh={handleRefresh}
            refreshText="Làm mới"

            // Statistics cards (optional - can be enabled)
            // showStatistics={true}
            // statistics={[
            //     {
            //         title: 'Tổng số menu',
            //         value: totalMenus,
            //         icon: <MenuOutlined />,
            //         color: '#1890ff'
            //     },
            //     {
            //         title: 'Có thời gian phục vụ',
            //         value: menusWithService,
            //         icon: <CalendarOutlined />,
            //         color: '#52c41a'
            //     },
            //     {
            //         title: 'Không có thời gian phục vụ',
            //         value: menusWithoutService,
            //         icon: <CalendarOutlined />,
            //         color: '#fa8c16'
            //     }
            // ]}

            // Props passed to the wrapped component
            menuData={menuData}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            modalProps={{ open, handleCancel }}
            availableDishes={mockDishes}
            onCreateMenu={handleCreateMenu}
        />
    );
};

export default MenuWithWrapperExample;

/**
 * Benefits of using PageWrapper HOC:
 * 
 * 1. **Consistent UI**: Same header layout across all admin pages
 * 2. **Reduced Code**: No need to repeat header structure
 * 3. **Maintainability**: Changes to header layout affect all pages
 * 4. **Flexibility**: Easy to add/remove statistics, buttons, etc.
 * 5. **Responsive**: Built-in responsive design
 * 
 * Comparison:
 * 
 * Before (Original Menu page):
 * - 348 lines of code
 * - Manual header structure
 * - Hardcoded styling
 * - Statistics section commented out
 * 
 * After (With PageWrapper):
 * - ~180 lines of actual logic
 * - Declarative header configuration
 * - Consistent styling from HOC
 * - Easy statistics toggle
 * 
 * Migration steps:
 * 1. Extract content into separate component
 * 2. Wrap with PageWrapper HOC
 * 3. Move header elements to props
 * 4. Configure statistics if needed
 * 5. Remove manual header JSX
 */ 