import { createElement, useState, useMemo, useRef, useEffect } from 'react';
import { ConfigProvider, Button, Space, Input, Tooltip, Popconfirm, message, Modal, Typography, Image, Select } from 'antd';
import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ReusableTable from '../../../components/common/ReusableTable';
import PropTypes from 'prop-types';
import { getAllowedFoodsForPatient, addOrderForPatient } from '../../../mocks/patientData';
import locale from 'antd/locale/vi_VN';

const { Title, Text } = Typography;

// Custom debounce function
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

const PatientTable = ({ dataSource = [], loading, onView, nurseId }) => { // Remove default - let parent explicitly control loading state
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
  const [activeDay, setActiveDay] = useState('2'); // Default to Tuesday (17/6/2025)
  const categoryRefs = useRef({});

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
    return dataSource.filter(item =>
      (item.FullName || '').toLowerCase().includes(searchLower) ||
      (item.MedicalRecordNumber || '').toLowerCase().includes(searchLower)
    );
  }, [dataSource, searchText]);

  // Debounced search handler
  const debouncedSearch = useMemo(() => debounce((value) => {
    if (value.trim()) {
      message.info(`Lọc bệnh nhân theo: ${value.trim()}`);
    } else {
      message.info('Đã xóa bộ lọc tìm kiếm');
    }
  }, 200), []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleSearchEnter = (value) => {
    setSearchText(value);
    if (value.trim()) {
      message.info(`Lọc bệnh nhân theo: ${value.trim()}`);
    } else {
      message.info('Đã xóa bộ lọc tìm kiếm');
    }
  };

  const handleAddToMenu = async (record) => {
    setSelectedPatient(record);
    try {
      const foods = await getAllowedFoodsForPatient(record.Id, dayToMenuMap[activeDay]);
      setAvailableFoods(foods);
      setSelectedFoods([]);
      setFoodModalVisible(true);
    } catch (error) {
      message.error('Lỗi khi tải danh sách món ăn');
    }
  };

  const handleShowDetails = (food) => {
    setSelectedFood(food);
    const existingOrder = patientOrders[selectedPatient?.Id]?.find(item => item.Id === food.Id);
    if (existingOrder) {
      setQuantity(existingOrder.quantity || 1);
      setNote(existingOrder.note || '');
    } else {
      setQuantity(1);
      setNote('');
    }
    setDetailModalVisible(true);
  };

  const handleAddOrUpdateOrder = () => {
    if (!selectedFood) return;
    const existingOrder = patientOrders[selectedPatient?.Id]?.find(item => item.Id === selectedFood.Id);
    const newFood = {
      ...selectedFood,
      quantity,
      note,
    };

    if (existingOrder) {
      setPatientOrders({
        ...patientOrders,
        [selectedPatient.Id]: patientOrders[selectedPatient.Id].map(item =>
          item.Id === selectedFood.Id ? newFood : item
        ),
      });
      message.success(`${selectedFood.Name} đã được cập nhật!`);
    } else {
      setPatientOrders({
        ...patientOrders,
        [selectedPatient.Id]: [
          ...(patientOrders[selectedPatient.Id] || []),
          newFood,
        ],
      });
      setSelectedFoods([...selectedFoods, selectedFood.Id]);
      message.success(`${selectedFood.Name} đã được thêm!`);
    }
    setDetailModalVisible(false);
  };

  const handleConfirmFoodOrder = async () => {
    if (!selectedFoods.length) {
      message.warning('Vui lòng chọn ít nhất một món ăn');
      return;
    }
    try {
      const result = await addOrderForPatient(selectedPatient.Id, selectedFoods, nurseId, dayToMenuMap[activeDay]);
      if (result.success) {
        message.success(`Đã thêm món ăn cho bệnh nhân ${selectedPatient.FullName} vào ${dayToMenuMap[activeDay]}`);
        setFoodModalVisible(false);
      } else {
        message.error('Lỗi khi thêm món ăn');
      }
    } catch (error) {
      message.error('Lỗi khi thêm món ăn');
    }
  };

  const handleDayChange = async (value) => {
    setActiveDay(value);
    if (selectedPatient) {
      try {
        const foods = await getAllowedFoodsForPatient(selectedPatient.Id, dayToMenuMap[value]);
        setAvailableFoods(foods);
      } catch (error) {
        message.error('Lỗi khi tải danh sách món ăn');
      }
    }
  };

  const groupedFoods = useMemo(() => {
    const diseaseName = selectedPatient?.DiseaseCategoryNames || 'Phù hợp';
    return availableFoods.reduce((acc, food) => {
      if (!acc[diseaseName]) acc[diseaseName] = [];
      acc[diseaseName].push(food);
      return acc;
    }, {});
  }, [availableFoods, selectedPatient]);

  useEffect(() => {
    if (selectedPatient) {
      handleDayChange(activeDay);
    }
  }, [selectedPatient]);

  const columns = [
    {
      title: 'MÃ HỒ SƠ',
      dataIndex: 'MedicalRecordNumber',
      key: 'MedicalRecordNumber',
      sorter: (a, b) => a.MedicalRecordNumber.localeCompare(b.MedicalRecordNumber),
      render: (text) => createElement('span', { className: 'vietnamese-text' }, text || '-'),
    },
    {
      title: 'HỌ TÊN',
      dataIndex: 'FullName',
      key: 'FullName',
      sorter: (a, b) => a.FullName.localeCompare(b.FullName),
      render: (text) => createElement('span', { className: 'vietnamese-text' }, text || '-'),
    },
    {
      title: 'GIỚI TÍNH',
      dataIndex: 'Gender',
      key: 'Gender',
      render: (text) => createElement('span', { className: 'vietnamese-text' }, text || '-'),
    },
    {
      title: 'PHÒNG',
      dataIndex: 'RoomNumber',
      key: 'RoomNumber',
      sorter: (a, b) => a.RoomNumber - b.RoomNumber,
      render: (text) => createElement('span', { className: 'vietnamese-text' }, text || '-'),
    },
    {
      title: 'GIƯỜNG',
      dataIndex: 'BedNumber',
      key: 'BedNumber',
      sorter: (a, b) => a.BedNumber - b.BedNumber,
      render: (text) => createElement('span', { className: 'vietnamese-text' }, text || '-'),
    },
    {
      title: 'NHÓM BỆNH',
      dataIndex: 'DiseaseCategoryNames',
      key: 'DiseaseCategoryNames',
      sorter: (a, b) => (a.DiseaseCategoryNames || '').localeCompare(b.DiseaseCategoryNames || ''),
      render: (text) => createElement('span', { className: 'vietnamese-text' }, text || 'Chưa xác định'),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => createElement(
        'div',
        { className: 'action-buttons' },
        [
          createElement(
            Tooltip,
            { title: 'Xem chi tiết', key: 'view' },
            createElement(
              Button,
              {
                type: 'text',
                icon: createElement(EyeOutlined),
                onClick: () => onView(record),
                className: 'action-btn view-btn',
                size: 'small',
              }
            )
          ),
          createElement(
            Tooltip,
            { title: 'Thêm món ăn', key: 'add-to-menu' },
            createElement(
              Popconfirm,
              {
                title: 'Thêm món ăn',
                description: `Thêm món ăn cho bệnh nhân ${record.FullName}?`,
                onConfirm: () => handleAddToMenu(record),
                okText: 'Thêm',
                cancelText: 'Hủy',
                okButtonProps: { type: 'primary' },
              },
              createElement(
                Button,
                {
                  type: 'text',
                  icon: createElement(PlusOutlined),
                  className: 'action-btn add-btn',
                  size: 'small',
                }
              )
            )
          ),
        ]
      ),
    },
  ];

  return createElement(
    ConfigProvider, { locale },
    createElement(
      'div',
      { className: 'reusable-table-container' },
      [
        createElement(
          'div',
          {
            className: 'reusable-table-header',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              position: 'sticky',
              top: 0,
              background: '#fff',
              zIndex: 10,
              padding: '16px 0',
              borderBottom: '1px solid #f0f0f0',
            }
          },
          [
            createElement(Input, {
              placeholder: 'Tìm kiếm bệnh nhân',
              value: searchText,
              onChange: handleSearch,
              onPressEnter: (e) => handleSearchEnter(e.target.value),
              style: { width: 300 },
              allowClear: true,
              prefix: createElement(SearchOutlined, { style: { fontSize: '16px', color: '#1890ff' } }),
            }),
            createElement(
              'span',
              { style: { fontSize: '14px', color: '#666', fontWeight: '500' } },
              `${filteredData.length} kết quả`
            ),
          ]
        ),
        createElement(ReusableTable, {
          columns,
          dataSource: filteredData,
          loading,
          rowKey: 'Id',
          expandable: {
            expandedRowRender: (record) =>
              patientOrders[record.Id]?.length ? (
                createElement('div', { style: { padding: '16px', background: '#fafafa', borderRadius: '8px' } }, [
                  createElement(Title, { level: 5, style: { marginBottom: '16px', color: '#333' } }, 'Danh sách món ăn đã thêm'),
                  createElement('div', {
                    style: {
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '16px'
                    }
                  },
                    patientOrders[record.Id].map(item => (
                      createElement('div', {
                        key: item.Id,
                        className: 'food-card',
                        style: {
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          padding: '12px',
                          background: '#fff',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          position: 'relative',
                          overflow: 'hidden',
                        }
                      }, [
                        createElement('div', {
                          style: {
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: '#b4c80f',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500',
                          }
                        }, `x${item.quantity || 1}`),
                        createElement(Title, {
                          level: 5,
                          style: {
                            marginBottom: '8px',
                            fontSize: '16px',
                            color: '#222',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        }, item.Name),
                        createElement('div', { style: { marginBottom: '8px' } }, [
                          createElement(Text, {
                            strong: true,
                            style: { fontSize: '14px', color: '#b41400' }
                          }, `${item.PriceForPatient.toLocaleString('vi-VN')}đ`),
                        ]),
                        item.note && createElement(Text, {
                          style: {
                            fontSize: '12px',
                            color: '#666',
                            display: 'block',
                            whiteSpace: 'pre-wrap',
                            marginBottom: '8px'
                          }
                        }, `Ghi chú: ${item.note}`),
                        createElement(Button, {
                          type: 'text',
                          danger: true,
                          size: 'small',
                          style: { position: 'absolute', bottom: '8px', right: '8px' },
                          onClick: () => {
                            setPatientOrders({
                              ...patientOrders,
                              [record.Id]: patientOrders[record.Id].filter(food => food.Id !== item.Id),
                            });
                            setSelectedFoods(selectedFoods.filter(foodId => foodId !== item.Id));
                            message.success(`Đã xóa ${item.Name} khỏi danh sách`);
                          },
                        }, 'Xóa'),
                      ])
                    ))
                  ),
                ])
              ) : (
                createElement('p', { style: { padding: '16px', color: '#666' } }, 'Chưa có món ăn nào được thêm.')
              ),
          },
          pagination: {
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} bệnh nhân`,
          },
          className: 'reusable-table',
        }),
        createElement(Modal, {
          title: `Thêm món ăn cho ${selectedPatient?.FullName}`,
          open: foodModalVisible,
          onCancel: () => setFoodModalVisible(false),
          okText: 'Xác nhận',
          cancelText: 'Hủy',
          centered: true,
          width: 1200,
          footer: [
            createElement(Button, {
              key: 'cancel',
              onClick: () => setFoodModalVisible(false),
            }, 'Hủy'),
            createElement(Button, {
              key: 'submit',
              type: 'primary',
              onClick: handleConfirmFoodOrder,
            }, 'Xác nhận'),
          ],
        }, [
          createElement(Space, { style: { width: '100%', marginBottom: 16 } }, [
            createElement(Select, {
              style: { width: 200 },
              placeholder: 'Chọn ngày',
              value: activeDay,
              onChange: handleDayChange,
              options: vietnameseDays,
            }),
          ]),
          Object.keys(groupedFoods).length > 0 ? (
            createElement('div', {},
              Object.keys(groupedFoods).map(category => (
                createElement('div', {
                  key: category,
                  style: { marginBottom: '32px', paddingTop: '20px', scrollMarginTop: '140px' },
                  ref: (el) => { if (el) categoryRefs.current[category] = el; }
                }, [
                  createElement(Title, {
                    level: 4,
                    style: {
                      marginBottom: '16px',
                      color: '#333',
                      backgroundColor: '#f0f0f0',
                      padding: '8px 16px',
                      borderRadius: '6px'
                    }
                  }, category),
                  createElement('div', {
                    style: {
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '16px'
                    }
                  },
                    groupedFoods[category].map(food => {
                      const isInOrder = patientOrders[selectedPatient?.Id]?.some(item => item.Id === food.Id);
                      return createElement('div', {
                        key: food.Id,
                        className: 'food-card',
                        style: {
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          padding: '12px',
                          background: '#fff',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          position: 'relative',
                        }
                      }, [
                        createElement(Image, {
                          width: '100%',
                          height: 140,
                          src: food.Image || 'https://via.placeholder.com/200x140?text=No+Image',
                          alt: food.Name,
                          preview: false,
                          style: { objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' }
                        }),
                        isInOrder && createElement('div', {
                          style: {
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: '#b4c80f',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500',
                          }
                        }, `x${patientOrders[selectedPatient?.Id]?.find(item => item.Id === food.Id)?.quantity || 1}`),
                        createElement(Title, {
                          level: 5,
                          style: {
                            marginBottom: '8px',
                            fontSize: '16px',
                            color: '#222',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        }, food.Name),
                        createElement('div', { style: { marginBottom: '8px' } }, [
                          createElement(Text, {
                            strong: true,
                            style: { fontSize: '14px', color: '#b41400' }
                          }, `${food.PriceForPatient.toLocaleString('vi-VN')}đ`),
                        ]),
                        createElement(Button, {
                          style: {
                            backgroundColor: '#b4c80f',
                            borderColor: '#b4c80f',
                            color: '#000',
                            width: '100%',
                            padding: '6px 12px',
                            fontSize: '14px',
                            borderRadius: '6px',
                          },
                          type: 'primary',
                          size: 'small',
                          onClick: () => handleShowDetails(food),
                        }, isInOrder ? 'Cập nhật' : 'Thêm'),
                      ]);
                    })
                  ),
                ])
              ))
            )
          ) : (
            createElement(Text, {
              type: 'secondary',
              style: { textAlign: 'center', display: 'block', marginTop: 24 }
            }, 'Không có món ăn phù hợp.')
          ),
        ]),
        createElement(Modal, {
          visible: detailModalVisible,
          onCancel: () => setDetailModalVisible(false),
          footer: null,
          width: 600,
          centered: true,
          closeIcon: createElement('span', { style: { color: '#000', fontSize: '26px' } }, '×'),
          styles: {
            content: { padding: 0, background: '#fff', borderRadius: '8px' },
            body: { padding: 0 },
          },
        }, [
          createElement('div', { style: { borderRadius: '8px 8px 0 0', overflow: 'hidden' } }, [
            createElement('div', {
              style: {
                backgroundColor: '#b4c80f',
                color: '#000',
                padding: '12px 16px',
                fontSize: '18px',
              }
            }, patientOrders[selectedPatient?.Id]?.some(item => item.Id === selectedFood?.Id) ? 'Cập nhật món ăn' : 'Thêm món ăn'),
            selectedFood?.Image && createElement('img', {
              src: selectedFood.Image || 'https://via.placeholder.com/600x250?text=No+Image',
              alt: selectedFood.Name,
              style: { width: '100%', maxHeight: '250px', objectFit: 'cover', display: 'block' },
            }),
            createElement('div', { style: { padding: '12px 16px' } }, [
              createElement(Text, {
                style: { display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }
              }, selectedFood?.Name || 'Không có tên'),
              createElement(Text, {
                style: { display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }
              }, selectedFood?.Description || 'Không có mô tả'),
              createElement(Text, {
                style: { display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#b41400', marginBottom: '12px' }
              }, `${selectedFood?.PriceForPatient.toLocaleString('vi-VN')}đ`),
            ]),
            createElement('div', { style: { padding: '0 16px' } }, [
              createElement(Text, {
                style: { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }
              }, 'Ghi chú:'),
              createElement(Input.TextArea, {
                value: note,
                onChange: (e) => setNote(e.target.value),
                style: { marginBottom: '20px', height: '100px', resize: 'none' },
                placeholder: 'Ghi chú...',
              }),
            ]),
            createElement('div', { style: { textAlign: 'center', marginBottom: '16px' } }, [
              createElement(Button, {
                style: {
                  backgroundColor: '#b4c80f',
                  borderColor: '#b4c80f',
                  color: '#000',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                },
                onClick: () => setQuantity(Math.max(1, quantity - 1)),
              }, '-'),
              createElement('span', { style: { margin: '0 16px', fontSize: '16px' } }, quantity),
              createElement(Button, {
                style: {
                  backgroundColor: '#b4c80f',
                  borderColor: '#b4c80f',
                  color: '#000',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                },
                onClick: () => setQuantity(quantity + 1),
              }, '+'),
            ]),
            createElement('div', { style: { display: 'flex', justifyContent: 'center', padding: '0 16px 16px' } }, [
              createElement(Button, {
                style: {
                  backgroundColor: '#b4c80f',
                  borderColor: '#b4c80f',
                  color: '#000',
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '6px',
                },
                onClick: handleAddOrUpdateOrder,
              }, patientOrders[selectedPatient?.Id]?.some(item => item.Id === selectedFood?.Id) ? 'Cập nhật món ăn' : 'Thêm món ăn'),
            ]),
          ]),
        ]),
      ]
    )
  );
};

PatientTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      Id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      MedicalRecordNumber: PropTypes.string.isRequired,
      FullName: PropTypes.string.isRequired,
      Gender: PropTypes.string,
      RoomNumber: PropTypes.number,
      BedNumber: PropTypes.number,
      DiseaseCategoryNames: PropTypes.string,
      IsActive: PropTypes.bool,
    })
  ),
  loading: PropTypes.bool,
  onView: PropTypes.func,
  nurseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default PatientTable;