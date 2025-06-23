import React, { useState, useMemo, useEffect } from 'react';
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
    Spin,
    Alert,
    TimePicker,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined, SearchOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useFoodCategories } from '../../../hooks/queries/useFoodCategories';
import { useFoods } from '../../../hooks/queries/useFoods';
import { useCreateMenu } from '../../../hooks/queries/useMenuQueries';
import environment from '../../../config/environment';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import './CreateFoodsMenu.css';

const { Text, Title } = Typography;

// Constants
const MAX_LARGE_QUANTITY = 999;

// Default category colors for UI enhancement
const CATEGORY_COLORS = {
    'điểm tâm': '#52c41a',
    'món chính': '#1890ff',
    'món khác': '#722ed1',
    'nước giải khát': '#fa541c',
    'tráng miệng': '#eb2f96',
    'món chay': '#13c2c2',
    'default': '#8c8c8c'
};

const CreateFoodsMenu = ({
    open,
    onCancel,
    onSubmit,
    initialValues = {},
    availableDishes = [], // Keep as prop for backward compatibility, but use API data when available
    loading = false,
}) => {
    const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
    const [serviceTime, setServiceTime] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFoodList, setShowFoodList] = useState({});
    const [forceUpdate, setForceUpdate] = useState(0);

    // API hooks
    const createMenuMutation = useCreateMenu();

    // Fetch real categories data from API
    const {
        categories,
        isLoading: categoriesLoading,
        error: categoriesError
    } = useFoodCategories();

    // Fetch real foods data from API
    const {
        foods: apiDishes,
        isLoading: dishesLoading,
        error: dishesError
    } = useFoods();

    // Use API data if available, otherwise fall back to prop data
    const availableDishesData = useMemo(() => {
        if (apiDishes && apiDishes.length > 0) {
            if (environment.features.enableLogging) {
                console.log('🍽️ Using API dishes data:', apiDishes.length, 'items');
                console.log('📋 Sample dish structure:', apiDishes[0]);
            }
            return apiDishes;
        }
        if (availableDishes && availableDishes.length > 0) {
            if (environment.features.enableLogging) {
                console.log('🍽️ Using prop dishes data:', availableDishes.length, 'items');
                console.log('📋 Sample dish structure:', availableDishes[0]);
            }
            return availableDishes;
        }
        return [];
    }, [apiDishes, availableDishes]);

    // Transform backend categories to component format and filter out categories without foods
    const menuCategories = useMemo(() => {
        if (!categories || categories.length === 0) return [];
        if (!availableDishesData || availableDishesData.length === 0) return [];

        return categories
            .sort((a, b) => a.sort - b.sort) // Sort by backend sort field
            .map(category => {
                const normalizedName = category.name.toLowerCase();
                const categoryKey = `category_${category.id}`; // Use backend ID as unique key

                return {
                    key: categoryKey,
                    id: category.id,
                    label: category.name,
                    color: CATEGORY_COLORS[normalizedName] || CATEGORY_COLORS.default,
                    sort: category.sort,
                    imageUrl: category.imageUrl
                };
            })
            .filter(category => {
                // Only include categories that have at least one food
                const categoryId = category.id;
                const foodsInCategory = availableDishesData.filter(dish => dish.categoryId === categoryId);
                return foodsInCategory.length > 0;
            });
    }, [categories, availableDishesData]);

    // Debug log for category-dish mapping (in useEffect to avoid render-time side effects)
    useEffect(() => {
        if (environment.features.enableLogging && categories && availableDishesData.length > 0) {
            console.log('🔗 Category-Dish mapping analysis:');

            // Show all categories from API
            const allCategories = categories || [];
            const categoriesWithFoods = [];
            const categoriesWithoutFoods = [];

            allCategories.forEach(category => {
                const dishesInCategory = availableDishesData.filter(dish => dish.categoryId === category.id);
                if (dishesInCategory.length > 0) {
                    categoriesWithFoods.push({
                        category: category.name,
                        id: category.id,
                        count: dishesInCategory.length,
                        samples: dishesInCategory.slice(0, 3).map(d => d.name)
                    });
                } else {
                    categoriesWithoutFoods.push({
                        category: category.name,
                        id: category.id
                    });
                }
            });

            console.log(`📊 Categories with foods (${categoriesWithFoods.length}):`);
            categoriesWithFoods.forEach(cat => {
                console.log(`  ✅ ${cat.category} (ID: ${cat.id}): ${cat.count} dishes`);
                console.log(`     Sample dishes: ${cat.samples.join(', ')}`);
            });

            if (categoriesWithoutFoods.length > 0) {
                console.log(`🚫 Categories without foods (${categoriesWithoutFoods.length}) - FILTERED OUT:`);
                categoriesWithoutFoods.forEach(cat => {
                    console.log(`  ❌ ${cat.category} (ID: ${cat.id}): 0 dishes`);
                });
            }

            console.log(`📋 Final visible categories: ${menuCategories.length}/${allCategories.length}`);
        }
    }, [categories, menuCategories, availableDishesData]);

    // Handle service time checkbox change
    const handleServiceTimeChange = (e) => {
        const checked = e.target.checked;
        setServiceTime(checked);

        if (!checked) {
            // Clear time fields when service time is disabled
            form.setFieldsValue({
                timeFrom: null,
                timeTo: null
            });
        }

        if (environment.features.enableLogging) {
            console.log('🕐 Service time changed:', checked);
        }
    };

    // Get selected dish IDs for a category
    const getSelectedDishIds = (categoryKey) => {
        const categoryData = form.getFieldValue(categoryKey) || [];
        return categoryData.map((item) => item.dishId).filter(Boolean);
    };

    // Get available dishes for a category - Updated to work with backend categories
    const getAvailableDishesByCategory = (categoryKey) => {
        const selectedIds = getSelectedDishIds(categoryKey);
        const categoryId = categoryKey.replace('category_', ''); // Extract category ID

        return availableDishesData.filter(
            (dish) => dish.categoryId === parseInt(categoryId) && !selectedIds.includes(dish.id)
        );
    };

    // Filter dishes based on search term
    const getFilteredDishes = (dishes) => {
        if (!searchTerm.trim()) return dishes;
        return dishes.filter((dish) =>
            dish.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // Visible categories based on search - categories already filtered to only include those with foods
    const visibleCategories = useMemo(() => {
        if (!menuCategories.length) return [];

        // If no search term, return all categories (which already have foods due to menuCategories filtering)
        if (!searchTerm.trim()) return menuCategories;

        // If searching, only show categories that have foods matching the search term
        return menuCategories.filter((category) => {
            const categoryDishes = getAvailableDishesByCategory(category.key);
            const filteredDishes = getFilteredDishes(categoryDishes);
            return filteredDishes.length > 0;
        });
    }, [searchTerm, menuCategories, availableDishesData]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (environment.features.enableLogging) {
            console.log('🔍 Search term changed:', e.target.value);
        }
    };

    const handleFoodSelect = (categoryKey, dish) => {
        const categoryData = form.getFieldValue(categoryKey) || [];
        const newDish = {
            dishId: dish.id,
            dishName: dish.name,
            quantity: 1,
            guestPrice: dish.priceForGuest || 0,
            patientPrice: dish.priceForPatient || 0,
            staffPrice: dish.priceForStaff || 0,
            discount: 0,
            largeQuantity: false,
        };

        form.setFieldValue(categoryKey, [...categoryData, newDish]);
        setForceUpdate(prev => prev + 1);

        if (environment.features.enableLogging) {
            console.log(`🍽️ Selected dish "${dish.name}" for category ${categoryKey}`);
        }
    };

    const handleFoodRemove = (categoryKey, index) => {
        const categoryData = form.getFieldValue(categoryKey) || [];
        const removedDish = categoryData[index];
        const newCategoryData = categoryData.filter((_, i) => i !== index);

        form.setFieldValue(categoryKey, newCategoryData);
        setForceUpdate(prev => prev + 1);

        if (environment.features.enableLogging) {
            console.log(`🗑️ Removed dish "${removedDish?.dishName}" from category ${categoryKey}`);
        }
    };

    const toggleFoodList = (categoryKey) => {
        setShowFoodList(prev => ({
            ...prev,
            [categoryKey]: !prev[categoryKey]
        }));
    };

    // Transform form data to backend API format
    const transformFormDataToAPI = (formData) => {
        const details = [];

        // Extract details from all categories
        menuCategories.forEach(category => {
            const categoryData = formData[category.key] || [];
            categoryData.forEach(dish => {
                details.push({
                    // id field is not needed for new menu details - backend will generate it
                    foodId: dish.dishId,
                    foodName: dish.dishName,
                    qty: dish.quantity,
                    priceForGuest: dish.guestPrice,
                    priceForPatient: dish.patientPrice,
                    priceForStaff: dish.staffPrice,
                    discountPrice: dish.discount || 0,
                    status: true, // Active by default
                    discountFrom: null, // Backend expects string
                    discountTo: null, // Backend expects string
                    isQty: true // Quantity is enabled by default
                });
            });
        });

        return {
            //date: formData.date ? formData.date.toISOString() : null,
            date: formData.date ? (dayjs.isDayjs(formData.date) ? formData.date.format('YYYY-MM-DD') : dayjs(formData.date).format('YYYY-MM-DD')) : null,
            timeOfDay: 'Menu cho ngày', // Hardcoded value instead of formData.timeOfDay
            isTime: serviceTime,
            timeFrom: serviceTime && formData.timeFrom ? (dayjs.isDayjs(formData.timeFrom) ? formData.timeFrom.format('HH:mm:ss') : dayjs(formData.timeFrom).format('HH:mm:ss')) : null,
            timeTo: serviceTime && formData.timeTo ? (dayjs.isDayjs(formData.timeTo) ? formData.timeTo.format('HH:mm:ss') : dayjs(formData.timeTo).format('HH:mm:ss')) : null,
            name: 'Menu tự động', // Hardcoded value instead of formData.name
            // branchId will be handled automatically by the service using current branch context
            details
        };
    };

    const handleFormSubmit = async (values) => {
        try {
            if (environment.features.enableLogging) {
                console.log('📝 Form data being submitted:', values);
            }

            // Transform form data to API format
            const apiData = transformFormDataToAPI(values);

            if (environment.features.enableLogging) {
                console.log('🔄 Transformed API data:', apiData);
                console.log('📋 Details array:', JSON.stringify(apiData.details, null, 2));
                console.log('📅 Date value:', apiData.date);
                console.log('🕐 Time settings:', {
                    isTime: apiData.isTime,
                    timeFrom: apiData.timeFrom,
                    timeTo: apiData.timeTo
                });
            }

            // Validate that we have at least one menu item
            if (!apiData.details || apiData.details.length === 0) {
                message.error('Vui lòng chọn ít nhất một món ăn cho menu!');
                return;
            }

            // Create menu using the API
            const result = await createMenuMutation.mutateAsync(apiData);

            if (environment.features.enableLogging) {
                console.log('✅ Menu created successfully:', result);
            }

            message.success('Menu đã được tạo thành công!');
            handleCancel();

            // Call parent onSubmit if provided
            // Note: Commented out since we're using real API, not mock functions
            // The parent onSubmit expects form data but we have API result data
            /*
            if (onSubmit) {
                await onSubmit(result);
            }
            */
        } catch (error) {
            console.error('❌ Menu creation failed:', error);
            message.error(`Tạo menu thất bại: ${error.message}`);
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
                                <div className="food-price">
                                    {(dish.priceForGuest || dish.price || 0).toLocaleString()}đ
                                </div>
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
                            const selectedDish = availableDishesData.find(
                                (dish) => dish.id === form.getFieldValue([categoryKey, name, 'dishId'])
                            );

                            if (!selectedDish) return null;

                            return (
                                <div key={key} className="selected-dish-container">
                                    <div className="selected-dish-header">
                                        <Text strong>{selectedDish.name}</Text>
                                        <Text type="secondary"> - {(selectedDish.priceForGuest || selectedDish.price || 0).toLocaleString()}đ</Text>
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

    // Handle API loading and error states
    const hasApiError = categoriesError || dishesError;
    const isApiLoading = categoriesLoading || dishesLoading;

    if (hasApiError) {
        return (
            <ReusableModal
                title="Thêm Menu Thức Ăn"
                open={open}
                onCancel={handleCancel}
                footer={null}
                width={1200}
                destroyOnClose
            >
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={
                        categoriesError?.message ||
                        dishesError?.message ||
                        "Không thể tải dữ liệu từ server. Vui lòng thử lại."
                    }
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => window.location.reload()}>
                            Tải lại
                        </Button>
                    }
                />
            </ReusableModal>
        );
    }

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
            <Spin spinning={isApiLoading} tip={
                isApiLoading ?
                    (categoriesLoading && dishesLoading ? "Đang tải danh mục và món ăn..." :
                        categoriesLoading ? "Đang tải danh mục..." : "Đang tải món ăn...") :
                    "Đang tải..."
            }>
                <ReusableForm
                    form={form}
                    onFinish={handleFormSubmit}
                    initialValues={{
                        date: null,
                        // name: '', // Commented out - using hardcoded value
                        // timeOfDay: '', // Commented out - using hardcoded value
                        serviceTime: false,
                        timeFrom: null,
                        timeTo: null,
                        search: '',
                        ...initialValues,
                    }}
                    className={formLoading || loading || createMenuMutation.isLoading ? 'form-loading' : ''}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Ngày"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                                className="date-picker-field"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="YYYY/MM/DD"
                                    placeholder="Chọn ngày cho menu"
                                />
                            </Form.Item>
                        </Col>
                        {/* Commented out: Tên Menu field - now using hardcoded value
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên Menu"
                                rules={[{ required: true, message: 'Vui lòng nhập tên menu!' }]}
                            >
                                <Input
                                    placeholder="Ví dụ: Menu Chính - Trưa"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        */}
                        <Col span={12}>
                            <Form.Item name="serviceTime" valuePropName="checked" className="service-time-checkbox">
                                <Checkbox
                                    checked={serviceTime}
                                    onChange={handleServiceTimeChange}
                                    style={{ marginTop: '32px' }}
                                >
                                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                    Thời gian phục vụ cụ thể
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Commented out: Mô tả thời gian field - now using hardcoded value
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="timeOfDay"
                                label="Mô tả thời gian"
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả thời gian!' }]}
                            >
                                <Input
                                    placeholder="Ví dụ: Bữa trưa, Bữa tối, Điểm tâm"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="serviceTime" valuePropName="checked" className="service-time-checkbox">
                                <Checkbox
                                    checked={serviceTime}
                                    onChange={handleServiceTimeChange}
                                    style={{ marginTop: '32px' }}
                                >
                                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                    Thời gian phục vụ cụ thể
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                    */}

                    {serviceTime && (
                        <Row gutter={16} style={{ marginBottom: '16px' }}>
                            <Col span={12}>
                                <Form.Item
                                    name="timeFrom"
                                    label="Thời gian bắt đầu"
                                    rules={[
                                        { required: serviceTime, message: 'Vui lòng chọn giờ bắt đầu!' }
                                    ]}
                                >
                                    <TimePicker
                                        style={{ width: '100%' }}
                                        format="HH:mm"
                                        placeholder="Chọn giờ bắt đầu"
                                        showSecond={false}
                                        disabled={!serviceTime}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="timeTo"
                                    label="Thời gian kết thúc"
                                    rules={[
                                        { required: serviceTime, message: 'Vui lòng chọn giờ kết thúc!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const timeFrom = getFieldValue('timeFrom');
                                                if (!timeFrom || !value) {
                                                    return Promise.resolve();
                                                }
                                                if (value.isAfter(timeFrom)) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <TimePicker
                                        style={{ width: '100%' }}
                                        format="HH:mm"
                                        placeholder="Chọn giờ kết thúc"
                                        showSecond={false}
                                        disabled={!serviceTime}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    {serviceTime && (
                        <Alert
                            message="Thời gian phục vụ được bật"
                            description="Menu này sẽ chỉ có thể đặt trong khoảng thời gian bạn đã chọn."
                            type="info"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    )}

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
                        {!searchTerm && categories && categories.length > menuCategories.length && (
                            <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                📊 Hiển thị {menuCategories.length}/{categories.length} danh mục (chỉ danh mục có món ăn)
                            </Text>
                        )}
                    </Form.Item>

                    <Divider />

                    <div className="menu-categories-scroll">
                        {visibleCategories.length === 0 ? (
                            <div className="no-search-results">
                                <Text type="secondary">
                                    {isApiLoading ? "Đang tải dữ liệu..." :
                                        searchTerm ? `Không tìm thấy món ăn nào với từ khóa "${searchTerm}"` :
                                            !categories || categories.length === 0 ? "Không có danh mục nào từ server" :
                                                !availableDishesData.length ? "Không có món ăn nào từ server" :
                                                    !menuCategories.length ? "Tất cả danh mục đều không có món ăn" :
                                                        "Không có danh mục nào"}
                                </Text>
                                {!isApiLoading && categories && categories.length > 0 && !menuCategories.length && (
                                    <Text type="secondary" style={{ fontSize: '11px', marginTop: '8px', display: 'block' }}>
                                        💡 Chỉ hiển thị danh mục có món ăn. Vui lòng thêm món ăn vào các danh mục trống.
                                    </Text>
                                )}
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
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={formLoading || loading || createMenuMutation.isLoading}
                                size="large"
                            >
                                {createMenuMutation.isLoading ? 'Đang tạo menu...' : 'Lưu Menu'}
                            </Button>
                        </Space>
                    </Form.Item>
                </ReusableForm>
            </Spin>
        </ReusableModal>
    );
};

CreateFoodsMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    initialValues: PropTypes.object,
    // availableDishes is now optional - component will use API data when available
    availableDishes: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            price: PropTypes.number,
            priceForGuest: PropTypes.number,
            priceForPatient: PropTypes.number,
            priceForStaff: PropTypes.number,
        })
    ),
    loading: PropTypes.bool,
};

export default CreateFoodsMenu;