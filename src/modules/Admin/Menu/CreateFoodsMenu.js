import React, { useState, useMemo } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Checkbox,
    Button,
    Space,
    Row,
    Col,
    Divider,
    InputNumber,
    List,
    Typography,
    message,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined, SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import PropTypes from 'prop-types';
import './CreateFoodsMenu.css';

// Removed Cloudinary upload widget - keeping it simple

const { Text } = Typography;

// Constants
const MAX_LARGE_QUANTITY = 999;

const CreateFoodsMenu = ({
    open,
    onCancel,
    onSubmit,
    initialValues = {},
    availableDishes = [],
    loading = false,
}) => {
    const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
    const [serviceTime, setServiceTime] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFoodList, setShowFoodList] = useState({});
    const [forceUpdate, setForceUpdate] = useState(0);

    // Menu categories
    const menuCategories = [
        { key: 'breakfast', label: 'Điểm tâm', color: '#52c41a' },
        { key: 'mainDish', label: 'Món chính', color: '#1890ff' },
        { key: 'otherDish', label: 'Món Khác', color: '#722ed1' },
        { key: 'beverages', label: 'Nước giải khát', color: '#fa541c' },
        { key: 'dessert', label: 'Tráng miệng', color: '#eb2f96' },
        { key: 'vegetarian', label: 'Món Chay', color: '#13c2c2' },
    ];

    // Get selected dish IDs for a category
    const getSelectedDishIds = (categoryKey) => {
        const categoryData = form.getFieldValue(categoryKey) || [];
        return categoryData.map((item) => item.dishId).filter(Boolean);
    };

    // Get available dishes for a category
    const getAvailableDishesByCategory = (categoryKey) => {
        const selectedIds = getSelectedDishIds(categoryKey);
        return availableDishes.filter(
            (dish) => dish.category === categoryKey && !selectedIds.includes(dish.id)
        );
    };

    // Filter dishes based on search term
    const getFilteredDishes = (dishes) => {
        if (!searchTerm.trim()) return dishes;
        return dishes.filter((dish) =>
            dish.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // Visible categories based on search
    const visibleCategories = useMemo(() => {
        if (!searchTerm.trim()) return menuCategories;
        return menuCategories.filter((category) => {
            const categoryDishes = getAvailableDishesByCategory(category.key);
            const filteredDishes = getFilteredDishes(categoryDishes);
            return filteredDishes.length > 0;
        });
    }, [searchTerm, availableDishes]);

    // Handle search input
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            setShowFoodList({});
        }
    };

    // Handle food selection
    const handleFoodSelect = (categoryKey, dish) => {
        const currentValues = form.getFieldsValue();
        const categoryData = currentValues[categoryKey] || [];

        const newItem = {
            dishId: dish.id,
            quantity: 1,
            largeQuantity: false,
            guestPrice: dish.price || 0,
            patientPrice: Math.round((dish.price || 0) * 0.8),
            staffPrice: Math.round((dish.price || 0) * 0.8),
            discount: 0,
            autoDiscount: false,
            maxDiscount: 0
        };

        console.log(`Dish added to ${categoryKey}:`, newItem);

        form.setFieldsValue({
            ...currentValues,
            [categoryKey]: [...categoryData, newItem],
        });

        setShowFoodList((prev) => ({
            ...prev,
            [categoryKey]: false,
        }));

        message.success(`Đã thêm ${dish.name} vào menu`);
    };

    // Handle food removal
    const handleFoodRemove = (categoryKey, index) => {
        const currentValues = form.getFieldsValue();
        const categoryData = currentValues[categoryKey] || [];
        const removedItem = categoryData[index];

        form.setFieldsValue({
            ...currentValues,
            [categoryKey]: categoryData.filter((_, i) => i !== index),
        });

        if (removedItem && removedItem.dishId) {
            const removedDish = availableDishes.find((dish) => dish.id === removedItem.dishId);
            if (removedDish) {
                message.info(`Đã xóa ${removedDish.name} khỏi menu`);
            }
        }
    };

    // Removed image upload functionality - keeping it simple

    // Toggle food list visibility
    const toggleFoodList = (categoryKey) => {
        setShowFoodList((prev) => ({
            ...prev,
            [categoryKey]: !prev[categoryKey],
        }));
    };

    const handleFormSubmit = async (values) => {
        console.log('Form data being submitted:', values);
        const result = await handleSubmit(async (formData) => {
            console.log('Processed form data:', formData);
            if (onSubmit) {
                await onSubmit(formData);
            }
        });

        if (result.success) {
            message.success('Menu đã được tạo thành công!');
            console.log('Menu creation successful, form data:', values);
            handleCancel();
        } else {
            console.error('Menu creation failed:', result.error);
        }
    };

    const handleCancel = () => {
        resetForm();
        setServiceTime(false);
        setSearchTerm('');
        setShowFoodList({});
        if (onCancel) {
            onCancel();
        }
    };

    // Render compact dish configuration
    const renderCompactDishConfig = (categoryKey, name, restField, selectedDish) => {
        const isLargeQuantity = form.getFieldValue([categoryKey, name, 'largeQuantity']) || false;
        const currentQuantity = form.getFieldValue([categoryKey, name, 'quantity']) || 1;
        console.log(`Rendering dish ${selectedDish.name} in ${categoryKey}[${name}] - isLargeQuantity: ${isLargeQuantity}, quantity: ${currentQuantity}`);

        // Handle large quantity change
        const handleLargeQuantityChange = (e) => {
            const checked = e.target.checked;

            // Update the largeQuantity field directly
            form.setFieldValue([categoryKey, name, 'largeQuantity'], checked);

            // Update the quantity field based on the checkbox state
            const newQuantity = checked ? MAX_LARGE_QUANTITY : 1;
            form.setFieldValue([categoryKey, name, 'quantity'], newQuantity);

            // Force re-render to update UI
            setForceUpdate(prev => prev + 1);

            console.log(`Large quantity ${checked ? 'enabled' : 'disabled'} for ${selectedDish.name}, quantity set to: ${newQuantity}`);
        };

        return (
            <div className="dish-config-compact" key={`${categoryKey}-${name}-${forceUpdate}`}>
                <Row gutter={[8, 8]} align="middle">
                    <Col span={4}>
                        <Form.Item
                            {...restField}
                            name={[name, 'quantity']}
                            rules={[{ required: true, message: 'Số lượng!' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber
                                min={1}
                                max={MAX_LARGE_QUANTITY}
                                placeholder="1"
                                size="small"
                                style={{
                                    width: '100%',
                                    backgroundColor: isLargeQuantity ? '#f5f5f5' : undefined,
                                    borderColor: isLargeQuantity ? '#d9d9d9' : undefined
                                }}
                                disabled={isLargeQuantity}
                            />
                        </Form.Item>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            {isLargeQuantity ? 'Số lượng (Max)' : 'Số lượng'}
                        </Text>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            {...restField}
                            name={[name, 'guestPrice']}
                            rules={[{ required: true, message: 'Giá khách!' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber
                                min={0}
                                placeholder="25,000"
                                size="small"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                style={{ width: '100%' }}
                                addonAfter="đ"
                            />
                        </Form.Item>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Giá cho Khách
                        </Text>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            {...restField}
                            name={[name, 'patientPrice']}
                            rules={[{ required: true, message: 'Giá BN!' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber
                                min={0}
                                placeholder="20,000"
                                size="small"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                style={{ width: '100%' }}
                                addonAfter="đ"
                            />
                        </Form.Item>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Giá cho Bệnh Nhân
                        </Text>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            {...restField}
                            name={[name, 'staffPrice']}
                            rules={[{ required: true, message: 'Giá NV!' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber
                                min={0}
                                placeholder="20,000"
                                size="small"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                style={{ width: '100%' }}
                                addonAfter="đ"
                            />
                        </Form.Item>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Giá cho Nhân Viên
                        </Text>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            {...restField}
                            name={[name, 'discount']}
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber
                                min={0}
                                placeholder="0"
                                size="small"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                style={{ width: '100%' }}
                                addonAfter="đ"
                            />
                        </Form.Item>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Giảm giá
                        </Text>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            {...restField}
                            name={[name, 'largeQuantity']}
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                        >
                            <Checkbox
                                size="small"
                                onChange={handleLargeQuantityChange}
                            >
                                <span style={{
                                    color: isLargeQuantity ? '#1890ff' : undefined,
                                    fontWeight: isLargeQuantity ? '500' : undefined
                                }}>
                                    {isLargeQuantity && <ThunderboltOutlined style={{ marginRight: '4px' }} />}
                                    Số lượng nhiều
                                </span>
                            </Checkbox>
                        </Form.Item>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            {isLargeQuantity ? `Max: ${MAX_LARGE_QUANTITY}` : 'Tùy chọn'}
                        </Text>
                    </Col>

                    <Col span={4}>
                        <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            size="small"
                            onClick={() => handleFoodRemove(categoryKey, name)}
                            style={{ width: '100%' }}
                            title="Xóa món ăn"
                        >
                            Xóa
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    };

    // Render food list for category
    const renderFoodList = (categoryKey, categoryLabel) => {
        const availableDishesForCategory = getAvailableDishesByCategory(categoryKey);
        const filteredDishes = getFilteredDishes(availableDishesForCategory);

        if (filteredDishes.length === 0) {
            return (
                <div className="empty-food-list">
                    <Text type="secondary">
                        {searchTerm ? 'Không tìm thấy món ăn phù hợp' : `Không có ${categoryLabel.toLowerCase()} nào khả dụng`}
                    </Text>
                </div>
            );
        }

        return (
            <div className="food-list-container">
                <List
                    size="small"
                    dataSource={filteredDishes}
                    renderItem={(dish) => (
                        <List.Item className="food-list-item" onClick={() => handleFoodSelect(categoryKey, dish)}>
                            <div className="food-item-content">
                                <div className="food-name">{dish.name}</div>
                                <div className="food-price">{dish.price?.toLocaleString()}đ</div>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        );
    };

    const renderDishSelector = (categoryKey, categoryLabel, categoryColor) => {
        const selectedDishesData = form.getFieldValue(categoryKey) || [];
        const isShowingFoodList = showFoodList[categoryKey];

        return (
            <Form.List name={categoryKey} key={categoryKey}>
                {(fields, { add, remove }) => (
                    <div className="menu-category-section">
                        <div className={`menu-category-header ${categoryKey}`}>
                            <span className="menu-category-title">
                                {categoryLabel}
                                {selectedDishesData.length > 0 && (
                                    <span className="selected-count">({selectedDishesData.length})</span>
                                )}
                            </span>
                            <Button
                                type="dashed"
                                onClick={() => toggleFoodList(categoryKey)}
                                icon={<PlusOutlined />}
                                size="middle"
                                className="menu-category-add-btn"
                            >
                                {isShowingFoodList ? 'Ẩn' : 'Thêm'}
                            </Button>
                        </div>

                        {isShowingFoodList && renderFoodList(categoryKey, categoryLabel)}

                        {fields.map(({ key, name, ...restField }) => {
                            const selectedDish = availableDishes.find(
                                (dish) => dish.id === form.getFieldValue([categoryKey, name, 'dishId'])
                            );

                            if (!selectedDish) return null;

                            return (
                                <div key={key} className="selected-dish-container">
                                    <div className="selected-dish-header">
                                        <Text strong>{selectedDish.name}</Text>
                                        <Text type="secondary"> - {selectedDish.price?.toLocaleString()}đ</Text>
                                    </div>

                                    <Form.Item
                                        {...restField}
                                        name={[name, 'dishId']}
                                        style={{ display: 'none' }}
                                    >
                                        <Input />
                                    </Form.Item>

                                    {renderCompactDishConfig(categoryKey, name, restField, selectedDish)}
                                </div>
                            );
                        })}

                        {fields.length === 0 && !isShowingFoodList && (
                            <div className="empty-category">
                                <div className="empty-category-icon">🍽️</div>
                                <p className="empty-category-text">
                                    Chưa có {categoryLabel.toLowerCase()} nào được chọn
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Form.List>
        );
    };

    return (
        <ReusableModal
            title="Thêm Menu Thức Ăn"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={1200}
            destroyOnClose
            style={{ top: 20 }}
            className="create-foods-menu"
        >
            <ReusableForm
                form={form}
                onFinish={handleFormSubmit}
                initialValues={{
                    date: null,
                    serviceTime: false,
                    search: '',
                    ...initialValues,
                }}
                className={formLoading || loading ? 'form-loading' : ''}
            >
                <Form.Item
                    name="date"
                    label="Ngày"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                    className="date-picker-field"
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày cho menu"
                    />
                </Form.Item>

                <Form.Item name="serviceTime" valuePropName="checked" className="service-time-checkbox">
                    <Checkbox checked={serviceTime} onChange={(e) => setServiceTime(e.target.checked)}>
                        Thời gian phục vụ
                    </Checkbox>
                </Form.Item>

                <Form.Item label="Chọn món ăn" className="dish-search-input">
                    <Input
                        placeholder="Tìm kiếm món ăn theo tên... (ví dụ: bánh)"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        prefix={<SearchOutlined />}
                        allowClear
                        onClear={() => setSearchTerm('')}
                        style={{ width: '100%' }}
                    />
                    {searchTerm && (
                        <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            Đang tìm kiếm: "{searchTerm}" - Hiển thị {visibleCategories.length}/{menuCategories.length} danh mục
                        </Text>
                    )}
                </Form.Item>

                <Divider />

                <div className="menu-categories-scroll">
                    {visibleCategories.length === 0 ? (
                        <div className="no-search-results">
                            <Text type="secondary">
                                Không tìm thấy món ăn nào với từ khóa "{searchTerm}"
                            </Text>
                        </div>
                    ) : (
                        visibleCategories.map((category, index) => (
                            <div key={category.key}>
                                {renderDishSelector(category.key, category.label, category.color)}
                                {index !== visibleCategories.length - 1 && <Divider style={{ margin: '24px 0' }} />}
                            </div>
                        ))
                    )}
                </div>

                <Form.Item className="form-actions">
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCancel} size="large">
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={formLoading || loading} size="large">
                            Lưu Menu
                        </Button>
                    </Space>
                </Form.Item>
            </ReusableForm>
        </ReusableModal>
    );
};

CreateFoodsMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    initialValues: PropTypes.object,
    availableDishes: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            category: PropTypes.string.isRequired,
            price: PropTypes.number,
        })
    ),
    loading: PropTypes.bool,
};

export default CreateFoodsMenu;