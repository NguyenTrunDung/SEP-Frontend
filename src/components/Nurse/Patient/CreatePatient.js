import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Space, message, Checkbox, InputNumber, Input, Typography } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import PropTypes from 'prop-types';
import { useMenus } from '../../../hooks/queries/useMenuQueries';
import { diseaseCategoryFoodRestrictionService } from '../../../services/diseaseCategoryFoodRestrictionService';
import { mockFoodCategories } from '../../../mocks/menuData';

const { Title } = Typography;

const getFormattedDate = (dayKey) => {
  const currentDate = new Date();
  const currentDayIndex = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
  const dayOffset = parseInt(dayKey) - 1;
  const date = new Date();
  date.setDate(currentDate.getDate() + (dayOffset - currentDayIndex));
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

const BulkFoodSelection = ({
  open,
  onCancel,
  onSubmit,
  branchId,
  activeDay: propActiveDay,
}) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm({});
  const [selectedFoods, setSelectedFoods] = useState(new Set());
  const [quantity, setQuantity] = useState({});
  const [note, setNote] = useState({});
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [activeDay, setActiveDay] = useState(
    propActiveDay || (new Date().getDay() === 0 ? '7' : new Date().getDay().toString())
  );

  const currentBranchId = branchId || localStorage.getItem('currentBranchId') || '1';

  // Lấy thực đơn
  const { data: menuData, isLoading: menuLoading, error: menuError, refetch: refreshMenus } = useMenus({
    date: getFormattedDate(activeDay),
    branchId: currentBranchId,
  });

  const [restrictedFoodIds, setRestrictedFoodIds] = useState(new Set());

  useEffect(() => {
    const fetchMenuAndRestrictions = async () => {
      if (!menuData || !menuData.foods) {
        console.warn('⚠️ No menuData or menuData.foods available');
        setFilteredFoods([]);
        setFoodCategories([]);
        return;
      }

      let menuList = menuData.foods || [];
      let categories = menuData.categories || [];
      const isMockData = menuData.isUsingMockData || false;
      setIsUsingMockData(isMockData);

      if (!menuList || !Array.isArray(menuList) || menuList.length === 0) {
        console.warn('⚠️ No menu available for date:', getFormattedDate(activeDay));
        message.warning(`Không có thực đơn cho ngày ${getFormattedDate(activeDay)}`);
        setFilteredFoods([]);
        setFoodCategories(isMockData ? mockFoodCategories : []);
        return;
      }

      console.log('✅ menuList:', menuList);
      const allMenuFoods = menuList.map(detail => ({
        id: detail.id,
        name: detail.name || 'Unknown Food',
        categoryId: detail.categoryId || 'unknown',
        priceForPatient: detail.priceForPatient || detail.priceForGuest || 0,
        description: detail.description || `From menu on ${getFormattedDate(activeDay)}`,
        imageUrl: detail.imageUrl || '/images/placeholder-food.png',
      }));

      console.log('✅ allMenuFoods:', allMenuFoods);

      // Lấy danh sách món ăn bị hạn chế từ tất cả nhóm bệnh trong chi nhánh
      let allRestrictedFoodIds = new Set();
      try {
        const response = await diseaseCategoryFoodRestrictionService.getDiseaseCategoryFoodRestrictions(currentBranchId);
        if (response?.data) {
          allRestrictedFoodIds = new Set(response.data.map(restriction => restriction.foodId));
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy diseaseCategoryFoodRestrictions:', error);
        message.error('Lỗi khi lấy danh sách món ăn hạn chế.');
      }

      console.log('🔍 restrictedFoodIds:', Array.from(allRestrictedFoodIds));
      setRestrictedFoodIds(allRestrictedFoodIds);

      // Lọc món ăn không bị hạn chế
      const filtered = allMenuFoods.filter((food) => {
        const isRestricted = allRestrictedFoodIds.has(food.id);
        if (isRestricted) {
          console.log(`🚫 Excluding restricted food: ${food.name} (ID: ${food.id})`);
        }
        return !isRestricted;
      });

      console.log('✅ Filtered foods:', filtered);
      setFilteredFoods(filtered);

      // Xử lý danh mục
      if (categories && Array.isArray(categories) && categories.length > 0) {
        console.log('✅ Using API categories:', categories);
        setFoodCategories(categories);
      } else if (isMockData) {
        console.log('✅ Using mockFoodCategories:', mockFoodCategories);
        setFoodCategories(mockFoodCategories);
      } else {
        const foodCategoryIds = [...new Set(filtered.map(food => food.categoryId).filter(id => id))];
        const derivedCategories = foodCategoryIds.map(categoryId => ({
          id: categoryId,
          name: `Category ${categoryId}`,
          imageUrl: '/images/placeholder-food.png',
        }));
        console.log('✅ Derived categories:', derivedCategories);
        setFoodCategories(derivedCategories);
      }
    };

    fetchMenuAndRestrictions();
  }, [menuData, currentBranchId]);

  useEffect(() => {
    if (menuError) {
      console.error('❌ menuError:', menuError);
      message.error('Lỗi khi tải thực đơn: ' + (menuError.message || 'Lỗi không xác định'));
    }
  }, [menuError]);

  useEffect(() => {
    if (propActiveDay && propActiveDay !== activeDay) {
      setActiveDay(propActiveDay);
      refreshMenus();
    }
  }, [propActiveDay, refreshMenus]);

  const groupedFoods = useMemo(() => {
    if (!Array.isArray(filteredFoods) || filteredFoods.length === 0) {
      console.warn('⚠️ groupedFoods - No filtered foods available');
      return {};
    }

    const categoryMap = foodCategories.reduce((map, cat) => {
      map[cat.id] = cat.name;
      return map;
    }, {});
    console.log('🔍 categoryMap:', categoryMap);

    const result = filteredFoods.reduce((acc, food) => {
      const categoryName = categoryMap[food.categoryId] || food.category?.name || 'Món khác';
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push({
        ...food,
        priceForPatient: food.priceForPatient || 0,
      });
      return acc;
    }, {});
    console.log('✅ groupedFoods:', result);
    return result;
  }, [filteredFoods, foodCategories]);

  const handleCheckboxChange = (foodId) => (e) => {
    const newSelectedFoods = new Set(selectedFoods);
    if (e.target.checked) {
      newSelectedFoods.add(foodId);
    } else {
      newSelectedFoods.delete(foodId);
    }
    setSelectedFoods(newSelectedFoods);
  };

  const handleQuantityChange = (foodId) => (value) => {
    setQuantity((prev) => ({ ...prev, [foodId]: value || 1 }));
  };

  const handleNoteChange = (foodId) => (e) => {
    setNote((prev) => ({ ...prev, [foodId]: e.target.value }));
  };

  const handleFormSubmit = async () => {
    if (!selectedFoods.size) {
      message.warning('Vui lòng chọn ít nhất một món ăn');
      return;
    }

    const orderDetails = Array.from(selectedFoods).map((foodId) => ({
      foodId,
      quantity: quantity[foodId] || 1,
      notes: note[foodId] || '',
    }));

    const payload = {
      orderDetails,
      date: getFormattedDate(activeDay),
      branchId: currentBranchId,
    };

    const result = await handleSubmit(async () => {
      if (onSubmit) {
        await onSubmit(payload);
      }
    });

    if (result.success) {
      message.success('Đã chọn món ăn cho tất cả bệnh nhân!');
      handleCancel();
    }
  };

  const handleCancel = () => {
    resetForm();
    setSelectedFoods(new Set());
    setQuantity({});
    setNote({});
    setFilteredFoods([]);
    setFoodCategories([]);
    setExpandedCategories({});
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <ReusableModal
      title="Chọn Món Ăn Cho Tất Cả Bệnh Nhân"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <ReusableForm
        form={form}
        onFinish={handleFormSubmit}
        layout="vertical"
        className={formLoading || menuLoading ? 'form-loading' : ''}
      >
        {menuLoading ? (
          <p>Đang tải thực đơn...</p>
        ) : Object.keys(groupedFoods).length === 0 && filteredFoods.length === 0 ? (
          <p>Không có món ăn nào phù hợp với tất cả bệnh nhân hoặc thực đơn chưa được thiết lập.</p>
        ) : (
          <div>
            {Object.entries(groupedFoods).map(([categoryName, foods]) => (
              <div key={categoryName} style={{ marginBottom: '16px' }}>
                <div
                  onClick={() =>
                    setExpandedCategories((prev) => ({
                      ...prev,
                      [categoryName]: !prev[categoryName],
                    }))
                  }
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
                  <span>{categoryName}</span>
                  <span>{expandedCategories[categoryName] ? '−' : '+'}</span>
                </div>
                {expandedCategories[categoryName] && (
                  <div style={{ paddingLeft: 12, paddingTop: 8 }}>
                    {foods.map((food) => (
                      <div
                        key={food.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 0',
                          borderBottom: '1px solid #f0f0f0',
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', maxWidth: 180, flex: 1 }}>
                          <Checkbox
                            checked={selectedFoods.has(food.id)}
                            onChange={handleCheckboxChange(food.id)}
                            style={{ marginRight: 6 }}
                          />
                          <span
                            style={{
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {food.name}
                          </span>
                        </div>
                        <InputNumber
                          min={1}
                          value={quantity[food.id] || 1}
                          onChange={handleQuantityChange(food.id)}
                          style={{ width: 60 }}
                        />
                        <Input
                          value={note[food.id] || ''}
                          onChange={handleNoteChange(food.id)}
                          placeholder="Ghi chú..."
                          style={{ width: 300 }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Form.Item className="form-actions">
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleCancel} size="large">
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={formLoading} size="large">
                  Xác Nhận Chọn Món
                </Button>
              </Space>
            </Form.Item>
          </div>
        )}
      </ReusableForm>
    </ReusableModal>
  );
};

BulkFoodSelection.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  activeDay: PropTypes.string.isRequired,
};

export default BulkFoodSelection;