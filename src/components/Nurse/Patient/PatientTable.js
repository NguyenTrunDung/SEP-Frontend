import React, { useState, useEffect, useMemo, useRef } from 'react';
import { message, Button, Select, Typography, Checkbox, InputNumber, Input, Space, Modal, Form, Tooltip, Popconfirm, Descriptions, Alert } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';
import { useCreatePatientOrder } from '../../../hooks/queries/usePatientFoodQueries';
import { useMenus } from '../../../hooks/queries/useMenuQueries';
import { mockFoodCategories } from '../../../mocks/menuData';
import locale from 'antd/locale/vi_VN';
import { ConfigProvider } from 'antd';
import moment from 'moment';
import UpdatePatient from './UpdatePatient';
import { useDepartments } from '../../../hooks/queries/useDepartments';

const { Title, Text } = Typography;

const getVietnameseDays = () => {
  const formatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' });
  const days = [];
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + mondayOffset);

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
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + mondayOffset);
  const dayOffset = parseInt(dayKey, 10) - 1;
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + dayOffset);
  return targetDate.toISOString().split('T')[0];
};

const PatientTable = ({
  dataSource = [],
  loading,
  nurseId,
  branchId,
  activeDay,
  setActiveDay,
  onUpdate,
  onDelete,
  onViewDetail,
  onSelectPatient,
  refetch, // Add refetch prop
}) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [allAvailableFoods, setAllAvailableFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState(new Set());
  const [patientOrders, setPatientOrders] = useState({});
  const [quantity, setQuantity] = useState({});
  const [note, setNote] = useState({});
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const categoryRefs = useRef({});
  const { departments } = useDepartments(branchId);

  const currentBranchId = parseInt(branchId || localStorage.getItem('currentBranchId') || '1', 10);
  const createPatientOrderMutation = useCreatePatientOrder();
  const { data: menuData, isLoading: menuLoading, error: menuError, refetch: refreshMenus } = useMenus({
    date: getFormattedDate(activeDay),
    branchId: currentBranchId,
  });

  // Ánh xạ departmentName cho dataSource
  const enrichedDataSource = useMemo(() => {
    if (!Array.isArray(dataSource)) {
      console.warn('⚠️ dataSource is not an array:', dataSource);
      return [];
    }
    return dataSource.map(patient => ({
      ...patient,
      departmentName: departments.find(dept => dept.id === patient.departmentId)?.name || 'Chưa xác định',
    }));
  }, [dataSource, departments]);

  useEffect(() => {
    const fetchMenuAndCategories = async () => {
      try {
        let menuList = menuData?.foods || [];
        let categories = menuData?.categories || [];
        const isMockData = menuData?.isUsingMockData || false;
        setIsUsingMockData(isMockData);

        if (!menuList || !Array.isArray(menuList) || menuList.length === 0) {
          message.warning(`Không có thực đơn cho ngày ${getFormattedDate(activeDay)}`);
          console.error('❌ Menu list is empty or invalid:', menuList);
          setAllAvailableFoods([]);
          setFoodCategories(isMockData ? mockFoodCategories : []);
          return;
        }

        const allMenuFoods = menuList.map(detail => {
          if (!detail.id || isNaN(Number(detail.id))) {
            console.warn(`⚠️ Invalid food ID in menu data:`, detail);
            return null;
          }
          return {
            id: Number(detail.id),
            name: detail.name || 'Unknown Food',
            categoryId: detail.categoryId || 'unknown',
            priceForPatient: Number(detail.priceForPatient || detail.priceForGuest || 0),
            description: detail.description || `From menu on ${getFormattedDate(activeDay)}`,
            imageUrl: detail.imageUrl || '/images/placeholder-food.png',
          };
        }).filter(food => food !== null);

        if (!allMenuFoods.length) {
          console.error('❌ No valid foods after filtering:', allMenuFoods);
          setAllAvailableFoods([]);
          setFoodCategories(isMockData ? mockFoodCategories : []);
          return;
        }

        console.log('🔍 All menu foods in PatientTable:', allMenuFoods);

        setAllAvailableFoods(allMenuFoods);
        setFoodCategories(categories.length > 0 ? categories : isMockData ? mockFoodCategories : []);
        setFilteredFoods(allMenuFoods);
      } catch (error) {
        message.error('Không thể tải thực đơn hoặc danh mục.');
        console.error('❌ Error fetching menu:', error);
        setAllAvailableFoods([]);
        setFoodCategories([]);
        setFilteredFoods([]);
      }
    };

    if (selectedPatient) {
      fetchMenuAndCategories();
    } else {
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

  const vietnameseDays = getVietnameseDays();

  const handleAddToMenu = (record) => {
    if (!record || !record.id || !record.fullName) {
      message.error('Dữ liệu bệnh nhân không hợp lệ.');
      console.error('❌ Invalid patient data:', record);
      return;
    }

    setSelectedPatient({
      id: record.id,
      fullName: record.fullName,
      diseaseCategories: record.diseaseCategories || [],
      admissionDate: record.admissionDate,
      dischargeDate: record.dischargeDate,
      phone: record.phone || '0000000000',
      roomNumber: record.roomNumber || '',
      bedNumber: record.bedNumber || '',
      departmentName: record.departmentName || 'Chưa xác định',
    });

    setPatientOrders(prev => ({ ...prev, [record.id]: [] }));
    setQuantity({});
    setNote({});
    setSelectedFoods(new Set());
    console.log(`🔍 Selected patient: ${record.id}`);
  };

  const handleSubmitOrder = async (record) => {
    if (!selectedPatient || selectedPatient.id !== record.id) {
      message.error('Vui lòng chọn bệnh nhân trước khi đặt món.');
      return;
    }

    if (!selectedFoods.size) {
      message.error('Vui lòng chọn ít nhất một món ăn.');
      return;
    }

    const cartItems = Array.from(selectedFoods).map(foodId => {
      const food = allAvailableFoods.find(f => f.id === foodId);
      if (!food) {
        console.warn(`⚠️ Food not found: ${foodId}`);
        return null;
      }
      return {
        foodId: Number(food.id),
        quantity: Number(quantity[food.id] || 1),
        note: note[food.id] || '',
        food,
      };
    }).filter(item => item !== null && item.foodId > 0 && item.quantity > 0);

    if (!cartItems.length) {
      message.error('Không có món ăn hợp lệ để tạo đơn hàng.');
      console.error('❌ No valid cart items for order creation:', cartItems);
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + Number(item.food.priceForPatient || 0) * item.quantity, 0);

    if (total <= 0) {
      message.error('Tổng giá trị đơn hàng không hợp lệ.');
      console.warn(`⚠️ Invalid total for ${record.fullName}: ${total}`);
      return;
    }

    const orderData = {
      branchId: currentBranchId,
      userId: nurseId || 'NURSE_DEFAULT',
      patientId: Number(record.id),
      isPatientOrder: true,
      orderDate: new Date().toISOString(),
      receiveDate: getFormattedDate(activeDay),
      receiveTime: '12:00',
      receiveType: 'Giao tận nơi',
      type: 'Patient',
      status: 'Confirmed',
      customerName: record.fullName || 'Unknown Patient',
      customerPhone: record.phone || '0000000000',
      customerAddress: `${record.roomNumber || ''} ${record.bedNumber || ''}`.trim() || 'Phòng bệnh nhân',
      total: Number(total),
      shippingFee: 0,
      foodToolFee: 0,
      paymentMethod: 3, // Free
      isPaid: true,
      walletAmountUsed: 0,
      code: `ORD${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      note: `Đơn hàng tự động cho ${record.fullName} ngày ${getFormattedDate(activeDay)}`,
      locationId: null,
      orderDetails: cartItems.map(item => ({
        foodId: Number(item.foodId),
        orderId: 0,
        qty: Number(item.quantity),
        price: Number(item.food.priceForPatient || 0),
        total: Number(item.food.priceForPatient || 0) * item.quantity,
        note: item.note || null,
        foodName: item.food.name || 'Unknown Food',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        food: {
          id: Number(item.foodId),
          name: item.food.name || 'Unknown Food',
          description: item.food.description || '',
          categoryId: Number(item.food.categoryId || 0),
          category: {
            id: Number(item.food.categoryId || 0),
            name: foodCategories.find(cat => cat.id === item.food.categoryId)?.name || 'Món khác',
            imageUrl: foodCategories.find(cat => cat.id === item.food.categoryId)?.imageUrl || '',
            sort: 0,
            branchId: currentBranchId,
          },
          imageUrl: item.food.imageUrl || '',
          isSetDish: false,
          isAddOn: false,
          priceForGuest: Number(item.food.priceForGuest || 0),
          priceForPatient: Number(item.food.priceForPatient || 0),
          priceForStaff: Number(item.food.priceForStaff || 0),
          sort: 0,
          branchId: currentBranchId,
          forPatient: true,
          diseaseCategoryId: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: nurseId || 'NURSE_DEFAULT',
          updatedBy: nurseId || 'NURSE_DEFAULT',
          image: item.food.imageUrl || '',
          setDishDetails: '',
        },
      })),
    };

    console.log(`🚀 Sending order for patient ${record.id}:`, JSON.stringify(orderData, null, 2));

    try {
      await createPatientOrderMutation.mutateAsync({ orderData, branchId: currentBranchId });
      message.success(`Đã tạo đơn hàng cho ${record.fullName} thành công!`);
      setPatientOrders(prev => ({
        ...prev,
        [record.id]: cartItems.map(item => ({
          foodId: item.foodId,
          quantity: item.quantity,
          notes: item.note,
        })),
      }));
      setSelectedFoods(new Set());
      setQuantity({});
      setNote({});
      onSelectPatient(record.id, new Set());
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
      message.error(`Lỗi khi tạo đơn hàng cho ${record.fullName}: ${errorMessage}`);
      console.error(`❌ Order creation failed for ${record.fullName}:`, {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        orderData,
      });
    }
  };

  const handleCheckboxChange = (foodId) => (e) => {
    const newSelectedFoods = new Set(selectedFoods);
    if (e.target.checked) {
      newSelectedFoods.add(foodId);
    } else {
      newSelectedFoods.delete(foodId);
    }
    setSelectedFoods(newSelectedFoods);
    console.log(`🔍 Checkbox changed for food ${foodId}, selectedFoods:`, Array.from(newSelectedFoods));
    if (selectedPatient) {
      onSelectPatient(selectedPatient.id, newSelectedFoods);
    }
  };

  const handleQuantityChange = (foodId) => (value) => {
    setQuantity(prev => ({ ...prev, [foodId]: value || 1 }));
    console.log(`🔍 Quantity changed for food ${foodId}: ${value}`);
  };

  const handleNoteChange = (foodId) => (e) => {
    setNote(prev => ({ ...prev, [foodId]: e.target.value }));
    console.log(`🔍 Note changed for food ${foodId}: ${e.target.value}`);
  };

  const handleDayChange = (value) => {
    setActiveDay(value);
    if (selectedPatient) {
      setFilteredFoods([]);
      setExpandedCategories({});
      refreshMenus();
    }
  };

  const handleEdit = (record) => {
    setEditingPatient(record);
    setEditModalVisible(true);
    form.setFieldsValue({
      ...record,
      admissionDate: record.admissionDate ? moment(record.admissionDate) : null,
      dischargeDate: record.dischargeDate ? moment(record.dischargeDate) : null,
      dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null,
      diseaseCategories: record.diseaseCategories?.map(dc => dc.diseaseCategoryId) || [],
      departmentId: record.departmentId || null,
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      await onUpdate(editingPatient.id, values);
      setEditModalVisible(false);
      form.resetFields();
      refetch(); // Call refetch after successful update
    } catch (error) {
      message.error(`Lỗi khi cập nhật bệnh nhân: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedPatient(record);
    setIsDetailModalVisible(true);
  };

  const groupedFoods = useMemo(() => {
    if (!Array.isArray(filteredFoods) || filteredFoods.length === 0) {
      return {};
    }

    const categoryMap = foodCategories.reduce((map, cat) => {
      map[cat.id] = cat.name;
      return map;
    }, {});

    return filteredFoods.reduce((acc, food) => {
      const categoryName = categoryMap[food.categoryId] || 'Món khác';
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push({
        ...food,
        priceForPatient: Number(food.priceForPatient || 0),
      });
      return acc;
    }, {}, {});
  }, [filteredFoods, foodCategories]);

  const columns = [
    {
      dataIndex: 'medicalRecordNumber',
      align: 'left',
      title: 'Mã Hồ Sơ',
      sorter: (a, b) => (a.medicalRecordNumber || '').localeCompare(b.medicalRecordNumber || ''),
      render: (text) => <span className="text-gray-700 font-medium">{text || '-'}</span>,
    },
    {
      dataIndex: 'fullName',
      align: 'left',
      title: 'Họ Tên',
      primary: true,
      sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
      render: (text) => <span className="text-gray-900 font-semibold">{text || '-'}</span>,
    },
    {
      dataIndex: 'gender',
      align: 'left',
      title: 'Giới Tính',
      render: (text) => <span className="text-gray-700">{text || '-'}</span>,
    },
    {
      dataIndex: 'roomNumber',
      align: 'left',
      title: 'Phòng',
      sorter: (a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || ''),
      render: (text) => <span className="text-gray-700">{text || '-'}</span>,
    },
    {
      dataIndex: 'bedNumber',
      align: 'left',
      title: 'Giường',
      sorter: (a, b) => (a.bedNumber || '').localeCompare(b.bedNumber || ''),
      render: (text) => <span className="text-gray-700">{text || '-'}</span>,
    },
    {
      dataIndex: 'departmentName',
      align: 'left',
      title: 'Phòng Ban',
      sorter: (a, b) => (a.departmentName || '').localeCompare(b.departmentName || ''),
      render: (text) => text || 'Chưa xác định',
    },
    {
      dataIndex: 'diseaseCategories',
      align: 'left',
      title: 'Nhóm Bệnh',
      render: (diseaseCategories) => {
        if (!diseaseCategories || !Array.isArray(diseaseCategories) || diseaseCategories.length === 0) {
          return <span className="text-gray-500 italic">Chưa xác định</span>;
        }
        const diseaseNames = diseaseCategories.map(dc => dc.diseaseCategoryName).join(', ');
        return <span className="text-gray-700">{diseaseNames}</span>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'left',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-blue-600 hover:text-blue-800"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-green-600 hover:text-green-800"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa bệnh nhân"
            description={`Bạn có chắc chắn muốn xóa bệnh nhân ${record.fullName}?`}
            onConfirm={() => onDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ className: 'bg-red-600 hover:bg-red-700' }}
            disabled={String(record.branchId) !== String(branchId)}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-800"
              disabled={String(record.branchId) !== String(branchId)}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: true,
    showSizeChanger: true,
    total: enrichedDataSource.length,
    showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
  };

  if (menuError) {
    console.error('❌ Menu fetch error in PatientTable:', menuError);
    return (
      <ConfigProvider locale={locale}>
        <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
          <Alert
            message="Lỗi tải thực đơn"
            description={menuError?.message || 'Không thể tải thực đơn cho ngày đã chọn.'}
            type="error"
            showIcon
            className="mb-6 rounded-lg shadow-sm"
          />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={locale}>
      <div className="container mx-auto p-6 bg-gray-50 rounded-xl shadow-sm">
        <div className="mb-6">
          <Select
            value={activeDay}
            onChange={handleDayChange}
            className="w-64 h-10 rounded-lg border-gray-300 focus:border-blue-500"
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
          dataSource={enrichedDataSource}
          columns={columns}
          loading={loading}
          listHeader="HỌ TÊN"
          emptyMessage="Không tìm thấy bệnh nhân nào."
          pagination={paginationConfig}
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                onClick={(e) => {
                  onExpand(record, e);
                  if (!expanded) {
                    handleAddToMenu(record);
                  } else {
                    setSelectedPatient(null);
                    onSelectPatient(record.id, new Set());
                  }
                }}
                loading={createPatientOrderMutation.isLoading}
                style={{ cursor: 'pointer', fontSize: '16px', width: '20px', display: 'inline-block' }}
              >
                {expanded ? '−' : '+'}
              </Button>
            ),
            expandedRowRender: (record) => (
              <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                {selectedPatient?.id === record.id && (
                  <>
                    {menuLoading ? (
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
                          onClick={() => handleSubmitOrder(record)}
                          loading={createPatientOrderMutation.isLoading}
                          style={{ marginTop: 16 }}
                        >
                          Đặt món
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
                              style={{
                                border: '1px solid #e8e8e8',
                                borderRadius: '8px',
                                padding: '12px',
                                background: '#fff',
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
                                onClick={() => {
                                  const newOrders = patientOrders[record.id].filter(f => f.foodId !== item.foodId);
                                  setPatientOrders(prev => ({ ...prev, [record.id]: newOrders }));
                                  const newSelectedFoods = new Set(selectedFoods);
                                  newSelectedFoods.delete(item.foodId);
                                  setSelectedFoods(newSelectedFoods);
                                  onSelectPatient(record.id, newSelectedFoods);
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
        <UpdatePatient
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onSubmit={handleEditSubmit}
          initialValues={editingPatient}
          form={form}
          branchId={currentBranchId}
          refetch={refetch} // Pass refetch to UpdatePatient
        />
        <Modal
          title={
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-gray-800">Chi Tiết Bệnh Nhân</span>
            </div>
          }
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button
              key="close"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => setIsDetailModalVisible(false)}
            >
              Đóng
            </Button>,
          ]}
          width={600}
          centered
          destroyOnClose
          className="rounded-xl"
        >
          {selectedPatient ? (
            <Descriptions
              bordered
              column={1}
              labelStyle={{ width: 150, backgroundColor: '#f7fafc', fontWeight: 500 }}
              contentStyle={{ backgroundColor: '#fff' }}
            >
              <Descriptions.Item label="Mã Hồ Sơ">{selectedPatient.medicalRecordNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Họ Tên">{selectedPatient.fullName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Giới Tính">{selectedPatient.gender || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tuổi">{selectedPatient.age || '-'}</Descriptions.Item>
              <Descriptions.Item label="Phòng Ban">{selectedPatient.departmentName || 'Chưa xác định'}</Descriptions.Item>
              <Descriptions.Item label="Phòng">{selectedPatient.roomNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Giường">{selectedPatient.bedNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Vị Trí">{selectedPatient.displayLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="Nhóm Bệnh">
                {selectedPatient.diseaseCategories?.length
                  ? selectedPatient.diseaseCategories.map(dc => dc.diseaseCategoryName).join(', ')
                  : 'Chưa xác định'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Vào Viện">{selectedPatient.admissionDate ? moment(selectedPatient.admissionDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngày Ra Viện">{selectedPatient.dischargeDate ? moment(selectedPatient.dischargeDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
              <Descriptions.Item label="Bác Sĩ Điều Trị">{selectedPatient.attendingPhysician || '-'}</Descriptions.Item>
              <Descriptions.Item label="Trạng Thái">{selectedPatient.isActive ? 'Đang điều trị' : 'Đã xuất viện'}</Descriptions.Item>
              <Descriptions.Item label="Đang Nhập Viện">{selectedPatient.isCurrentlyAdmitted ? 'Có' : 'Không'}</Descriptions.Item>
              <Descriptions.Item label="Cần Giám Sát Dinh Dưỡng">{selectedPatient.requiresDietarySupervision ? 'Có' : 'Không'}</Descriptions.Item>
              <Descriptions.Item label="Ghi Chú">{selectedPatient.notes || 'Không có'}</Descriptions.Item>
              <Descriptions.Item label="Mã Hệ Thống Ngoài">{selectedPatient.externalSystemId || 'Không có'}</Descriptions.Item>
            </Descriptions>
          ) : (
            <p className="text-gray-600">Không có dữ liệu bệnh nhân.</p>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

PatientTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      medicalRecordNumber: PropTypes.string.isRequired,
      fullName: PropTypes.string.isRequired,
      gender: PropTypes.string,
      roomNumber: PropTypes.string,
      bedNumber: PropTypes.string,
      admissionDate: PropTypes.string,
      dischargeDate: PropTypes.string,
      diseaseCategories: PropTypes.arrayOf(
        PropTypes.shape({
          diseaseCategoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          diseaseCategoryName: PropTypes.string,
        })
      ),
      isActive: PropTypes.bool,
      age: PropTypes.number,
      isCurrentlyAdmitted: PropTypes.bool,
      attendingPhysician: PropTypes.string,
      notes: PropTypes.string,
      branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      departmentName: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  nurseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  activeDay: PropTypes.string.isRequired,
  setActiveDay: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
  onSelectPatient: PropTypes.func.isRequired,
  refetch: PropTypes.func, // Add refetch to propTypes
};

export default PatientTable;