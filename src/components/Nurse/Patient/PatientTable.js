import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ConfigProvider, Button, Space, message, Modal, Typography, Image, Select, Input } from 'antd';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';
import { useAllowedFoodsForPatient, useCreatePatientOrder } from '../../../hooks/queries/usePatientFoodQueries';
import locale from 'antd/locale/vi_VN';
import { v4 as uuidv4 } from 'uuid';
import './PatientTable.css';

const { Title, Text } = Typography;

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const getVietnameseDays = () => {
  const formatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' });
  const days = [];
  const baseDate = new Date(2025, 5, 16); // Start from Monday (16/6/2025)
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

const PatientTable = ({ dataSource = [], loading, nurseId, branchId }) => {
  const [searchText, setSearchText] = useState('');
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [patientOrders, setPatientOrders] = useState({});
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [activeDay, setActiveDay] = useState('2'); // Default to Tuesday
  const categoryRefs = useRef({});

  const currentBranchId = branchId || localStorage.getItem('currentBranchId') || '1';
  const selectedDiseaseCategoryId = selectedPatient?.diseaseCategories?.[0]?.diseaseCategoryId || null;

  const { data: allowedFoodsData, isLoading: foodsLoading, error: foodsError, refetch: refetchAllowedFoods } =
    useAllowedFoodsForPatient(selectedPatient?.id || '', selectedDiseaseCategoryId, { enabled: !!selectedPatient?.id });

  const createPatientOrderMutation = useCreatePatientOrder();
  const vietnameseDays = getVietnameseDays();

  const dayToMenuMap = {
    '1': 'Menu thứ 2',
    '2': 'Menu thứ 3',
    '3': 'Menu thứ 4',
    '4': 'Menu thứ 5',
    '5': 'Menu thứ 6',
    '6': 'Menu thứ 7',
    '7': 'Menu chủ nhật',
  };

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return dataSource;
    const searchLower = searchText.trim().toLowerCase();
    return dataSource.filter(
      (item) =>
        (item.fullName || '').toLowerCase().includes(searchLower) ||
        (item.medicalRecordNumber || '').toLowerCase().includes(searchLower)
    );
  }, [dataSource, searchText]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        if (value.trim()) {
          message.info(`Lọc bệnh nhân theo: ${value.trim()}`);
        } else {
          message.info('Đã xóa bộ lọc tìm kiếm');
        }
      }, 200),
    []
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleAddToMenu = (record) => {
    setSelectedPatient(record);
    setSelectedFoods([]);
    setPatientOrders((prev) => ({ ...prev, [record.id]: [] }));
    setFoodModalVisible(true);
  };

  const handleShowDetails = (food) => {
    setSelectedFood(food);
    const existingOrder = patientOrders[selectedPatient?.id]?.find((item) => item.id === food.id);
    setQuantity(existingOrder?.quantity || 1);
    setNote(existingOrder?.note || '');
    setDetailModalVisible(true);
  };

  const handleAddOrUpdateOrder = () => {
    if (!selectedFood) return;
    const existingOrder = patientOrders[selectedPatient?.id]?.find((item) => item.id === selectedFood.id);
    const newFood = {
      ...selectedFood,
      quantity,
      note,
      cartId: existingOrder?.cartId || uuidv4(),
      FoodId: selectedFood.id,
      dishName: selectedFood.name,
      price: selectedFood.priceForPatient,
      image: selectedFood.image || 'https://via.placeholder.com/200x140?text=No+Image',
    };

    setPatientOrders((prev) => ({
      ...prev,
      [selectedPatient.id]: existingOrder
        ? prev[selectedPatient.id].map((item) => (item.id === selectedFood.id ? newFood : item))
        : [...(prev[selectedPatient.id] || []), newFood],
    }));

    setSelectedFoods((prev) => (existingOrder ? prev : [...prev, selectedFood.id]));
    message.success(`${selectedFood.name} đã được ${existingOrder ? 'cập nhật' : 'thêm'}!`);
    setDetailModalVisible(false);
  };

  const handleConfirmFoodOrder = async () => {
    if (!selectedFoods.length) {
      message.warning('Vui lòng chọn ít nhất một món ăn');
      return;
    }

    try {
      const orderDetails = selectedFoods.map((foodId) => {
        const food = patientOrders[selectedPatient.id]?.find((item) => item.id === foodId);
        return {
          FoodId: foodId,
          quantity: food?.quantity || 1,
          note: food?.note || '',
          cartId: food?.cartId || uuidv4(),
          dishName: food?.name,
          price: food?.priceForPatient,
          image: food?.image || 'https://via.placeholder.com/200x140?text=No+Image',
        };
      });

      const orderData = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        menuType: dayToMenuMap[activeDay],
        branchId: currentBranchId,
        nurseId: nurseId,
        orderDetails,
      };

      await createPatientOrderMutation.mutateAsync(orderData);
      message.success(`Đã thêm món ăn cho bệnh nhân ${selectedPatient.fullName} vào ${dayToMenuMap[activeDay]}!`);
      setFoodModalVisible(false);
      setPatientOrders((prev) => ({ ...prev, [selectedPatient.id]: [] }));
      setSelectedFoods([]);
    } catch (error) {
      message.error('Không thể thêm món ăn vào đơn hàng.');
    }
  };

  const handleDayChange = (value) => {
    setActiveDay(value);
    if (selectedPatient) refetchAllowedFoods();
  };

  useEffect(() => {
    if (allowedFoodsData) {
      const foodsArray = Array.isArray(allowedFoodsData?.data)
        ? allowedFoodsData.data
        : Array.isArray(allowedFoodsData)
        ? allowedFoodsData
        : [];
      setAvailableFoods(foodsArray);
    }
  }, [allowedFoodsData]);

  useEffect(() => {
    if (foodsLoading) message.loading('Đang tải danh sách món ăn...', 0);
    else message.destroy();
  }, [foodsLoading]);

  useEffect(() => {
    if (foodsError) message.error('Lỗi khi tải danh sách món ăn: ' + (foodsError.message || 'Lỗi không xác định'));
  }, [foodsError]);

  const groupedFoods = useMemo(() => {
    if (!Array.isArray(availableFoods) || availableFoods.length === 0) return {};
    const diseaseNames = selectedPatient?.diseaseCategories?.length
      ? selectedPatient.diseaseCategories.map((dc) => dc.diseaseCategoryName).join(', ')
      : 'Phù hợp';
    return availableFoods.reduce((acc, food) => {
      acc[diseaseNames] = acc[diseaseNames] || [];
      acc[diseaseNames].push(food);
      return acc;
    }, {});
  }, [availableFoods, selectedPatient]);

  useEffect(() => {
    if (selectedPatient && activeDay) handleDayChange(activeDay);
  }, [selectedPatient, activeDay]);

  const columns = [
    { dataIndex: 'medicalRecordNumber', primary: true, align: 'left', title: 'MÃ HỒ SƠ', render: (text) => text || '-' },
    { dataIndex: 'fullName', align: 'left', title: 'HỌ TÊN', render: (text) => text || '-' },
    { dataIndex: 'gender', align: 'left', title: 'GIỚI TÍNH', render: (text) => text || '-' },
    { dataIndex: 'roomNumber', align: 'left', title: 'PHÒNG', render: (text) => text || '-' },
    { dataIndex: 'bedNumber', align: 'left', title: 'GIƯỜNG', render: (text) => text || '-' },
    {
      dataIndex: 'diseaseCategories',
      align: 'left',
      title: 'NHÓM BỆNH',
      render: (diseaseCategories) =>
        diseaseCategories?.length
          ? diseaseCategories.map((dc) => dc.diseaseCategoryName).join(', ')
          : 'Chưa xác định',
    },
  ];

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: true,
    showSizeChanger: true,
    total: filteredData.length,
    showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} bệnh nhân`,
  };

  return (
    <ConfigProvider locale={locale}>
      <ReusableTableV2
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        listHeader="DANH SÁCH BỆNH NHÂN"
        emptyMessage="Không tìm thấy bệnh nhân nào."
        pagination={paginationConfig}
        searchProps={{
          value: searchText,
          onChange: handleSearch,
          placeholder: 'Tìm kiếm bệnh nhân',
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
              <Button
                type="primary"
                style={{ backgroundColor: '#b4c80f', borderColor: '#b4c80f', marginBottom: '16px' }}
                onClick={() => handleAddToMenu(record)}
              >
                Thêm món ăn
              </Button>
              {patientOrders[record.id]?.length ? (
                <div>
                  <Title level={5} style={{ marginBottom: '16px', color: '#333' }}>
                    Danh sách món ăn đã thêm
                  </Title>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    {patientOrders[record.id].map((item) => (
                      <div
                        key={item.id}
                        className="food-card"
                        style={{
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          padding: '12px',
                          background: '#fff',
                          position: 'relative',
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
                          {item.name}
                        </Title>
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '14px', color: '#b41400' }}>
                            {item.priceForPatient.toLocaleString('vi-VN')}đ
                          </Text>
                        </div>
                        {item.note && (
                          <Text style={{ fontSize: '12px', color: '#666', display: 'block', whiteSpace: 'pre-wrap' }}>
                            Ghi chú: {item.note}
                          </Text>
                        )}
                        <Button
                          type="text"
                          danger
                          size="small"
                          style={{ position: 'absolute', bottom: '8px', right: '8px' }}
                          onClick={() => {
                            setPatientOrders({
                              ...patientOrders,
                              [record.id]: patientOrders[record.id].filter((food) => food.id !== item.id),
                            });
                            setSelectedFoods(selectedFoods.filter((foodId) => foodId !== item.id));
                            message.success(`Đã xóa ${item.name} khỏi danh sách`);
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Text style={{ padding: '16px', color: '#666' }}>Chưa có món ăn nào được thêm.</Text>
              )}
            </div>
          ),
        }}
      />
      <Modal
        title={`Thêm món ăn cho ${selectedPatient?.fullName}`}
        open={foodModalVisible}
        onCancel={() => setFoodModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        centered
        width={1200}
        footer={[
          <Button key="cancel" onClick={() => setFoodModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleConfirmFoodOrder}>
            Xác nhận
          </Button>,
        ]}
      >
        <Space style={{ width: '100%', marginBottom: 16 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Chọn ngày"
            value={activeDay}
            onChange={handleDayChange}
            options={vietnameseDays}
          />
        </Space>
        {Object.keys(groupedFoods).length > 0 ? (
          <div>
            {Object.keys(groupedFoods).map((category) => (
              <div
                key={category}
                style={{ marginBottom: '32px', paddingTop: '20px', scrollMarginTop: '140px' }}
                ref={(el) => (categoryRefs.current[category] = el)}
              >
                <Title
                  level={4}
                  style={{
                    marginBottom: '16px',
                    color: '#333',
                    backgroundColor: '#f0f0f0',
                    padding: '8px 16px',
                    borderRadius: '6px',
                  }}
                >
                  {category}
                </Title>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {groupedFoods[category].map((food) => {
                    const isInOrder = patientOrders[selectedPatient?.id]?.some((item) => item.id === food.id);
                    return (
                      <div
                        key={food.id}
                        className="food-card"
                        style={{
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          padding: '12px',
                          background: '#fff',
                          position: 'relative',
                        }}
                      >
                        <Image
                          width="100%"
                          height={140}
                          src={food.image || 'https://via.placeholder.com/200x140?text=No+Image'}
                          alt={food.name}
                          preview={false}
                          style={{ objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' }}
                        />
                        {isInOrder && (
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
                            }}
                          >
                            x{patientOrders[selectedPatient?.id]?.find((item) => item.id === food.id)?.quantity || 1}
                          </div>
                        )}
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
                          {food.name}
                        </Title>
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '14px', color: '#b41400' }}>
                            {food.priceForPatient.toLocaleString('vi-VN')}đ
                          </Text>
                        </div>
                        <Button
                          style={{
                            backgroundColor: '#b4c80f',
                            borderColor: '#b4c80f',
                            color: '#000',
                            width: '100%',
                            borderRadius: '6px',
                          }}
                          type="primary"
                          size="small"
                          onClick={() => handleShowDetails(food)}
                        >
                          {isInOrder ? 'Cập nhật' : 'Thêm'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Text style={{ textAlign: 'center', display: 'block', marginTop: 24 }} type="secondary">
            Không có món ăn phù hợp.
          </Text>
        )}
      </Modal>
      <Modal
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
        centered
        styles={{ content: { padding: 0, borderRadius: '8px' } }}
      >
        <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
          <div
            style={{
              backgroundColor: '#b4c80f',
              color: '#000',
              padding: '12px 16px',
              fontSize: '18px',
            }}
          >
            {patientOrders[selectedPatient?.id]?.some((item) => item.id === selectedFood?.id)
              ? 'Cập nhật món ăn'
              : 'Thêm món ăn'}
          </div>
          {selectedFood?.image && (
            <img
              src={selectedFood.image || 'https://via.placeholder.com/600x250?text=No+Image'}
              alt={selectedFood.name}
              style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }}
            />
          )}
          <div style={{ padding: '12px 16px' }}>
            <Text style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
              {selectedFood?.name || 'Không có tên'}
            </Text>
            <Text style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>
              {selectedFood?.description || 'Không có mô tả'}
            </Text>
            <Text
              style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#b41400', marginBottom: '12px' }}
            >
              {selectedFood?.priceForPatient.toLocaleString('vi-VN')}đ
            </Text>
          </div>
          <div style={{ padding: '0 16px' }}>
            <Text style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
              Ghi chú:
            </Text>
            <Input.TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ marginBottom: '20px', height: '100px', resize: 'none' }}
              placeholder="Ghi chú..."
            />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Button
              style={{
                backgroundColor: '#b4c80f',
                borderColor: '#b4c80f',
                color: '#000',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </Button>
            <span style={{ margin: '0 16px', fontSize: '16px' }}>{quantity}</span>
            <Button
              style={{
                backgroundColor: '#b4c80f',
                borderColor: '#b4c80f',
                color: '#000',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 16px 16px' }}>
            <Button
              style={{
                backgroundColor: '#b4c80f',
                borderColor: '#b4c80f',
                color: '#000',
                width: '100%',
                borderRadius: '6px',
              }}
              onClick={handleAddOrUpdateOrder}
            >
              {patientOrders[selectedPatient?.id]?.some((item) => item.id === selectedFood?.id)
                ? 'Cập nhật món ăn'
                : 'Thêm món ăn'}
            </Button>
          </div>
        </div>
      </Modal>
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