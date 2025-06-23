import React, { useState, useEffect } from 'react'
import { message } from 'antd'
import { PlusOutlined, MenuOutlined, CalendarOutlined } from '@ant-design/icons'
import withPageWrapper from '../../../components/common/PageWrapper'
import MenuTable from './MenuTable'
import CreateFoodsMenu from './CreateFoodsMenu'
import { useAntModal } from '../../../hooks/useAntModal'
import dayjs from 'dayjs'

// Step 1: Extract the main content into a separate component
const MenuPageContent = ({
    menuData,
    loading,
    onView,
    onEdit,
    onDelete,
    modalProps,
    onCreateMenu
}) => {
    return (
        <>
            {/* Menu Table */}
            <MenuTable
                dataSource={menuData}
                loading={loading}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            {/* Create Menu Modal - Now uses API data internally */}
            <CreateFoodsMenu
                open={modalProps.open}
                onCancel={modalProps.handleCancel}
                onSubmit={onCreateMenu}
                initialValues={{
                    serviceTime: false,
                }}
            />
        </>
    );
};

// Step 2: Wrap the content component with PageWrapper HOC
const MenuPageWithWrapper = withPageWrapper(MenuPageContent);

// Step 3: Main Menu component using the PageWrapper
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

    // Note: Mock dishes data removed - CreateFoodsMenu now uses real API data via useFoods hook

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
                        date: formData.date ? (dayjs.isDayjs(formData.date) ? formData.date.format('DD/MM/YYYY') : dayjs(formData.date).format('DD/MM/YYYY')) : null,
                        serviceTime: formData.serviceTime || false,
                        startTime: formData.serviceTime ? '07:00:00' : null,
                        endTime: formData.serviceTime ? '22:00:00' : null,
                    };
                    console.log("formData: ", formData);

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

    // Calculate statistics for optional use
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

            // Statistics cards (optional - can be enabled by uncommenting)
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
            onCreateMenu={handleCreateMenu}
        />
    );
}

export default Menu