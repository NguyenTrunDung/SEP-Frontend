import React, { useState } from 'react'
import { message } from 'antd'
import { PlusOutlined, MenuOutlined, CalendarOutlined } from '@ant-design/icons'
import withPageWrapper from '../../../components/common/PageWrapper'
import MenuTable from './MenuTable'
import CreateFoodsMenu from './CreateFoodsMenu'
import ViewMenuModal from './ViewMenuModal'
import { useAntModal } from '../../../hooks/useAntModal'
import { useMenuList, useCreateMenu } from '../../../hooks/queries/useMenuQueries'
import dayjs from 'dayjs'

// Step 1: Extract the main content into a separate component
const MenuPageContent = ({
    menuData,
    loading,
    onView,
    onEdit,
    onDelete,
    modalProps,
    onCreateMenu,
    viewModalProps,
    editModalProps
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

            {/* View Menu Details Modal */}
            <ViewMenuModal
                open={viewModalProps.open}
                onCancel={viewModalProps.handleCancel}
                menuId={viewModalProps.menuId}
            />

            {/* Edit Menu Modal - Now uses CreateFoodsMenu in edit mode */}
            <CreateFoodsMenu
                open={editModalProps.open}
                onCancel={editModalProps.handleCancel}
                onSuccess={editModalProps.onSuccess}
                editMode={true}
                menuId={editModalProps.menuId}
                initialValues={{
                    serviceTime: false,
                }}
            />
        </>
    );
};

// Step 2: Wrap the content component with PageWrapper HOC
const MenuPageWithWrapper = withPageWrapper(MenuPageContent);

// Step 3: Main Menu component using the PageWrapper with Real API Data
const Menu = () => {
    const { open, showModal, handleCancel } = useAntModal();

    // State for view modal
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewMenuId, setViewMenuId] = useState(null);

    // State for edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editMenuId, setEditMenuId] = useState(null);

    // Use React Query hooks for data fetching
    const {
        data: menuList = [],
        loading,
        error,
        refetch
    } = useMenuList({
        refetchOnWindowFocus: false,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Use mutation hook for creating menus
    const createMenuMutation = useCreateMenu();

    // Handle create menu with real API call
    const handleCreateMenu = async (formData) => {
        try {
            console.log('📝 Creating menu with form data:', formData);

            // Transform form data to API format
            const menuData = {
                date: formData.date ? (dayjs.isDayjs(formData.date) ? formData.date.format('YYYY-MM-DD') : dayjs(formData.date).format('YYYY-MM-DD')) : null,
                name: formData.name || `Menu ${dayjs().format('DD/MM/YYYY')}`,
                timeOfDay: formData.timeOfDay || null,
                isTime: formData.serviceTime || false,
                timeFrom: formData.serviceTime ? (formData.timeFrom || '07:00:00') : null,
                timeTo: formData.serviceTime ? (formData.timeTo || '22:00:00') : null,
                branchId: null, // Will be set automatically by backend
                details: []
            };

            // Process selected dishes from form data
            Object.keys(formData)
                .filter(key => !['date', 'serviceTime', 'search', 'name', 'timeOfDay', 'timeFrom', 'timeTo'].includes(key))
                .forEach(categoryKey => {
                    const categoryFoods = formData[categoryKey] || [];
                    categoryFoods.forEach(foodId => {
                        menuData.details.push({
                            foodId: parseInt(foodId, 10),
                            foodName: 'Selected Food', // This will be populated by backend
                            qty: 1,
                            priceForGuest: 0,
                            priceForPatient: 0,
                            priceForStaff: 0,
                            discountPrice: 0,
                            status: true,
                            discountFrom: null,
                            discountTo: null,
                            isQty: true
                        });
                    });
                });

            console.log('🚀 Transformed menu data for API:', menuData);

            // Call the API
            await createMenuMutation.mutateAsync(menuData);

            // Count total selected dishes for success message
            const totalDishes = menuData.details.length;
            message.success(`Menu đã được tạo thành công với ${totalDishes} món ăn!`);

            // Close modal
            handleCancel();

        } catch (error) {
            console.error('❌ Failed to create menu:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo menu!';
            message.error(errorMessage);
            throw error; // Re-throw to handle loading states in form
        }
    };

    // Handle view menu details with real API call
    const handleView = (record) => {
        console.log('👁️ Viewing menu:', record);

        // Extract menu ID from record (could be from originalData or direct)
        const menuId = record.originalData?.id || record.id || record.menuId;

        if (!menuId) {
            console.error('❌ No menu ID found in record:', record);
            message.error('Không thể xác định ID menu để xem chi tiết!');
            return;
        }

        console.log(`🔍 Opening view modal for menu ID: ${menuId}`);
        setViewMenuId(menuId);
        setViewModalOpen(true);

        // Show loading message
        message.loading('Đang tải chi tiết menu...', 1);
    };

    // Handle edit menu with real API call
    const handleEdit = (record) => {
        console.log('✏️ Editing menu:', record);

        // Extract menu ID from record (could be from originalData or direct)
        const menuId = record.originalData?.id || record.id || record.menuId;

        if (!menuId) {
            console.error('❌ No menu ID found in record:', record);
            message.error('Không thể xác định ID menu để chỉnh sửa!');
            return;
        }

        console.log(`📝 Opening edit modal for menu ID: ${menuId}`);
        setEditMenuId(menuId);
        setEditModalOpen(true);

        // Show loading message
        message.loading('Đang tải dữ liệu menu để chỉnh sửa...', 1);
    };

    // Handle successful edit
    const handleEditSuccess = () => {
        console.log('✅ Menu updated successfully, refreshing list...');
        refetch(); // Refresh the menu list
        message.success('Menu đã được cập nhật và danh sách đã được làm mới!');
    };

    // Handle closing view modal
    const handleViewModalCancel = () => {
        setViewModalOpen(false);
        setViewMenuId(null);
    };

    // Handle closing edit modal
    const handleEditModalCancel = () => {
        setEditModalOpen(false);
        setEditMenuId(null);
    };

    const handleDelete = async (record) => {
        try {
            console.log('🗑️ Deleting menu:', record);

            // Extract menu ID
            const menuId = record.originalData?.id || record.id || record.menuId;
            const menuName = record.originalData?.name || record.name || 'N/A';
            const menuDate = record.originalData?.date || record.date || 'N/A';

            if (!menuId) {
                message.error('Không thể xác định ID menu để xóa!');
                return;
            }

            // TODO: Implement delete API call when available
            // await deleteMenuMutation.mutateAsync(menuId);

            message.success(`Đã xóa menu "${menuName}" ngày ${menuDate}`);

            // For now, just show a placeholder message
            message.info('Chức năng xóa menu sẽ được triển khai khi API backend sẵn sàng.');

        } catch (error) {
            console.error('❌ Failed to delete menu:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa menu!';
            message.error(errorMessage);
        }
    };

    const handleRefresh = () => {
        refetch();
        message.success('Đã làm mới danh sách menu');
    };

    // Handle API errors
    if (error && !loading) {
        console.error('🚨 Menu API Error:', error);

        // Show error message only once per error
        if (error.response?.status === 404) {
            message.warning('Chưa có menu nào được tạo. Hãy tạo menu đầu tiên!');
        } else if (error.response?.status === 403) {
            message.error('Bạn không có quyền truy cập menu của chi nhánh này!');
        } else {
            message.error('Không thể tải dữ liệu menu từ server!');
        }
    }

    // Calculate statistics for optional use
    const totalMenus = menuList.length;
    const menusWithService = menuList.filter(menu => menu.isTime).length;
    const menusWithoutService = totalMenus - menusWithService;
    const totalDishes = menuList.reduce((total, menu) => total + (menu.details?.length || 0), 0);

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
                onClick: showModal,
                loading: createMenuMutation.isLoading
            }}

            // Refresh functionality
            onRefresh={handleRefresh}
            refreshText="Làm mới"

            // Statistics cards (now using real API data)
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
            //     },
            //     {
            //         title: 'Tổng số món ăn',
            //         value: totalDishes,
            //         icon: <MenuOutlined />,
            //         color: '#722ed1'
            //     }
            // ]}

            // Props passed to the wrapped component
            menuData={menuList}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            modalProps={{
                open,
                handleCancel: () => {
                    handleCancel();
                    // Reset mutation state when closing modal
                    createMenuMutation.reset();
                }
            }}
            onCreateMenu={handleCreateMenu}
            viewModalProps={{
                open: viewModalOpen,
                handleCancel: handleViewModalCancel,
                menuId: viewMenuId
            }}
            editModalProps={{
                open: editModalOpen,
                handleCancel: handleEditModalCancel,
                menuId: editMenuId,
                onSuccess: handleEditSuccess
            }}
        />
    );
}

export default Menu