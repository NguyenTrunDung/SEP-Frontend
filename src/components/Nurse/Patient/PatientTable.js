import React, { useState, useEffect, useMemo, useRef } from 'react';
import { message, Button, Select, Typography, Checkbox, InputNumber, Input } from 'antd';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';
import { useAllowedFoodsForPatient, useCreatePatientOrder } from '../../../hooks/queries/usePatientFoodQueries';
import { useMenus } from '../../../hooks/queries/useMenuQueries';
import { mockFoodCategories } from '../../../mocks/menuData';
import locale from 'antd/locale/vi_VN';
import { ConfigProvider } from 'antd';

const { Title, Text } = Typography;

const getVietnameseDays = () => {
  const formatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' });
  const days = [];
  const baseDate = new Date(2025, 6, 21); // Start from Monday, July 21, 2025

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    const dayName = formatter.format(date);
    days.push({
      label: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      value: (i + 1).toString(),
    });
  }

  return days;
};

const getFormattedDate = (dayKey) => {
  const dayOffset = parseInt(dayKey) - 1;
  const baseDate = new Date(2025, 6, 21); // Monday, July 21, 2025
  const date = new Date(baseDate);
  date.setDate(baseDate.getDate() + dayOffset);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

const PatientTable = ({ dataSource = [], loading, nurseId, branchId }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [allAvailableFoods, setAllAvailableFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState(new Set());
  const [patientOrders, setPatientOrders] = useState({});
  const [quantity, setQuantity] = useState({});
  const [note, setNote] = useState({});
  const [activeDay, setActiveDay] = useState('6'); // Default to Saturday, July 26, 2025
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const categoryRefs = useRef({});

  const currentBranchId = branchId || localStorage.getItem('currentBranchId') || '1';
  const selectedDiseaseCategoryId = selectedPatient?.diseaseCategories?.[0]?.diseaseCategoryId || null;

  console.log('🔍 PatientTable - Initial State:', {
    selectedPatientId: selectedPatient?.id,
    selectedPatientName: selectedPatient?.fullName,
    diseaseCategories: selectedPatient?.diseaseCategories,
    selectedDiseaseCategoryId,
    branchId: currentBranchId,
    activeDay,
    date: getFormattedDate(activeDay),
  });

  const {
    data: allowedFoodsData,
    isLoading: foodsLoading,
    error: foodsError,
    refetch: refetchAllowedFoods,
  } = useAllowedFoodsForPatient(
    selectedPatient?.id || '',
    selectedDiseaseCategoryId || undefined,
    { enabled: !!selectedPatient?.id }
  );

  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
    refetch: refreshMenus,
  } = useMenus({ date: getFormattedDate(activeDay), branchId: currentBranchId });

  useEffect(() => {
    const fetchMenuAndCategories = async () => {
      try {
        console.log('🔍 fetchMenuAndCategories - Fetching for:', {
          branchId: currentBranchId,
          date: getFormattedDate(activeDay),
        });

        let menuList = menuData?.foods || [];
        let categories = menuData?.categories || [];
        const isMockData = menuData?.isUsingMockData || false;
        setIsUsingMockData(isMockData);

        if (!menuList || !Array.isArray(menuList) || menuList.length === 0) {
          console.warn('⚠️ No menu available for date:', getFormattedDate(activeDay));
          message.warning(`Không có thực đơn cho ngày ${getFormattedDate(activeDay)}`);
          setAllAvailableFoods([]);
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
        setAllAvailableFoods(allMenuFoods);

        if (categories && Array.isArray(categories) && categories.length > 0) {
          console.log('✅ Using API categories:', categories);
          setFoodCategories(categories);
        } else if (isMockData) {
          console.log('✅ Using mockFoodCategories:', mockFoodCategories);
          setFoodCategories(mockFoodCategories);
        } else {
          const foodCategoryIds = [...new Set(menuList.map(food => food.categoryId).filter(id => id))];
          const derivedCategories = foodCategoryIds.map(categoryId => ({
            id: categoryId,
            name: `Category ${categoryId}`,
            imageUrl: '/images/placeholder-food.png',
          }));
          console.log('✅ Derived categories:', derivedCategories);
          setFoodCategories(derivedCategories);
        }
      } catch (error) {
        console.error('❌ fetchMenuAndCategories error:', error);
        message.error('Không thể tải thực đơn hoặc danh mục.');
        setAllAvailableFoods([]);
        setFoodCategories([]);
      }
    };

    if (selectedPatient) {
      fetchMenuAndCategories();
    } else {
      console.log('🔍 No selected patient, resetting states');
      setAllAvailableFoods([]);
      setFilteredFoods([]);
      setFoodCategories([]);
      setSelectedFoods(new Set());
      setPatientOrders({});
      setQuantity({});
      setNote({});
      setExpandedCategories({});
    }
  }, [selectedPatient, currentBranchId, activeDay, menuData]);

  useEffect(() => {
    console.log('🔍 allowedFoodsData:', allowedFoodsData);
    console.log('🔍 allAvailableFoods:', allAvailableFoods);

    if (!selectedPatient || !allAvailableFoods.length) {
      console.warn('⚠️ No selected patient or allAvailableFoods empty, setting filteredFoods to []');
      setFilteredFoods([]);
      return;
    }

    const restrictedFoodIds = new Set(allowedFoodsData?.data?.map(food => food.id) || []);
    console.log('🔍 restrictedFoodIds:', Array.from(restrictedFoodIds));

    if (restrictedFoodIds.size === 0) {
      console.warn('⚠️ restrictedFoodIds is empty for patient:', selectedPatient.id);
      message.warning(`Không tìm thấy món ăn hạn chế cho bệnh nhân ${selectedPatient.id}. Hiển thị tất cả món ăn trong thực đơn.`);
    } else {
      console.log('✅ Restricted foods found:', Array.from(restrictedFoodIds).map(id =>
        allAvailableFoods.find(food => food.id === id)?.name || `ID: ${id}`
      ));
    }

    const filtered = allAvailableFoods.filter(food => !restrictedFoodIds.has(food.id));
    console.log('✅ Filtered excluding restricted foods:', filtered);
    setFilteredFoods(filtered);
  }, [allowedFoodsData, allAvailableFoods, selectedPatient]);

  const createPatientOrderMutation = useCreatePatientOrder();

  const vietnameseDays = getVietnameseDays();

  const handleAddToMenu = async (record) => {
    if (!record || !record.id || !record.fullName) {
      message.error('Dữ liệu bệnh nhân không hợp lệ.');
      return;
    }
    console.log('🔍 handleAddToMenu:', record);
    setSelectedPatient({
      id: record.id,
      fullName: record.fullName,
      diseaseCategories: record.diseaseCategories || [],
    });
    setSelectedFoods(new Set());
    setPatientOrders(prev => ({ ...prev, [record.id]: [] }));
    setQuantity({});
    setNote({});
    setFilteredFoods([]);
    setExpandedCategories({});
    if (record.id) refetchAllowedFoods();
  };

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
    setQuantity(prev => ({ ...prev, [foodId]: value || 1 }));
  };

  const handleNoteChange = (foodId) => (e) => {
    setNote(prev => ({ ...prev, [foodId]: e.target.value }));
  };

  const handleConfirmFoodOrder = async () => {
    if (!selectedFoods.size) {
      message.warning('Vui lòng chọn ít nhất một món ăn');
      return;
    }

    try {
      const orderDetails = Array.from(selectedFoods).map(foodId => {
        const food = filteredFoods.find(f => f.id === foodId);
        if (!food) {
          console.warn(`Food with ID ${foodId} not found in filteredFoods`);
          return null;
        }
        return {
          foodId: foodId,
          quantity: quantity[foodId] || 1,
          notes: note[foodId] || '',
        };
      }).filter(item => item !== null);

      if (orderDetails.length === 0) {
        message.error('Không tìm thấy món ăn hợp lệ để đặt.');
        return;
      }

      const orderData = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        menuType: `Menu for ${getFormattedDate(activeDay)}`, // Replaced dayToMenuMap with formatted date
        branchId: currentBranchId,
        nurseId: nurseId,
        orderDetails,
      };

      console.log('🔍 Submitting orderData:', orderData);

      await createPatientOrderMutation.mutateAsync(orderData);
      message.success(`Đã thêm món ăn cho bệnh nhân ${selectedPatient.fullName} vào ngày ${getFormattedDate(activeDay)}`);
      setPatientOrders(prev => ({
        ...prev,
        [selectedPatient.id]: orderDetails,
      }));
    } catch (error) {
      console.error('❌ Error in handleConfirmFoodOrder:', error);
      message.error(error.message || 'Lỗi khi thêm món ăn');
    }
  };

  const handleDayChange = async (value) => {
    console.log('🔍 handleDayChange:', value);
    setActiveDay(value);
    if (selectedPatient) {
      setFilteredFoods([]);
      setExpandedCategories({});
      refreshMenus();
      refetchAllowedFoods();
    }
  };

  useEffect(() => {
    if (menuLoading || foodsLoading) {
      message.loading('Đang tải thực đơn...', 0);
    } else {
      message.destroy();
    }
  }, [menuLoading, foodsLoading]);

  useEffect(() => {
    if (menuError) {
      console.error('❌ menuError:', menuError);
      message.error('Lỗi khi tải thực đơn: ' + (menuError.message || 'Lỗi không xác định'));
    }
    if (foodsError) {
      console.error('❌ foodsError:', foodsError);
      message.error('Lỗi khi tải danh sách món ăn: ' + (foodsError.message || 'Lỗi không xác định'));
    }
  }, [menuError, foodsError]);

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

  const columns = [
    {
      dataIndex: 'medicalRecordNumber',
      align: 'left',
      title: 'Mã Hồ Sơ',
      sorter: (a, b) => (a.medicalRecordNumber || '').localeCompare(b.medicalRecordNumber || ''),
      render: (text) => <span className="vietnamese-text">{text || '-'}</span>,
    },
    {
      dataIndex: 'fullName',
      align: 'left',
      title: 'Họ Tên',
      primary: true,
      sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
      render: (text) => <span className="vietnamese-text">{text || '-'}</span>,
    },
    {
      dataIndex: 'gender',
      align: 'left',
      title: 'Giới Tính',
      render: (text) => <span className="vietnamese-text">{text || '-'}</span>,
    },
    {
      dataIndex: 'roomNumber',
      align: 'left',
      title: 'Phòng',
      sorter: (a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || ''),
      render: (text) => <span className="vietnamese-text">{text || '-'}</span>,
    },
    {
      dataIndex: 'bedNumber',
      align: 'left',
      title: 'Giường',
      sorter: (a, b) => (a.bedNumber || '').localeCompare(b.bedNumber || ''),
      render: (text) => <span className="vietnamese-text">{text || '-'}</span>,
    },
    {
      dataIndex: 'diseaseCategories',
      align: 'left',
      title: 'Nhóm Bệnh',
      render: (diseaseCategories) => {
        if (!diseaseCategories || !Array.isArray(diseaseCategories) || diseaseCategories.length === 0) {
          return <span className="vietnamese-text">Chưa xác định</span>;
        }
        const diseaseNames = diseaseCategories.map(dc => dc.diseaseCategoryName).join(', ');
        return <span className="vietnamese-text">{diseaseNames}</span>;
      },
    },
  ];

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: true,
    showSizeChanger: true,
    total: dataSource.length,
    showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
  };

  return (
    <ConfigProvider locale={locale}>
      <div className="reusable-table-container">
        <div style={{ marginBottom: '16px' }}>
          <Select
            value={activeDay}
            onChange={handleDayChange}
            style={{ width: 200 }}
            placeholder="Chọn ngày"
          >
            {vietnameseDays.map(day => (
              <Select.Option key={day.value} value={day.value}>
                {day.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        <ReusableTableV2
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          listHeader="HỌ TÊN"
          emptyMessage="Không tìm thấy bệnh nhân nào."
          pagination={paginationConfig}
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) => (
              <span
                onClick={(e) => {
                  onExpand(record, e);
                  handleAddToMenu(record);
                }}
                style={{ cursor: 'pointer', fontSize: '16px', width: '20px', display: 'inline-block' }}
              >
                {expanded ? '−' : '+'}
              </span>
            ),
            expandedRowRender: (record) => (
              <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                {selectedPatient?.id === record.id && (
                  <>
                    {menuLoading || foodsLoading ? (
                      <p>Đang tải thực đơn...</p>
                    ) : Object.keys(groupedFoods).length === 0 && filteredFoods.length === 0 ? (
                      <p>Không có món ăn nào phù hợp với bệnh nhân hoặc thực đơn chưa được thiết lập.</p>
                    ) : (
                      <div>
                        {Object.entries(groupedFoods).map(([categoryName, foods]) => (
                          <div key={categoryName} style={{ marginBottom: '16px' }}>
                            <div
                              onClick={() => setExpandedCategories(prev => ({
                                ...prev,
                                [categoryName]: !prev[categoryName],
                              }))}
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
                                {foods.map(food => (
                                  <div
                                    key={food.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: '6px 0',
                                      borderBottom: '1px solid #f0f0f0',
                                      gap: 8, // khoảng cách giữa các phần
                                    }}
                                  >
                                    {/* Checkbox + Tên món (1 khối) */}
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

                                    {/* Số lượng */}
                                    <InputNumber
                                      min={1}
                                      value={quantity[food.id] || 1}
                                      onChange={handleQuantityChange(food.id)}
                                      style={{ width: 60 }}
                                    />

                                    {/* Ghi chú */}
                                    <Input
                                      value={note[food.id] || ''}
                                      onChange={handleNoteChange(food.id)}
                                      placeholder="Ghi chú..."
                                      style={{ width: 500 }}
                                    />
                                  </div>
                                ))}
                              </div>

                            )}
                          </div>
                        ))}
                        <Button
                          type="primary"
                          onClick={handleConfirmFoodOrder}
                          style={{ marginTop: '16px' }}
                        >
                          Xác nhận đơn hàng
                        </Button>
                      </div>
                    )}
                    {patientOrders[record.id]?.length > 0 && (
                      <>
                        <Title level={5} style={{ marginTop: '24px', marginBottom: '16px', color: '#333' }}>
                          Danh sách món ăn đã thêm
                        </Title>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '16px',
                          }}
                        >
                          {patientOrders[record.id].map(item => (
                            <div
                              key={item.foodId}
                              className="food-card"
                              style={{
                                border: '1px solid #e8e8e8',
                                borderRadius: '8px',
                                padding: '12px',
                                background: '#fff',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                position: 'relative',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  backgroundColor: '#b4c80f',
                                  color: '#fff',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                }}
                              >
                                x{item.quantity || 1}
                              </div>
                              <Title
                                level={5}
                                style={{
                                  marginBottom: '8px',
                                  fontSize: '16px',
                                  color: '#222',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {filteredFoods.find(f => f.id === item.foodId)?.name || 'Không xác định'}
                              </Title>
                              <div style={{ marginBottom: '8px' }}>
                                <Text
                                  strong
                                  style={{ fontSize: '14px', color: '#b41400' }}
                                >
                                  {filteredFoods.find(f => f.id === item.foodId)?.priceForPatient?.toLocaleString('vi-VN') || '0'}đ
                                </Text>
                              </div>
                              {item.notes && (
                                <Text
                                  style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    display: 'block',
                                    whiteSpace: 'pre-wrap',
                                    marginBottom: '8px',
                                  }}
                                >
                                  Ghi chú: {item.notes}
                                </Text>
                              )}
                              <Button
                                type="text"
                                danger
                                size="small"
                                style={{ position: 'absolute', bottom: '8px', right: '8px' }}
                                onClick={() => {
                                  const newOrders = patientOrders[record.id].filter(f => f.foodId !== item.foodId);
                                  setPatientOrders(prev => ({ ...prev, [record.id]: newOrders }));
                                  setSelectedFoods(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(item.foodId);
                                    return newSet;
                                  });
                                  message.success(`Đã xóa ${filteredFoods.find(f => f.id === item.foodId)?.name || 'món ăn'} khỏi danh sách`);
                                }}
                              >
                                Xóa
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            ),
          }}
          onRow={(record) => ({
            onClick: (e) => {
              e.stopPropagation();
            },
          })}
        />
      </div>
    </ConfigProvider>
  );
};

PatientTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      medicalRecordNumber: PropTypes.string.isRequired,
      fullName: PropTypes.string.isRequired,
      gender: PropTypes.string,
      roomNumber: PropTypes.string,
      bedNumber: PropTypes.string,
      diseaseCategories: PropTypes.arrayOf(
        PropTypes.shape({
          diseaseCategoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          diseaseCategoryName: PropTypes.string,
          diseaseCategoryCode: PropTypes.string,
          patientSeverityLevel: PropTypes.number,
        })
      ),
      isActive: PropTypes.bool,
      age: PropTypes.number,
      isCurrentlyAdmitted: PropTypes.bool,
      displayLocation: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  nurseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default PatientTable;