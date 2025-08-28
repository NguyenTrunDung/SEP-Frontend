import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Input, Tooltip, Popconfirm, Modal, Descriptions, Spin, message, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';
import { useTimezone } from '../../../hooks/useTimezone';

const DiseaseCategoryFoodRestrictionsTable = ({
    dataSource = [],
    loading,
    onEdit,
    onDelete,
    className,
    diseaseCategories = [],
    nutritionalMeals = [],
    ...rest
}) => {
    const { format } = useTimezone();
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [selectedDiseaseCategory, setSelectedDiseaseCategory] = useState(null);
    const [selectedMealTime, setSelectedMealTime] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRestriction, setSelectedRestriction] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Debug log để kiểm tra dữ liệu
    useMemo(() => {
        console.log('🔍 DiseaseCategoryFoodRestrictions dataSource:', dataSource);
        console.log('🔍 DiseaseCategories:', diseaseCategories);
        console.log('🔍 NutritionalMeals:', nutritionalMeals);
    }, [dataSource, diseaseCategories, nutritionalMeals]);

    // Debounce search text
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 1000);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchText]);

    // Create disease category options for filter
    const diseaseCategoryOptions = useMemo(() => {
        return [
            { value: null, label: 'Tất cả danh mục bệnh' },
            ...diseaseCategories.map(category => ({
                value: category.id,
                label: category.name,
                color: category.colorCode
            }))
        ];
    }, [diseaseCategories]);

    // Create meal time options for filter
    const mealTimeOptions = useMemo(() => {
        return [
            { value: null, label: 'Tất cả buổi ăn' },
            { value: 'morning', label: 'Sáng' },
            { value: 'noon', label: 'Trưa' },
            { value: 'evening', label: 'Chiều' },
        ];
    }, []);

    const filteredData = useMemo(() => {
        let filtered = dataSource;

        // Filter by search text
        if (searchText) {
            filtered = filtered.filter(item =>
                item.nutritionalMealName?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.diseaseCategoryName?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.reason?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by disease category
        if (selectedDiseaseCategory !== null) {
            filtered = filtered.filter(item => item.diseaseCategoryId === selectedDiseaseCategory);
        }

        // Filter by meal time
        if (selectedMealTime !== null) {
            filtered = filtered.filter(item => item.mealTime === selectedMealTime);
        }

        return filtered;
    }, [dataSource, searchText, selectedDiseaseCategory, selectedMealTime]);

    // Handle debounced search notifications
    useEffect(() => {
        if (debouncedSearchText && debouncedSearchText.trim()) {
            const searchResults = dataSource.filter(item => {
                let matches = item.nutritionalMealName?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                    item.diseaseCategoryName?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                    item.reason?.toLowerCase().includes(debouncedSearchText.toLowerCase());

                if (selectedDiseaseCategory !== null) {
                    matches = matches && item.diseaseCategoryId === selectedDiseaseCategory;
                }
                if (selectedMealTime !== null) {
                    matches = matches && item.mealTime === selectedMealTime;
                }
                return matches;
            });
        }
    }, [debouncedSearchText, dataSource, selectedDiseaseCategory, selectedMealTime]);

    const handleEdit = (record) => {
        console.log('✏️ Editing restriction:', record);
        if (onEdit) {
            onEdit(record);
        }
    };

    const handleDelete = (record) => {
        console.log('🗑️ Deleting restriction:', record);
        if (onDelete) {
            onDelete(record);
        } else {
            message.success(`Đã xóa hạn chế thực phẩm cho ${record.nutritionalMealName}`);
        }
    };

    const handleViewDetails = async (record) => {
        setModalLoading(true);
        setIsModalVisible(true);
        setSelectedRestriction(record);
        setModalLoading(false);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedRestriction(null);
        setModalLoading(false);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchText(value);

        if (!value && searchText) {
            message.success('Đã xóa bộ lọc tìm kiếm');
        }
    };

    const handleDiseaseCategoryFilter = (value) => {
        setSelectedDiseaseCategory(value);
        if (value !== null) {
            const categoryName = diseaseCategoryOptions.find(option => option.value === value)?.label;
            message.info(`Lọc theo danh mục bệnh: ${categoryName}`);
        } else {
            message.info('Đã xóa bộ lọc danh mục bệnh');
        }
    };

    const handleMealTimeFilter = (value) => {
        setSelectedMealTime(value);
        if (value !== null) {
            const mealTimeName = mealTimeOptions.find(option => option.value === value)?.label;
            message.info(`Lọc theo buổi ăn: ${mealTimeName}`);
        } else {
            message.info('Đã xóa bộ lọc buổi ăn');
        }
    };

    const clearAllFilters = () => {
        setSearchText('');
        setDebouncedSearchText('');
        setSelectedDiseaseCategory(null);
        setSelectedMealTime(null);
        message.success('Đã xóa tất cả bộ lọc');
    };

    const columns = [
        {
            title: 'TÊN MÓN ĂN',
            dataIndex: 'nutritionalMealName',
            key: 'nutritionalMealName',
            sorter: (a, b) => (a.nutritionalMealName || '').localeCompare(b.nutritionalMealName || ''),
            render: (name) => <span className="vietnamese-text">{name || '-'}</span>,
            align: 'center',
        },
        {
            title: 'GIÁ TIỀN',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
            render: (price) => <span className="vietnamese-text">{price ? `${format.currency(price)} VNĐ` : '-'}</span>,
            align: 'center',
        },
        {
            title: 'BUỔI ĂN',
            dataIndex: 'mealTime',
            key: 'mealTime',
            sorter: (a, b) => (a.mealTime || '').localeCompare(b.mealTime || ''),
            render: (mealTime) => {
                const mealTimeDisplay = {
                    morning: 'Sáng',
                    noon: 'Trưa',
                    evening: 'Chiều',
                }[mealTime] || '-';
                return <span className="vietnamese-text">{mealTimeDisplay}</span>;
            },
            align: 'center',
        },
        {
            title: 'DANH MỤC BỆNH',
            dataIndex: 'diseaseCategoryName',
            key: 'diseaseCategoryName',
            render: (diseaseCategoryName, record) => {
                const category = diseaseCategories.find(cat => cat.id === record.diseaseCategoryId);
                return (
                    <div>
                        <span className="vietnamese-text">{diseaseCategoryName || 'Chưa chọn danh mục'}</span>
                    </div>
                );
            },
            align: 'center',
        },
        {
            title: 'LÝ DO',
            dataIndex: 'reason',
            key: 'reason',
            render: (reason) => (
                <span className="vietnamese-text" style={{ fontSize: '12px' }}>
                    {reason ? (reason.length > 50 ? `${reason.substring(0, 50)}...` : reason) : '-'}
                </span>
            ),
            align: 'center',
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
            align: 'center',
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'actions',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <div className="">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa hạn chế thực phẩm"
                            description={`Bạn có chắc chắn muốn xóa hạn chế cho ${record.nutritionalMealName}?`}
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                            />
                        </Popconfirm>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className={`reusable-table-v2 ${className || ''}`}>
            <div className="reusable-table-header">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    marginBottom: '8px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SearchOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                        <Input
                            placeholder="Tìm kiếm theo tên món ăn, danh mục bệnh..."
                            value={searchText}
                            onChange={handleSearch}
                            style={{ width: 300 }}
                            allowClear
                            suffix={
                                searchText && searchText !== debouncedSearchText ? (
                                    <Spin size="small" />
                                ) : null
                            }
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FilterOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                        <Select
                            placeholder="Lọc theo danh mục bệnh"
                            value={selectedDiseaseCategory}
                            onChange={handleDiseaseCategoryFilter}
                            style={{ width: 200 }}
                            allowClear
                            options={diseaseCategoryOptions}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FilterOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                        <Select
                            placeholder="Lọc theo buổi ăn"
                            value={selectedMealTime}
                            onChange={handleMealTimeFilter}
                            style={{ width: 150 }}
                            allowClear
                            options={mealTimeOptions}
                        />
                    </div>

                    {(searchText || selectedDiseaseCategory !== null || selectedMealTime !== null) && (
                        <Button
                            size="small"
                            onClick={clearAllFilters}
                            style={{ marginLeft: 'auto' }}
                        >
                            Xóa tất cả bộ lọc
                        </Button>
                    )}
                </div>
            </div>

            <ReusableTableV2
                {...rest}
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey="id"
                pagination={{
                    show: true,
                    pageSizeOptions: [5, 10, 20, 50],
                    showTotal: true,
                    showSizeChanger: true,
                }}
                className="reusable-table-v2"
            />

            <Modal
                title="Chi tiết hạn chế thực phẩm"
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={[
                    <Button key="close" onClick={handleModalClose}>
                        Đóng
                    </Button>,
                ]}
                width={700}
                className="restriction-detail-modal"
            >
                {modalLoading ? (
                    <div className="modal-loading">
                        <Spin size="large" />
                    </div>
                ) : selectedRestriction ? (
                    <div className="restriction-detail-content">
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Tên món ăn">
                                {selectedRestriction.nutritionalMealName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá tiền">
                                {selectedRestriction.price ? `${format.currency(selectedRestriction.price)} VNĐ` : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Buổi ăn">
                                {{
                                    morning: 'Sáng',
                                    noon: 'Trưa',
                                    evening: 'Chiều',
                                }[selectedRestriction.mealTime] || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Danh mục bệnh">
                                {selectedRestriction.diseaseCategoryName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do">
                                {selectedRestriction.reason || 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khuyến nghị thay thế">
                                {selectedRestriction.alternativeRecommendations || 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Yêu cầu bác sĩ phê duyệt">
                                {selectedRestriction.requiresPhysicianOverride ? 'Có' : 'Không'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedRestriction.isActive ? 'green' : 'red'}>
                                    {selectedRestriction.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {selectedRestriction.createdAt ? new Date(selectedRestriction.createdAt).toLocaleDateString('vi-VN') : '-'}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : (
                    <p>Không có dữ liệu hạn chế thực phẩm.</p>
                )}
            </Modal>
        </div>
    );
};

DiseaseCategoryFoodRestrictionsTable.propTypes = {
    dataSource: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            branchId: PropTypes.number.isRequired,
            diseaseCategoryId: PropTypes.number.isRequired,
            nutritionalMealName: PropTypes.string,
            price: PropTypes.number,
            mealTime: PropTypes.string,
            reason: PropTypes.string,
            alternativeRecommendations: PropTypes.string,
            isActive: PropTypes.bool.isRequired,
            requiresPhysicianOverride: PropTypes.bool.isRequired,
            createdAt: PropTypes.string,
            createdBy: PropTypes.string,
            lastModifiedAt: PropTypes.string,
            lastModifiedBy: PropTypes.string,
            branchName: PropTypes.string,
            diseaseCategoryName: PropTypes.string,
        })
    ),
    loading: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    className: PropTypes.string,
    diseaseCategories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            code: PropTypes.string,
            colorCode: PropTypes.string,
        })
    ),
    nutritionalMeals: PropTypes.arrayOf(
        PropTypes.shape({
            code: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
        })
    ),
};

export default DiseaseCategoryFoodRestrictionsTable;