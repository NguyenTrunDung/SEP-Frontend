import React, { useState, useEffect, useMemo, useRef } from 'react';
import { message, Button, Typography, Checkbox, InputNumber, Input, Space, Form, Tooltip, Popconfirm, Alert, Spin, Select } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';
import { useDiseaseCategories } from '../../../hooks/queries/useDiseaseCategories';
import { useDiseaseCategoryFoodRestrictions } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { useDepartments } from '../../../hooks/queries/useDepartments';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/vi_VN';
import moment from 'moment';
import UpdatePatient from './UpdatePatient';
import PatientDetailPopup from './PatientDetailPopup';

const { Title, Text } = Typography;

const PatientTable = ({
  dataSource = [],
  loading,
  nurseId,
  branchId,
  onUpdate,
  onDelete,
  onViewDetail,
  onSelectPatient,
  refetch,
  foods = [],
  activeDay,
  setActiveDay,
  resetTable,
  onQuantityChange,
  onNoteChange,
}) => {
  const [selectedPatients, setSelectedPatients] = useState(new Map());
  const [allAvailableFoods, setAllAvailableFoods] = useState({});
  const [filteredFoods, setFilteredFoods] = useState({});
  const [foodCategories, setFoodCategories] = useState([]);
  const [selectedFoodsByPatient, setSelectedFoodsByPatient] = useState({});
  const [patientOrders, setPatientOrders] = useState({});
  const [quantity, setQuantity] = useState({});
  const [note, setNote] = useState({});
  const [mealTimeFilter, setMealTimeFilter] = useState({}); // Store mealTime filter per patient
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const categoryRefs = useRef({});
  const { departments } = useDepartments(branchId);
  const currentBranchId = parseInt(branchId || localStorage.getItem('currentBranchId') || '1', 10);

  const { restrictions, isLoading: restrictionsLoading, error: restrictionsError, refetch: refreshRestrictions } = useDiseaseCategoryFoodRestrictions(currentBranchId);
  const { diseaseCategories, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useDiseaseCategories(currentBranchId);

  useEffect(() => {
    console.log('🔍 Restrictions data:', restrictions);
    console.log('🔍 Disease categories:', diseaseCategories);
    console.log('🔍 Foods:', foods);
    console.log('🔍 Selected patients:', selectedPatients);
    console.log('🔍 restrictionsLoading:', restrictionsLoading);
    console.log('🔍 categoriesLoading:', categoriesLoading);
    console.log('🔍 dataSource:', dataSource);
  }, [restrictions, diseaseCategories, foods, selectedPatients, restrictionsLoading, categoriesLoading, dataSource]);

  const enrichedDataSource = useMemo(() => {
    if (!Array.isArray(dataSource)) {
      console.warn('⚠️ dataSource is not an array:', dataSource);
      return [];
    }
    if (categoriesLoading) {
      console.log('⏳ Waiting for diseaseCategories to load...');
      return dataSource.map(patient => ({
        ...patient,
        departmentName: departments.find(dept => dept.id === patient.departmentId)?.name || 'Chưa xác định',
        diseaseCategoryNames: 'Đang tải...',
      }));
    }
    if (!diseaseCategories || diseaseCategories.length === 0) {
      console.warn('⚠️ diseaseCategories is empty:', diseaseCategories);
      return dataSource.map(patient => ({
        ...patient,
        departmentName: departments.find(dept => dept.id === patient.departmentId)?.name || 'Chưa xác định',
        diseaseCategoryNames: 'Không có nhóm bệnh',
      }));
    }

    return dataSource.map(patient => {
      let diseaseCategoryNames = 'Không có nhóm bệnh';
      if (Array.isArray(patient.diseaseCategories) && patient.diseaseCategories.length > 0) {
        diseaseCategoryNames = patient.diseaseCategories
          .map(dc => dc.diseaseCategoryName)
          .filter(name => name)
          .join(', ') || 'Không có nhóm bệnh';
      } else if (Array.isArray(patient.diseaseCategoryIds) && patient.diseaseCategoryIds.length > 0) {
        const diseaseCategoryIds = patient.diseaseCategoryIds
          .map(id => parseInt(id, 10))
          .filter(id => !isNaN(id));
        console.log(`🔍 Patient ${patient.id} diseaseCategoryIds:`, diseaseCategoryIds);
        diseaseCategoryNames = diseaseCategoryIds
          .map(id => {
            const category = diseaseCategories.find(dc => dc.id === id);
            return category ? category.name : null;
          })
          .filter(name => name)
          .join(', ') || 'Không có nhóm bệnh';
      }

      return {
        ...patient,
        departmentName: departments.find(dept => dept.id === patient.departmentId)?.name || 'Chưa xác định',
        diseaseCategoryNames,
      };
    });
  }, [dataSource, departments, diseaseCategories, categoriesLoading]);

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

  const allowedFoodsForPatient = (patient, selectedMealTime) => {
    if (!patient || (!patient.diseaseCategories?.length && !patient.diseaseCategoryIds?.length)) {
      return [];
    }
    const patientDiseaseCategoryIds = patient.diseaseCategories?.length
      ? patient.diseaseCategories.map(dc => parseInt(dc.diseaseCategoryId, 10)).filter(id => !isNaN(id))
      : patient.diseaseCategoryIds?.length
        ? patient.diseaseCategoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        : [];
    
    let allowedFoods = restrictions
      ?.filter(restriction => 
        patientDiseaseCategoryIds.includes(restriction.diseaseCategoryId) &&
        (!selectedMealTime || restriction.mealTime === selectedMealTime)
      )
      ?.map(restriction => ({
        id: restriction.nutritionalMealCode, // Use nutritionalMealCode as ID
        name: restriction.nutritionalMealName || `Thực phẩm ID: ${restriction.nutritionalMealCode}`,
        categoryId: restriction.diseaseCategoryId || 'unknown',
        priceForPatient: Number(restriction.price || 0),
        description: restriction.description || 'No description available',
        imageUrl: restriction.imageUrl || '/images/placeholder-food.png',
        mealTime: restriction.mealTime, // Include mealTime
      })) || [];

    return Array.from(new Map(allowedFoods.map(food => [food.id, food])).values());
  };

  useEffect(() => {
    const fetchFoodsForPatients = async () => {
      try {
        if (categoriesLoading || restrictionsLoading) {
          console.log('⏳ Waiting for data to load...');
          message.info('Đang tải danh sách món ăn...');
          return;
        }

        if (!Array.isArray(diseaseCategories) || diseaseCategories.length === 0) {
          message.error('Không có nhóm bệnh nào khả dụng trong hệ thống.');
          console.warn('⚠️ Disease categories data is empty or invalid:', diseaseCategories);
          setAllAvailableFoods({});
          setFilteredFoods({});
          setFoodCategories([]);
          return;
        }

        const categories = diseaseCategories.map(category => ({
          id: category.id,
          name: category.name || `Category ${category.id}`,
          imageUrl: category.imageUrl || '',
          sort: category.sort || 0,
          branchId: currentBranchId,
        }));

        const newAllAvailableFoods = {};
        const newFilteredFoods = {};

        selectedPatients.forEach((patient, patientId) => {
          const patientData = dataSource.find(p => p.id === patientId);
          if (!patientData) {
            console.warn(`⚠️ Patient not found: ${patientId}`);
            return;
          }

          const patientDiseaseCategoryIds = patientData.diseaseCategoryIds?.length
            ? patientData.diseaseCategoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
            : patientData.diseaseCategories?.length
              ? patientData.diseaseCategories.map(dc => parseInt(dc.diseaseCategoryId, 10)).filter(id => !isNaN(id))
              : [];

          if (!patientDiseaseCategoryIds.length) {
            console.warn(`⚠️ No diseaseCategoryIds for patient ${patientId}`);
            newAllAvailableFoods[patientId] = [];
            newFilteredFoods[patientId] = [];
            return;
          }

          const selectedMealTime = mealTimeFilter[patientId] || 'morning';
          const allowedFoods = allowedFoodsForPatient(patientData, selectedMealTime);
          
          if (!allowedFoods.length) {
            console.warn(`⚠️ No allowed foods found for patient ${patientId} for mealTime ${selectedMealTime}`);
            newAllAvailableFoods[patientId] = [];
            newFilteredFoods[patientId] = [];
            return;
          }

          newAllAvailableFoods[patientId] = allowedFoods;
          newFilteredFoods[patientId] = allowedFoods;
        });

        setAllAvailableFoods(newAllAvailableFoods);
        setFilteredFoods(newFilteredFoods);
        setFoodCategories(categories.length > 0 ? categories : [{ id: 'unknown', name: 'Món khác', imageUrl: '', sort: 0, branchId: currentBranchId }]);
        console.log('🔍 All available foods:', newAllAvailableFoods);
        console.log('🔍 Filtered foods:', newFilteredFoods);
        console.log('🔍 Food categories set:', categories);
      } catch (error) {
        message.error('Không thể tải danh sách món ăn. Vui lòng thử lại.');
        console.error('❌ Error fetching foods:', error);
        setAllAvailableFoods({});
        setFilteredFoods({});
        setFoodCategories([]);
      }
    };

    if (selectedPatients.size && !categoriesError && !restrictionsError) {
      fetchFoodsForPatients();
    } else {
      setAllAvailableFoods({});
      setFilteredFoods({});
      setFoodCategories([]);
      setSelectedFoodsByPatient({});
      setQuantity({});
      setNote({});
      if (categoriesError) {
        message.error('Lỗi khi tải danh sách nhóm bệnh.');
        console.error('❌ Categories error:', categoriesError);
      }
      if (restrictionsError) {
        message.error('Lỗi khi tải danh sách món ăn được phép.');
        console.error('❌ Restrictions error:', restrictionsError);
      }
    }
  }, [selectedPatients, diseaseCategories, restrictions, currentBranchId, categoriesLoading, restrictionsLoading, categoriesError, restrictionsError, dataSource, foods, mealTimeFilter]);

  const groupedFoods = useMemo(() => {
    const result = {};
    selectedPatients.forEach((_, patientId) => {
      const foodsForPatient = filteredFoods[patientId] || [];
      if (!Array.isArray(foodsForPatient) || foodsForPatient.length === 0) {
        console.log(`⚠️ filteredFoods is empty or not an array for patient ${patientId}:`, foodsForPatient);
        result[patientId] = {};
        return;
      }

      const categoryMap = foodCategories.reduce((map, cat) => {
        map[cat.id] = cat.name;
        return map;
      }, {});
      console.log(`🔍 Category map for patient ${patientId}:`, categoryMap);

      result[patientId] = foodsForPatient.reduce((acc, food) => {
        const categoryName = categoryMap[food.categoryId] || 'Món khác';
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push({
          ...food,
          priceForPatient: Number(food.priceForPatient || 0),
        });
        return acc;
      }, {});
      console.log(`🔍 Grouped foods for patient ${patientId}:`, result[patientId]);
    });
    return result;
  }, [filteredFoods, foodCategories, selectedPatients]);

  const handleAddToMenu = (record) => {
    if (!record || !record.id || !record.fullName) {
      message.error('Dữ liệu bệnh nhân không hợp lệ.');
      console.error('❌ Invalid patient data:', record);
      return;
    }

    const patientData = {
      id: record.id,
      fullName: record.fullName,
      diseaseCategories: Array.isArray(record.diseaseCategories) ? record.diseaseCategories : [],
      diseaseCategoryIds: Array.isArray(record.diseaseCategoryIds)
        ? record.diseaseCategoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        : [],
      admissionDate: record.admissionDate,
      dischargeDate: record.dischargeDate,
      phone: record.phone || '0000000000',
      roomNumber: record.roomNumber || '',
      bedNumber: record.bedNumber || '',
      departmentName: record.departmentName || 'Chưa xác định',
      diseaseCategoryNames: record.diseaseCategoryNames,
    };

    setSelectedPatients(prev => new Map(prev).set(record.id, patientData));
    setPatientOrders(prev => ({ ...prev, [record.id]: [] }));
    setMealTimeFilter(prev => ({ ...prev, [record.id]: 'morning' })); // Default to morning
    console.log(`🔍 Added patient ${record.id} to selectedPatients:`, patientData);
  };

  const handleCheckboxChange = (patientId, foodId, mealTime) => (e) => {
    const currentSelectedFoods = selectedFoodsByPatient[patientId] || [];
    const newSelectedFoods = new Set(currentSelectedFoods.map(food => food.foodId));

    if (e.target.checked) {
      newSelectedFoods.add(foodId);
    } else {
      newSelectedFoods.delete(foodId);
    }

    // Update local state with mealTime
    setSelectedFoodsByPatient(prev => ({
      ...prev,
      [patientId]: Array.from(newSelectedFoods).map(foodId => ({
        foodId,
        quantity: quantity[`${patientId}-${foodId}`] || 1,
        note: note[`${patientId}-${foodId}`] || '',
        mealTime: mealTime || (filteredFoods[patientId]?.find(f => f.id === foodId)?.mealTime || 'morning'),
      })),
    }));

    console.log(`🔍 Checkbox changed for patient ${patientId}, food ${foodId}, mealTime ${mealTime}, selectedFoods:`, Array.from(newSelectedFoods));

    // Call parent callback with the Set of food IDs
    onSelectPatient(patientId, newSelectedFoods);
  };

  const handleQuantityChange = (patientId, foodId) => (value) => {
    const newValue = value || 1;

    // Update local state for immediate UI feedback
    setQuantity(prev => ({
      ...prev,
      [`${patientId}-${foodId}`]: newValue,
    }));

    // Update selectedFoodsByPatient with quantity
    setSelectedFoodsByPatient(prev => ({
      ...prev,
      [patientId]: (prev[patientId] || []).map(food =>
        food.foodId === foodId ? { ...food, quantity: newValue } : food
      ),
    }));

    // Call parent callback
    if (onQuantityChange) {
      onQuantityChange(patientId, foodId, newValue);
    }

    console.log(`🔍 Quantity changed for patient ${patientId}, food ${foodId}:`, newValue);
  };

  const handleNoteChange = (patientId, foodId) => (e) => {
    const newValue = e.target.value || '';

    // Update local state for immediate UI feedback
    setNote(prev => ({
      ...prev,
      [`${patientId}-${foodId}`]: newValue,
    }));

    // Update selectedFoodsByPatient with note
    setSelectedFoodsByPatient(prev => ({
      ...prev,
      [patientId]: (prev[patientId] || []).map(food =>
        food.foodId === foodId ? { ...food, note: newValue } : food
      ),
    }));

    // Call parent callback
    if (onNoteChange) {
      onNoteChange(patientId, foodId, newValue);
    }

    console.log(`🔍 Note changed for patient ${patientId}, food ${foodId}:`, newValue);
  };

  const handleMealTimeChange = (patientId, value) => {
    setMealTimeFilter(prev => ({
      ...prev,
      [patientId]: value,
    }));

    // Update filtered foods based on new mealTime
    const patientData = dataSource.find(p => p.id === patientId);
    if (patientData) {
      const allowedFoods = allowedFoodsForPatient(patientData, value);
      setFilteredFoods(prev => ({
        ...prev,
        [patientId]: allowedFoods,
      }));
    }

    console.log(`🔍 Meal time changed for patient ${patientId}: ${value}`);
  };

  const handleEdit = (record) => {
    setEditingPatient({
      ...record,
      diseaseCategories: Array.isArray(record.diseaseCategories) ? record.diseaseCategories : [],
      diseaseCategoryIds: Array.isArray(record.diseaseCategoryIds)
        ? record.diseaseCategoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        : [],
    });
    setEditModalVisible(true);
    form.setFieldsValue({
      ...record,
      admissionDate: record.admissionDate ? moment(record.admissionDate) : null,
      dischargeDate: record.dischargeDate ? moment(record.dischargeDate) : null,
      dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null,
      diseaseCategories: Array.isArray(record.diseaseCategories)
        ? record.diseaseCategories.map(dc => String(dc.diseaseCategoryId))
        : Array.isArray(record.diseaseCategoryIds)
          ? record.diseaseCategoryIds.map(id => String(id))
          : [],
      departmentId: record.departmentId ? String(record.departmentId) : null,
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      await onUpdate(editingPatient.id, values);
      setEditModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error(`Lỗi khi cập nhật bệnh nhân: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleViewDetail = (record) => {
    setEditingPatient({
      ...record,
      diseaseCategories: Array.isArray(record.diseaseCategories) ? record.diseaseCategories : [],
      diseaseCategoryIds: Array.isArray(record.diseaseCategoryIds)
        ? record.diseaseCategoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        : [],
    });
    setIsDetailModalVisible(true);
  };

  const handleExpandRow = (record) => {
    const newExpandedRowKeys = expandedRowKeys.includes(record.id)
      ? expandedRowKeys.filter(key => key !== record.id)
      : [...expandedRowKeys, record.id];

    setExpandedRowKeys(newExpandedRowKeys);

    if (!expandedRowKeys.includes(record.id)) {
      handleAddToMenu(record);
    } else {
      setSelectedPatients(prev => {
        const newMap = new Map(prev);
        newMap.delete(record.id);
        return newMap;
      });
      setSelectedFoodsByPatient(prev => {
        const newState = { ...prev };
        delete newState[record.id];
        return newState;
      });
      setPatientOrders(prev => {
        const newState = { ...prev };
        delete newState[record.id];
        return newState;
      });
      setMealTimeFilter(prev => {
        const newState = { ...prev };
        delete newState[record.id];
        return newState;
      });
      onSelectPatient(record.id, new Set());
    }
  };

  // Reset table states when called from PatientComponent
  useEffect(() => {
    if (resetTable) {
      setSelectedPatients(new Map());
      setSelectedFoodsByPatient({});
      setPatientOrders({});
      setQuantity({});
      setNote({});
      setMealTimeFilter({});
      setExpandedRowKeys([]);
    }
  }, [resetTable]);

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
      dataIndex: 'diseaseCategoryNames',
      align: 'left',
      title: 'Nhóm Bệnh',
      render: (text) => (
        <span className="text-gray-700">{text || 'Không có nhóm bệnh'}</span>
      ),
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

  const mealTimeOptions = [
    { value: 'morning', label: 'Buổi sáng' },
    { value: 'noon', label: 'Buổi trưa' },
    { value: 'evening', label: 'Buổi tối' },
  ];

  if (restrictionsError || categoriesError) {
    console.error('❌ Errors in PatientTable:', { restrictionsError, categoriesError });
    return (
      <ConfigProvider locale={locale}>
        <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
          <Alert
            message="Lỗi tải dữ liệu"
            description={restrictionsError?.message || categoriesError?.message || 'Không thể tải danh sách nhóm bệnh hoặc món ăn được phép.'}
            type="error"
            showIcon
            className="mb-6 rounded-lg shadow-sm"
          />
          <Button
            type="primary"
            onClick={() => {
              refetchCategories();
              refreshRestrictions();
            }}
          >
            Thử lại
          </Button>
        </div>
      </ConfigProvider>
    );
  }

  if (restrictionsLoading || categoriesLoading) {
    return (
      <ConfigProvider locale={locale}>
        <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
          <Spin tip="Đang tải dữ liệu..." />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={locale}>
      <div className="container mx-auto p-6 bg-gray-50 rounded-xl shadow-sm">
        <ReusableTableV2
          dataSource={enrichedDataSource}
          columns={columns}
          loading={loading}
          listHeader="HỌ TÊN"
          emptyMessage="Không tìm thấy bệnh nhân nào."
          pagination={paginationConfig}
          rowKey="id"
          expandable={{
            expandedRowKeys: expandedRowKeys,
            onExpandedRowsChange: setExpandedRowKeys,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandRow(record);
                }}
                style={{ cursor: 'pointer', fontSize: '16px', width: '20px', display: 'inline-block' }}
              >
                {expanded ? '−' : '+'}
              </Button>
            ),
            expandedRowRender: (record) => (
              <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                <>
                  {restrictionsLoading || categoriesLoading ? (
                    <p>Đang tải danh sách món ăn...</p>
                  ) : filteredFoods[record.id]?.length === 0 ? (
                    <div>
                      <p>Không có món ăn nào được phép cho bệnh nhân này ở buổi ăn được chọn.</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <Select
                          placeholder="Chọn buổi ăn"
                          value={mealTimeFilter[record.id] || 'morning'}
                          onChange={(value) => handleMealTimeChange(record.id, value)}
                          style={{ width: 150, marginBottom: 16 }}
                          options={mealTimeOptions}
                        />
                        <div style={{ paddingLeft: 12, paddingTop: 8 }}>
                          {filteredFoods[record.id]?.map(food => (
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
                                  checked={selectedFoodsByPatient[record.id]?.some(item => item.foodId === food.id)}
                                  onChange={handleCheckboxChange(record.id, food.id, food.mealTime)}
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
                                value={quantity[`${record.id}-${food.id}`] || 1}
                                onChange={handleQuantityChange(record.id, food.id)}
                                style={{ width: 60 }}
                              />
                              <Input
                                value={note[`${record.id}-${food.id}`] || ''}
                                onChange={handleNoteChange(record.id, food.id)}
                                placeholder="Ghi chú..."
                                style={{ width: 500 }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedFoodsByPatient[record.id]?.length > 0 && (
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
                            {selectedFoodsByPatient[record.id].map(item => (
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
                                  {filteredFoods[record.id]?.find(f => f.id === item.foodId)?.name || 'Không xác định'}
                                </Title>
                                <div style={{ marginBottom: '8px' }}>
                                  <Text
                                    strong
                                    style={{ fontSize: '14px', color: '#b41400' }}
                                  >
                                    {filteredFoods[record.id]?.find(f => f.id === item.foodId)?.priceForPatient?.toLocaleString('vi-VN') || '0'}đ
                                  </Text>
                                </div>
                                <Text
                                  style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    display: 'block',
                                    marginBottom: '8px',
                                  }}
                                >
                                  Buổi ăn: {mealTimeOptions.find(opt => opt.value === item.mealTime)?.label || 'Không xác định'}
                                </Text>
                                {item.note && (
                                  <Text
                                    style={{
                                      fontSize: '12px',
                                      color: '#666',
                                      display: 'block',
                                      whiteSpace: 'pre-wrap',
                                      marginBottom: '8px',
                                    }}
                                  >
                                    Ghi chú: {item.note}
                                  </Text>
                                )}
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  onClick={() => {
                                    const newOrders = selectedFoodsByPatient[record.id].filter(f => f.foodId !== item.foodId);
                                    setPatientOrders(prev => ({ ...prev, [record.id]: newOrders }));
                                    const newSelectedFoods = new Set(selectedFoodsByPatient[record.id].map(item => item.foodId));
                                    newSelectedFoods.delete(item.foodId);
                                    setSelectedFoodsByPatient(prev => ({
                                      ...prev,
                                      [record.id]: prev[record.id].filter(foodItem => foodItem.foodId !== item.foodId),
                                    }));
                                    onSelectPatient(record.id, newSelectedFoods);
                                    message.success(`Đã xóa ${filteredFoods[record.id]?.find(f => f.id === item.foodId)?.name || 'món ăn'} khỏi danh sách`);
                                  }}
                                >
                                  Xóa
                                </Button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
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
          refetch={refetch}
        />
        <PatientDetailPopup
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          patient={editingPatient}
        />
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
      diseaseCategoryIds: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
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
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
  onSelectPatient: PropTypes.func.isRequired,
  refetch: PropTypes.func,
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      priceForPatient: PropTypes.number,
      description: PropTypes.string,
      imageUrl: PropTypes.string,
      mealTime: PropTypes.string, // Added mealTime
    })
  ),
  activeDay: PropTypes.string,
  setActiveDay: PropTypes.func,
  resetTable: PropTypes.func,
  onQuantityChange: PropTypes.func,
  onNoteChange: PropTypes.func,
};

export default PatientTable;