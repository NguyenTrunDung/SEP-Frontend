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
import { PlusOutlined, MinusCircleOutlined, SearchOutlined, ThunderboltOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useFoodCategories } from '../../../hooks/queries/useFoodCategories';
import { useFoods } from '../../../hooks/queries/useFoods';
import { useCreateMenu, useMenu, useUpdateMenu } from '../../../hooks/queries/useMenuQueries';
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
    availableDishes = [],
    loading = false,
    editMode = false,
    menuId = null,
    onSuccess = null,
}) => {
    const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
    const [serviceTime, setServiceTime] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFoodList, setShowFoodList] = useState({});
    const [forceUpdate, setForceUpdate] = useState(0);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [checkedDishes, setCheckedDishes] = useState({}); // Track checked dishes

    // API hooks
    const createMenuMutation = useCreateMenu();
    const updateMenuMutation = useUpdateMenu();

    // Fetch existing menu data when in edit mode
    const {
        data: existingMenuData,
        loading: menuLoading,
        error: menuError
    } = useMenu(menuId, {
        enabled: editMode && !!menuId && open,
    });

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

    const toggleCategory = (categoryKey) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryKey]: !prev[categoryKey],
        }));
        if (!expandedCategories[categoryKey]) {
            setShowFoodList((prev) => ({
                ...prev,
                [categoryKey]: true,
            }));
        } else {
            setShowFoodList((prev) => ({
                ...prev,
                [categoryKey]: false,
            }));
        }
    };

    const toggleFoodList = (categoryKey) => {
        setShowFoodList((prev) => ({
            ...prev,
            [categoryKey]: !prev[categoryKey],
        }));
    };

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
            .sort((a, b) => a.sort - b.sort)
            .map(category => {
                const normalizedName = category.name.toLowerCase();
                const categoryKey = `category_${category.id}`;

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
                const categoryId = category.id;
                const foodsInCategory = availableDishesData.filter(dish => dish.categoryId === categoryId);
                return foodsInCategory.length > 0;
            });
    }, [categories, availableDishesData]);

    // Load existing menu data when in edit mode
    useEffect(() => {
        if (editMode && existingMenuData && !isDataLoaded && open && !categoriesLoading && !dishesLoading) {
            if (environment.features.enableLogging) {
                console.log('📝 Loading existing menu data for editing:', existingMenuData);
            }

            const basicValues = {
                date: existingMenuData.date ? dayjs(existingMenuData.date) : null,
                name: existingMenuData.name || '',
                timeOfDay: existingMenuData.timeOfDay || '',
            };

            const hasServiceTime = existingMenuData.isTime;
            setServiceTime(hasServiceTime);

            if (hasServiceTime) {
                basicValues.timeFrom = existingMenuData.timeFrom ? dayjs(existingMenuData.timeFrom, 'HH:mm:ss') : null;
                basicValues.timeTo = existingMenuData.timeTo ? dayjs(existingMenuData.timeTo, 'HH:mm:ss') : null;
                basicValues.serviceTime = true;
            }

            const menuDetails = existingMenuData.details || [];
            const categorizedData = {};

            if (availableDishesData && availableDishesData.length > 0) {
                menuDetails.forEach(detail => {
                    const foodItem = availableDishesData.find(food => food.id === detail.foodId);
                    if (foodItem) {
                        const categoryKey = `category_${foodItem.categoryId}`;
                        if (!categorizedData[categoryKey]) {
                            categorizedData[categoryKey] = [];
                        }
                        const formDetail = {
                            dishId: detail.foodId,
                            dishName: detail.foodName || foodItem.name,
                            quantity: detail.qty || 1,
                            guestPrice: detail.priceForGuest || 0,
                            patientPrice: detail.priceForPatient || 0,
                            staffPrice: detail.priceForStaff || 0,
                            discount: detail.discountPrice || 0,
                            largeQuantity: detail.qty >= MAX_LARGE_QUANTITY,
                            _originalDetailId: detail.id,
                        };
                        categorizedData[categoryKey].push(formDetail);
                        // Set checked state for existing dishes
                        setCheckedDishes(prev => ({
                            ...prev,
                            [`${categoryKey}_${detail.foodId}`]: true,
                        }));
                    }
                });
            }

            const allFormValues = {
                ...basicValues,
                ...categorizedData
            };

            form.setFieldsValue(allFormValues);
            setIsDataLoaded(true);

            if (environment.features.enableLogging) {
                console.log('✅ Form populated with existing menu data:', {
                    basicValues,
                    categorizedItems: Object.keys(categorizedData).reduce((acc, key) => {
                        acc[key] = categorizedData[key].length;
                        return acc;
                    }, {}),
                    totalItems: menuDetails.length,
                    availableDishesCount: availableDishesData?.length || 0
                });
            }
        }
    }, [editMode, existingMenuData, availableDishesData, form, isDataLoaded, open, categoriesLoading, dishesLoading]);

    useEffect(() => {
        if (!open || !editMode) {
            setIsDataLoaded(false);
            setCheckedDishes({}); // Reset checked dishes when closing
        }
    }, [open, editMode]);

    useEffect(() => {
        if (environment.features.enableLogging && categories && availableDishesData.length > 0) {
            console.log('🔗 Category-Dish mapping analysis:');
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

    const handleServiceTimeChange = (e) => {
        const checked = e.target.checked;
        setServiceTime(checked);
        if (!checked) {
            form.setFieldsValue({
                timeFrom: null,
                timeTo: null
            });
        }
    };

    const getSelectedDishIds = (categoryKey) => {
        const categoryData = form.getFieldValue(categoryKey) || [];
        return categoryData.map((item) => item.dishId).filter(Boolean);
    };

    const getAvailableDishesByCategory = (categoryKey) => {
        const selectedIds = getSelectedDishIds(categoryKey);
        const categoryId = categoryKey.replace('category_', '');
        return availableDishesData.filter(
            (dish) => dish.categoryId === parseInt(categoryId) && !selectedIds.includes(dish.id)
        );
    };

    const getFilteredDishes = (dishes) => {
        if (!searchTerm.trim()) return dishes;
        return dishes.filter((dish) =>
            dish.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const visibleCategories = useMemo(() => {
        if (!menuCategories.length) return [];
        if (!searchTerm.trim()) return menuCategories;
        return menuCategories.filter((category) => {
            const categoryDishes = getAvailableDishesByCategory(category.key);
            const filteredDishes = getFilteredDishes(categoryDishes);
            return filteredDishes.length > 0;
        });
    }, [searchTerm, menuCategories, availableDishesData]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
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
    };

    const handleFoodRemove = (categoryKey, dishId) => {
        const categoryData = form.getFieldValue(categoryKey) || [];
        const newCategoryData = categoryData.filter(item => item.dishId !== dishId);

        form.setFieldValue(categoryKey, newCategoryData);
        setForceUpdate(prev => prev + 1);
        setCheckedDishes(prev => {
            const key = `${categoryKey}_${dishId}`;
            const newChecked = { ...prev };
            delete newChecked[key];
            return newChecked;
        });
    };

    const renderFoodList = (categoryKey, categoryLabel) => {
        const availableDishesForCategory = getAvailableDishesByCategory(categoryKey);
        const filteredDishes = getFilteredDishes(availableDishesForCategory);

        if (filteredDishes.length === 0) {
            return (
                <div className="empty-food-list">
                    <Text type="secondary">
                        {searchTerm
                            ? 'Không tìm thấy món ăn phù hợp'
                            : `Không có ${categoryLabel.toLowerCase()} nào khả dụng`}
                    </Text>
                </div>
            );
        }

        return (
            <div className="food-list-container">
                {filteredDishes.map((dish) => {
                    const dishKey = `${categoryKey}_${dish.id}`;
                    const isChecked = !!checkedDishes[dishKey];

                    const handleCheckboxChange = (e) => {
                        const checked = e.target.checked;
                        if (checked) {
                            handleFoodSelect(categoryKey, dish);
                            setCheckedDishes(prev => ({
                                ...prev,
                                [dishKey]: true
                            }));
                        } else {
                            handleFoodRemove(categoryKey, dish.id);
                        }
                    };

                    return (
                        <div
                            key={dish.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid #f0f0f0',
                                cursor: 'pointer',
                            }}
                        >
                            <Checkbox
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                                style={{ marginRight: 8 }}
                            />
                            <span style={{ flex: 1 }}>{dish.name}</span>
                            {isChecked && renderCompactDishConfig(categoryKey, dish.id, {}, dish, isChecked)}
                        </div>
                    );
                })}
            </div>
        );
    };


    const renderDishSelector = (categoryKey, categoryLabel, categoryColor) => {
        const isShowingFoodList = showFoodList[categoryKey];

        return (
            <Form.List name={categoryKey}>
                {(fields, { add, remove }) => (
                    <div>
                        {fields.map(({ key, name, ...restField }) => {
                            const dishId = form.getFieldValue([categoryKey, name, 'dishId']);
                            const selectedDish = availableDishesData.find((d) => d.id === dishId);
                            if (!selectedDish) return null;

                            return (
                                <div
                                    key={key}
                                    style={{
                                      
                                        flexDirection: 'column',
                                        marginBottom: 12,
                                        paddingBottom: 12,
                                        borderBottom: '1px solid #f0f0f0',
                                    }}
                                >

                                    {/* PHẦN TÊN MÓN ĂN */}
                                    <div style={{ alignItems: 'center', marginBottom: 4 }}>
                                        <Checkbox
                                            checked={true}
                                            onChange={(e) => {
                                                if (!e.target.checked) {
                                                    handleFoodRemove(categoryKey, dishId);
                                                }
                                            }}
                                            style={{ marginRight: 8 }}
                                        />
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{selectedDish.name}</span>
                                    </div>

                                    {/* HIDDEN INPUTS */}
                                    <Form.Item {...restField} name={[name, 'dishId']} style={{ display: 'none' }}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'dishName']} style={{ display: 'none' }}>
                                        <Input />
                                    </Form.Item>

                                    {/* ✅ PHẦN CONFIG NẰM DƯỚI */}
                                    <div style={{ marginLeft: 24 }}>
                                        {renderCompactDishConfig(categoryKey, name, restField, selectedDish, true)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Form.List>

        );
    };
    const renderCompactDishConfig = (categoryKey, name, restField, selectedDish, isChecked) => {
        if (!isChecked) return null;

        const isLargeQuantity = form.getFieldValue([categoryKey, name, 'largeQuantity']) || false;
        const currentQuantity = form.getFieldValue([categoryKey, name, 'quantity']) || 1;

        const currentDiscount = form.getFieldValue([categoryKey, name, 'discount']) || 0;
        const hasDiscount = currentDiscount > 0;




        const handleLargeQuantityChange = (e) => {
            const checked = e.target.checked;
            form.setFieldValue([categoryKey, name, 'largeQuantity'], checked);
            const newQuantity = checked ? MAX_LARGE_QUANTITY : 1;
            form.setFieldValue([categoryKey, name, 'quantity'], newQuantity);
            setForceUpdate(prev => prev + 1);
        };

        return (
            <div className="dish-config-compact" key={`${categoryKey}-${name}-${forceUpdate}`} style={{ marginTop: 8, padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                <Row gutter={[8, 8]} wrap={false} align="bottom">
                    <Col flex="none">
                        <Form.Item
                            {...restField}
                            name={[name, 'largeQuantity']}
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                        >
                            <Checkbox size="small" onChange={handleLargeQuantityChange}>
                                <span style={{
                                    color: isLargeQuantity ? '#1890ff' : undefined,
                                    fontWeight: isLargeQuantity ? '500' : undefined
                                }}>
                                    {isLargeQuantity && <ThunderboltOutlined style={{ marginRight: '4px' }} />}
                                    Số lượng nhiều
                                </span>
                            </Checkbox>
                        </Form.Item>
                    </Col>

                    {[
                        { label: 'Số lượng', name: 'quantity', disabled: isLargeQuantity },
                        { label: 'Giá cho Khách', name: 'guestPrice' },
                        { label: 'Giá cho Bệnh Nhân', name: 'patientPrice' },
                        { label: 'Giá cho Nhân Viên', name: 'staffPrice' },
                        { label: 'Giảm giá', name: 'discount', onChange: () => setForceUpdate(prev => prev + 1) },
                        {
                            label: 'Giảm giá từ', name: 'discountFrom', isTime: true, disabled: !hasDiscount,
                            style: { opacity: hasDiscount ? 1 : 0.4 }
                        },
                        {
                            label: 'Giảm giá tới', name: 'discountTo', isTime: true, disabled: !hasDiscount,
                            style: { opacity: hasDiscount ? 1 : 0.4 }
                        }
                    ].map(({ label, name: fieldName, disabled, onChange, isTime, style = {} }) => (
                        <Col key={fieldName} style={{ flex: '1 1 0', ...style }}>
                            <div className="custom-floating">
                                <Form.Item
                                    {...restField}
                                    name={[name, fieldName]}
                                    style={{ marginBottom: 0 }}
                                >
                                    {isTime ? (
                                        <TimePicker
                                            use12Hours
                                            format="hh:mm A"
                                            showSecond={false}
                                            placeholder="--:-- --"
                                            disabled={disabled}
                                            style={{ width: '100%', height: 35 }}
                                            suffixIcon={<ClockCircleOutlined style={{ fontSize: 18 }} />}
                                        />
                                    ) : (
                                        <InputNumber
                                            min={0}
                                            disabled={disabled}
                                            placeholder=""
                                            size="large"
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            onChange={onChange}
                                            style={{ width: '100%' }}
                                        />
                                    )}
                                </Form.Item>
                                <label className="floating-label">{label}</label>
                            </div>
                        </Col>
                    ))}
                </Row>

            </div>
        );
    };


    const transformFormDataToAPI = (formData) => {
        const details = [];
        menuCategories.forEach(category => {
            const categoryData = formData[category.key] || [];
            categoryData.forEach(dish => {
                const detail = {
                    foodId: dish.dishId,
                    foodName: dish.dishName,
                    qty: dish.quantity,
                    priceForGuest: dish.guestPrice,
                    priceForPatient: dish.patientPrice,
                    priceForStaff: dish.staffPrice,
                    discountPrice: dish.discount || 0,
                    status: true,
                    discountFrom: null,
                    discountTo: null,
                    isQty: true
                };
                if (editMode && dish._originalDetailId) {
                    detail.id = dish._originalDetailId;
                }
                details.push(detail);
            });
        });

        const apiData = {
            date: formData.date ? (dayjs.isDayjs(formData.date) ? formData.date.format('YYYY-MM-DD') : dayjs(formData.date).format('YYYY-MM-DD')) : null,
            isTime: serviceTime,
            timeFrom: serviceTime && formData.timeFrom ? (dayjs.isDayjs(formData.timeFrom) ? formData.timeFrom.format('HH:mm:ss') : dayjs(formData.timeFrom).format('HH:mm:ss')) : null,
            timeTo: serviceTime && formData.timeTo ? (dayjs.isDayjs(formData.timeTo) ? formData.timeTo.format('HH:mm:ss') : dayjs(formData.timeTo).format('HH:mm:ss')) : null,
            details
        };

        if (editMode) {
            apiData.name = formData.name || existingMenuData?.name || 'Menu đã chỉnh sửa';
            apiData.timeOfDay = formData.timeOfDay || existingMenuData?.timeOfDay || 'Menu cho ngày';
            apiData.id = menuId;
        } else {
            apiData.timeOfDay = 'Menu cho ngày';
            apiData.name = 'Menu tự động';
        }

        return apiData;
    };

    const handleFormSubmit = async (values) => {
        try {
            const apiData = transformFormDataToAPI(values);
            if (!apiData.details || apiData.details.length === 0) {
                message.error('Vui lòng chọn ít nhất một món ăn cho menu!');
                return;
            }

            let result;
            if (editMode) {
                result = await updateMenuMutation.mutateAsync({ menuId, menuData: apiData });
                message.success('Menu đã được cập nhật thành công!');
            } else {
                result = await createMenuMutation.mutateAsync(apiData);
                message.success('Menu đã được tạo thành công!');
            }

            handleCancel();
            if (onSuccess) {
                onSuccess(result);
            }
        } catch (error) {
            const actionText = editMode ? 'cập nhật' : 'tạo';
            message.error(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} menu thất bại: ${error.message}`);
        }
    };

    const handleCancel = () => {
        resetForm();
        setServiceTime(false);
        setSearchTerm('');
        setShowFoodList({});
        setIsDataLoaded(false);
        setCheckedDishes({});
        if (onCancel) {
            onCancel();
        }
    };

    const hasApiError = categoriesError || dishesError || (editMode && menuError);
    const isApiLoading = categoriesLoading || dishesLoading || (editMode && menuLoading);
    const modalTitle = editMode ? (existingMenuData ? `Chỉnh sửa Menu - ${existingMenuData.name || 'Menu'}` : 'Chỉnh sửa Menu') : 'Thêm';
    const getLoadingTip = () => {
        if (editMode && menuLoading) return "Đang tải thông tin menu...";
        if (categoriesLoading && dishesLoading) return "Đang tải danh mục và món ăn...";
        if (categoriesLoading) return "Đang tải danh mục...";
        if (dishesLoading) return "Đang tải món ăn...";
        return "Đang tải...";
    };

    if (hasApiError) {
        return (
            <ReusableModal
                title={modalTitle}
                open={open}
                onCancel={handleCancel}
                footer={null}
                width={'100%'}
                destroyOnClose
                style={{ top: 0, maxWidth: '100vw' }}
            >
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={
                        (editMode && menuError?.message) ||
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
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {editMode ? <EditOutlined style={{ color: '#1890ff' }} /> : <PlusOutlined style={{ color: '#52c41a' }} />}
                    {modalTitle}
                </div>
            }
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={'100%'}
            destroyOnClose
            style={{ top: 0, maxWidth: '100vw' }}
            className="create-foods-menu"
        >
            <ReusableForm
                form={form}
                onFinish={handleFormSubmit}
                initialValues={{
                    date: null,
                    serviceTime: false,
                    timeFrom: null,
                    timeTo: null,
                    search: '',
                    ...initialValues,
                }}
                className={formLoading || loading || createMenuMutation.isLoading || updateMenuMutation.isLoading ? 'form-loading' : ''}
            >
                <Row gutter={16} align="middle" style={{ marginBottom: 16, flexWrap: 'nowrap' }}>
                    <Col flex="0 1 250px">
                        <div className="custom-floating">
                            <Form.Item
                                name="date"
                                rules={[
                                    { required: true, message: 'Vui lòng chọn ngày!' },
                                    {
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            const selectedDate = dayjs(value);
                                            const today = dayjs().startOf('day');
                                            if (selectedDate.isBefore(today)) {
                                                return Promise.reject(new Error('Không thể tạo menu cho ngày đã qua!'));
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <DatePicker
                                    format="MM/DD/YYYY"
                                    placeholder=""
                                    style={{ width: 300, height: 35 }}
                                    disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
                                />
                            </Form.Item>
                            <label className="floating-label">Ngày</label>
                        </div>
                    </Col>

                    <Col flex="none" style={{ paddingLeft: 12 }}>
                        <Form.Item
                            name="serviceTime"
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                        >
                            <Checkbox
                                checked={serviceTime}
                                onChange={handleServiceTimeChange}
                                style={{ fontWeight: 500 }}
                            >
                                Thời gian phục vụ
                            </Checkbox>
                        </Form.Item>
                    </Col>

                    <Col flex="0 1 180px" style={{ marginLeft: 8 }}>
                        <div className="custom-floating" style={{ opacity: serviceTime ? 1 : 0.4 }}>
                            <Form.Item
                                name="timeFrom"
                                rules={[{ required: serviceTime, message: 'Vui lòng chọn giờ bắt đầu!' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <TimePicker
                                    use12Hours
                                    format="hh:mm A"
                                    showSecond={false}
                                    placeholder="--:-- --"
                                    style={{ width: 300, height: 35 }}
                                    disabled={!serviceTime}
                                    suffixIcon={<ClockCircleOutlined style={{ fontSize: 18 }} />}
                                />
                            </Form.Item>
                            <label className="floating-label">Thời gian từ</label>
                        </div>
                    </Col>

                    <Col flex="0 1 180px" style={{ marginLeft: 8 }}>
                        <div className="custom-floating" style={{ opacity: serviceTime ? 1 : 0.4 }}>
                            <Form.Item
                                name="timeTo"
                                rules={[
                                    { required: serviceTime, message: 'Vui lòng chọn giờ kết thúc!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const timeFrom = getFieldValue('timeFrom');
                                            if (!serviceTime || !timeFrom || !value) return Promise.resolve();
                                            if (value.isAfter(timeFrom)) return Promise.resolve();
                                            return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu!'));
                                        },
                                    }),
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <TimePicker
                                    use12Hours
                                    format="hh:mm A"
                                    showSecond={false}
                                    placeholder="--:-- --"
                                    style={{ width: 300, height: 35 }}
                                    disabled={!serviceTime}
                                    suffixIcon={<ClockCircleOutlined style={{ fontSize: 18 }} />}
                                />
                            </Form.Item>
                            <label className="floating-label">Thời gian đến</label>
                        </div>
                    </Col>


                </Row>

                <Form.Item
                    label={<span style={{ fontWeight: 500, color: '#3c3c3c' }}>Chọn món ăn</span>}
                    style={{ marginTop: 16, marginBottom: 0 }}
                >
                    <Input
                        placeholder="Tìm kiếm món ăn"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        allowClear
                        style={{
                            width: 300,
                            borderRadius: 8,
                            height: 35,
                            fontSize: 14,
                        }}
                    />
                </Form.Item>

                <Divider />

                <div className="menu-categories-scroll">
                    {visibleCategories.map((category) => {
                        const isExpanded = expandedCategories[category.key];

                        return (
                            <div key={category.key} style={{ marginBottom: 16 }}>
                                <div
                                    onClick={() => toggleCategory(category.key)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        color: '#3c3c3c',
                                        fontSize: 16,
                                        width: 150,
                                    }}
                                >
                                    <span>{category.label}</span>
                                    <span>{isExpanded ? '−' : '+'}</span>
                                </div>

                                {isExpanded && (
                                    <div style={{ paddingLeft: 12, paddingTop: 8 }}>
                                        <Form.List name={category.key}>
                                            {(fields) => (
                                                <>
                                                    {fields.length > 0 ? (
                                                        fields.map(({ key, name, ...restField }) => {
                                                            const dishId = form.getFieldValue([category.key, name, 'dishId']);
                                                            const selectedDish = availableDishesData.find((d) => d.id === dishId);
                                                            if (!selectedDish) return null;

                                                            return (
                                                                <div
                                                                    key={key}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        marginBottom: 8,
                                                                        fontSize: 14,
                                                                        color: '#3c3c3c',
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={true}
                                                                        onChange={(e) => {
                                                                            if (!e.target.checked) {
                                                                                handleFoodRemove(category.key, dishId);
                                                                            }
                                                                        }}
                                                                        style={{ marginRight: 8 }}
                                                                    />
                                                                    <span style={{ flex: 1 }}>{selectedDish.name}</span>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'dishId']}
                                                                        style={{ display: 'none' }}
                                                                    >
                                                                        <Input />
                                                                    </Form.Item>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'dishName']}
                                                                        style={{ display: 'none' }}
                                                                    >
                                                                        <Input />
                                                                    </Form.Item>
                                                                    {renderCompactDishConfig(category.key, name, restField, selectedDish, true)}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div style={{ fontSize: 14, color: '#888' }}>
                                                            🍽️ Chưa có {category.label.toLowerCase()} nào được chọn
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </Form.List>

                                        {renderFoodList(category.key, category.label)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <Form.Item className="form-actions">
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={formLoading || loading || createMenuMutation.isLoading || updateMenuMutation.isLoading}
                            size="large"
                        >
                            {editMode ?
                                (updateMenuMutation.isLoading ? 'Đang cập nhật menu...' : 'Cập nhật Menu') :
                                (createMenuMutation.isLoading ? 'Đang tạo menu...' : 'Lưu Menu')
                            }
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
            categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            price: PropTypes.number,
            priceForGuest: PropTypes.number,
            priceForPatient: PropTypes.number,
            priceForStaff: PropTypes.number,
        })
    ),
    loading: PropTypes.bool,
    editMode: PropTypes.bool,
    menuId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSuccess: PropTypes.func,
};

export default CreateFoodsMenu;