import React, { useState, useEffect, useMemo } from 'react';
import { message, Typography, Checkbox, InputNumber, Input, Alert, Spin, DatePicker, Button } from 'antd';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';
import { useDiseaseCategories } from '../../../hooks/queries/useDiseaseCategories';
import { useDiseaseCategoryFoodRestrictions } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { useDepartments } from '../../../hooks/queries/useDepartments';
import { ConfigProvider } from 'antd';
import locale from 'antd/lib/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Text } = Typography;

const getTodayDate = () => dayjs().format('YYYY-MM-DD');

const PatientOrderTable = ({
  dataSource = [],
  loading,
  nurseId,
  branchId,
  onSelectPatient,
  refetch,
  resetTable,
  onQuantityChange,
  onNoteChange,
  receiveDate,
  onReceiveDateChange,
}) => {
  const [selectedPatients, setSelectedPatients] = useState(new Map());
  const [allAvailableFoods, setAllAvailableFoods] = useState({});
  const [filteredFoods, setFilteredFoods] = useState({});
  const [foodCategories, setFoodCategories] = useState([]);
  const [selectedFoodsByPatient, setSelectedFoodsByPatient] = useState({});
  const [quantity, setQuantity] = useState({});
  const [note, setNote] = useState({});
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const { departments } = useDepartments(branchId);
  const currentBranchId = parseInt(branchId || localStorage.getItem('currentBranchId') || '1', 10);

  const { restrictions, isLoading: restrictionsLoading, error: restrictionsError, refetch: refreshRestrictions } = useDiseaseCategoryFoodRestrictions(currentBranchId);
  const { diseaseCategories, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useDiseaseCategories(currentBranchId);

  useEffect(() => {
    console.log('🔍 Restrictions data:', restrictions);
    console.log('🔍 Disease categories:', diseaseCategories);
    console.log('🔍 Selected patients:', selectedPatients);
    console.log('🔍 restrictionsLoading:', restrictionsLoading);
    console.log('🔍 categoriesLoading:', categoriesLoading);
    console.log('🔍 dataSource:', dataSource);
    console.log('🔍 receiveDate:', receiveDate, 'isValid:', dayjs(receiveDate, 'YYYY-MM-DD', true).isValid());
    console.log('🔍 selectedFoodsByPatient:', selectedFoodsByPatient);
  }, [restrictions, diseaseCategories, selectedPatients, restrictionsLoading, categoriesLoading, dataSource, receiveDate, selectedFoodsByPatient]);

  const enrichedDataSource = useMemo(() => {
    if (!Array.isArray(dataSource)) {
      console.warn('⚠️ dataSource is not an array:', dataSource);
      return [];
    }
    if (categoriesLoading) {
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

    const validReceiveDate = dayjs(receiveDate, 'YYYY-MM-DD', true).isValid() ? receiveDate : getTodayDate();

    return dataSource.map(patient => {
      let diseaseCategoryNames = 'Không có nhóm bệnh';
      const patientDiseaseCategoryIds = patient.diseaseCategories?.length
        ? patient.diseaseCategories.map(dc => parseInt(dc.diseaseCategoryId, 10)).filter(id => !isNaN(id))
        : patient.diseaseCategoryIds?.length
          ? patient.diseaseCategoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
          : [];

      if (patientDiseaseCategoryIds.length > 0) {
        diseaseCategoryNames = patientDiseaseCategoryIds
          .map(id => {
            const category = diseaseCategories.find(dc => dc.id === id);
            return category ? category.name : null;
          })
          .filter(name => name)
          .join(', ') || 'Không có nhóm bệnh';
      }

      const isDischarged = patient.dischargeDate && dayjs(patient.dischargeDate).isBefore(dayjs(validReceiveDate), 'day');

      return {
        ...patient,
        departmentName: departments.find(dept => dept.id === patient.departmentId)?.name || 'Chưa xác định',
        diseaseCategoryNames,
        isDischarged,
      };
    });
  }, [dataSource, departments, diseaseCategories, categoriesLoading, receiveDate]);

  const allowedFoodsForPatient = (patient) => {
    if (!patient || (!patient.diseaseCategories?.length && !patient.diseaseCategoryIds?.length)) {
      console.warn(`⚠️ No disease categories for patient ${patient.id}`);
      return [];
    }

    const patientDiseaseCategoryIds = patient.diseaseCategories?.length
      ? patient.diseaseCategories.map(dc => parseInt(dc.diseaseCategoryId, 10)).filter(id => !isNaN(id))
      : patient.diseaseCategoryIds?.length
        ? patient.diseaseCategoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        : [];

    console.log(`🔍 Patient ${patient.id} diseaseCategoryIds:`, patientDiseaseCategoryIds);
    console.log(`🔍 Raw restrictions data:`, restrictions);

    if (!restrictions || restrictions.length === 0) {
      console.warn(`⚠️ No restrictions data available for branch ${currentBranchId}`);
      return [];
    }

    const normalizeMealTime = (mealTime) => {
      const mapping = {
        morning: 'Sáng',
        noon: 'Trưa',
        evening: 'Chiều',
      };
      return Array.isArray(mealTime) ? mealTime.map(mt => mapping[mt.toLowerCase()] || mt) : [mapping[mealTime.toLowerCase()] || mealTime];
    };

    let allowedFoods = restrictions
      .filter(restriction => 
        patientDiseaseCategoryIds.includes(parseInt(restriction.diseaseCategoryId, 10)) &&
        restriction.isActive !== false
      )
      .map(restriction => ({
        id: parseInt(restriction.id, 10),
        name: restriction.nutritionalMealName || `Thực phẩm ID: ${restriction.id}`,
        categoryId: restriction.foodCategoryId || 'unknown',
        priceForPatient: Number(restriction.price || 0),
        description: restriction.reason || 'Không có mô tả',
        imageUrl: restriction.imageUrl || '/images/placeholder-food.png',
        mealTime: normalizeMealTime(restriction.mealTime),
      }));

    allowedFoods = Array.from(new Map(allowedFoods.map(food => [food.id, food])).values());

    console.log(`🔍 Allowed foods for patient ${patient.id}:`, allowedFoods);

    return allowedFoods;
  };

  useEffect(() => {
    const fetchFoodsForPatients = async () => {
      try {
        if (categoriesLoading || restrictionsLoading) {
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

          if (patientData.isDischarged) {
            console.warn(`⚠️ Patient ${patientId} is discharged for receiveDate ${receiveDate}, skipping food fetch`);
            newAllAvailableFoods[patientId] = {};
            newFilteredFoods[patientId] = {};
            return;
          }

          const mealTimes = ['Sáng', 'Trưa', 'Tối'];
          newAllAvailableFoods[patientId] = {};
          newFilteredFoods[patientId] = {};

          const allowedFoods = allowedFoodsForPatient(patientData);
          mealTimes.forEach(mealTime => {
            newAllAvailableFoods[patientId][mealTime] = allowedFoods.filter(food => food.mealTime.includes(mealTime));
            newFilteredFoods[patientId][mealTime] = allowedFoods.filter(food => food.mealTime.includes(mealTime));
          });
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
  }, [selectedPatients, diseaseCategories, restrictions, currentBranchId, categoriesLoading, restrictionsLoading, categoriesError, restrictionsError, dataSource]);

  const groupedFoods = useMemo(() => {
    const result = {};
    selectedPatients.forEach((_, patientId) => {
      const foodsForPatient = filteredFoods[patientId] || {};
      result[patientId] = {};

      const categoryMap = foodCategories.reduce((map, cat) => {
        map[cat.id] = cat.name;
        return map;
      }, {});

      ['Sáng', 'Trưa', 'Tối'].forEach(mealTime => {
        if (!Array.isArray(foodsForPatient[mealTime]) || foodsForPatient[mealTime].length === 0) {
          result[patientId][mealTime] = {};
          return;
        }

        result[patientId][mealTime] = foodsForPatient[mealTime].reduce((acc, food) => {
          const categoryName = categoryMap[food.categoryId] || 'Món khác';
          if (!acc[categoryName]) acc[categoryName] = [];
          acc[categoryName].push({
            ...food,
            priceForPatient: Number(food.priceForPatient || 0),
          });
          return acc;
        }, {});
      });
    });
    return result;
  }, [filteredFoods, foodCategories, selectedPatients]);

  const handleAddToMenu = (record) => {
    if (!record || !record.id || !record.fullName) {
      message.error('Dữ liệu bệnh nhân không hợp lệ.');
      return;
    }

    if (record.isDischarged) {
      message.error('Không thể đặt món vì ngày giao hàng đã qua ngày xuất viện của bệnh nhân.');
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
  };

  const handleCheckboxChange = (patientId, mealTime, foodId) => (e) => {
    const patient = dataSource.find(p => p.id === patientId);
    if (patient.isDischarged) {
      message.error('Không thể chọn món vì ngày giao hàng đã qua ngày xuất viện của bệnh nhân.');
      return;
    }

    const currentSelectedFoods = selectedFoodsByPatient[patientId]?.[mealTime] || [];
    const newSelectedFoods = new Set(currentSelectedFoods.map(food => food.foodId));

    if (e.target.checked) {
      newSelectedFoods.add(foodId);
    } else {
      newSelectedFoods.delete(foodId);
    }

    setSelectedFoodsByPatient(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        [mealTime]: Array.from(newSelectedFoods).map(foodId => ({
          foodId,
          quantity: quantity[`${patientId}-${mealTime}-${foodId}`] || 1,
          note: note[`${patientId}-${mealTime}-${foodId}`] || '',
          mealTime,
        })),
      },
    }));

    onSelectPatient(patientId, newSelectedFoods);
  };

  const handleQuantityChange = (patientId, mealTime, foodId) => (value) => {
    const patient = dataSource.find(p => p.id === patientId);
    if (patient.isDischarged) {
      message.error('Không thể thay đổi số lượng vì ngày giao hàng đã qua ngày xuất viện của bệnh nhân.');
      return;
    }

    const newValue = value || 1;
    setQuantity(prev => ({
      ...prev,
      [`${patientId}-${mealTime}-${foodId}`]: newValue,
    }));

    setSelectedFoodsByPatient(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        [mealTime]: (prev[patientId]?.[mealTime] || []).map(food =>
          food.foodId === foodId ? { ...food, quantity: newValue } : food
        ),
      },
    }));

    if (onQuantityChange) {
      onQuantityChange(patientId, foodId, newValue, mealTime);
    }
  };

  const handleNoteChange = (patientId, mealTime, foodId) => (e) => {
    const patient = dataSource.find(p => p.id === patientId);
    if (patient.isDischarged) {
      message.error('Không thể thêm ghi chú vì ngày giao hàng đã qua ngày xuất viện của bệnh nhân.');
      return;
    }

    const newValue = e.target.value || '';
    setNote(prev => ({
      ...prev,
      [`${patientId}-${mealTime}-${foodId}`]: newValue,
    }));

    setSelectedFoodsByPatient(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        [mealTime]: (prev[patientId]?.[mealTime] || []).map(food =>
          food.foodId === foodId ? { ...food, note: newValue } : food
        ),
      },
    }));

    if (onNoteChange) {
      onNoteChange(patientId, foodId, newValue, mealTime);
    }
  };

  const handleReceiveDateChange = (date, dateString) => {
    console.log('🔍 DatePicker onChange - date:', date, 'dateString:', dateString);
    const validDateString = date && dayjs(date).isValid() ? dayjs(date).format('YYYY-MM-DD') : getTodayDate();
    if (onReceiveDateChange) {
      onReceiveDateChange(validDateString);
    }
    console.log(`🔍 handleReceiveDateChange: Set date to ${validDateString}`);
  };

  const handleExpandRow = (record) => {
    if (record.isDischarged) {
      message.error('Không thể đặt món vì ngày giao hàng đã qua ngày xuất viện của bệnh nhân.');
      return;
    }

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
      onSelectPatient(record.id, new Set());
    }
  };

  useEffect(() => {
    if (resetTable) {
      setSelectedPatients(new Map());
      setSelectedFoodsByPatient({});
      setQuantity({});
      setNote({});
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
  ];

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: true,
    showSizeChanger: true,
    total: enrichedDataSource.length,
    showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
  };

  if (restrictionsError || categoriesError) {
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

  const validReceiveDate = dayjs(receiveDate, 'YYYY-MM-DD', true).isValid() ? receiveDate : getTodayDate();
  console.log('🔍 Rendering DatePicker with validReceiveDate:', validReceiveDate);

  return (
    <ConfigProvider locale={locale}>
      <div className="container mx-auto p-6 bg-gray-50 rounded-xl shadow-sm">
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Text strong>Chọn ngày giao:</Text>
          <DatePicker
            value={dayjs(validReceiveDate, 'YYYY-MM-DD')}
            onChange={handleReceiveDateChange}
            format="DD/MM/YYYY"
            style={{ width: 150 }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            allowClear={false}
            showToday={true}
            getPopupContainer={trigger => trigger.parentElement}
          />
        </div>
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
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandRow(record);
                }}
                style={{ cursor: record.isDischarged ? 'not-allowed' : 'pointer', fontSize: '16px', width: '20px', display: 'inline-block' }}
              >
                {expanded ? '−' : '+'}
              </span>
            ),
            expandedRowRender: (record) => (
              <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                  <Text style={{ color: '#888' }}>
                    Đặt món cho ngày {dayjs(validReceiveDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                  </Text>
                </div>
                {record.isDischarged ? (
                  <Alert
                    message="Không thể đặt món"
                    description="Ngày giao hàng đã qua ngày xuất viện của bệnh nhân."
                    type="warning"
                    showIcon
                  />
                ) : restrictionsLoading || categoriesLoading ? (
                  <p>Đang tải danh sách món ăn...</p>
                ) : (
                  ['Sáng', 'Trưa', 'Chiều'].map(mealTime => (
                    <div key={mealTime} style={{ marginBottom: '24px' }}>
                      <div style={{ textAlign: 'left', marginBottom: '8px' }}>
                        <Text strong>Buổi: {mealTime}</Text>
                      </div>
                      {filteredFoods[record.id]?.[mealTime]?.length === 0 ? (
                        <p>Không có món ăn nào được phép cho bệnh nhân này vào buổi {mealTime}.</p>
                      ) : (
                        <div style={{ paddingLeft: 12, paddingTop: 8 }}>
                          {filteredFoods[record.id]?.[mealTime]?.map(food => (
                            <div
                              key={`${record.id}-${mealTime}-${food.id}`}
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
                                  checked={selectedFoodsByPatient[record.id]?.[mealTime]?.some(item => item.foodId === food.id)}
                                  onChange={handleCheckboxChange(record.id, mealTime, food.id)}
                                  style={{ marginRight: 6 }}
                                  disabled={record.isDischarged}
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
                                value={quantity[`${record.id}-${mealTime}-${food.id}`] || 1}
                                onChange={handleQuantityChange(record.id, mealTime, food.id)}
                                style={{ width: 60 }}
                                disabled={record.isDischarged}
                              />
                              <Input
                                value={note[`${record.id}-${mealTime}-${food.id}`] || ''}
                                onChange={handleNoteChange(record.id, mealTime, food.id)}
                                placeholder="Ghi chú..."
                                style={{ width: 500 }}
                                disabled={record.isDischarged}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
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

PatientOrderTable.propTypes = {
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
  onSelectPatient: PropTypes.func.isRequired,
  refetch: PropTypes.func,
  resetTable: PropTypes.func,
  onQuantityChange: PropTypes.func,
  onNoteChange: PropTypes.func,
  receiveDate: PropTypes.string.isRequired,
  onReceiveDateChange: PropTypes.func.isRequired,
};

export default PatientOrderTable;