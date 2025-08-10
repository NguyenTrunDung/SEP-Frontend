import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Input, Tooltip, Popconfirm, Modal, Descriptions, Spin, message, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';

import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';

const DiseaseCategoryFoodRestrictionsTable = ({
    dataSource = [],
    loading,
    onEdit,
    onDelete,
    className,
    diseaseCategories = [],
    ...rest
}) => {
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [selectedDiseaseCategory, setSelectedDiseaseCategory] = useState(null);
    // const [selectedRestrictionLevel, setSelectedRestrictionLevel] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRestriction, setSelectedRestriction] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Debug log để kiểm tra dữ liệu
    useMemo(() => {
        console.log('🔍 DiseaseCategoryFoodRestrictions dataSource:', dataSource);
        console.log('🔍 DiseaseCategories:', diseaseCategories);
    }, [dataSource, diseaseCategories]);

    // Debounce search text to avoid excessive message notifications
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

    // Extract unique restriction levels for filter dropdown
    // const restrictionLevelOptions = useMemo(() => {
    //     const levels = [
    //         { value: null, label: 'Tất cả mức độ' },
    //         { value: 1, label: 'Cảnh báo (Warning)', color: '#faad14' },
    //         { value: 2, label: 'Hạn chế (Restricted)', color: '#ff4d4f' },
    //         { value: 3, label: 'Cấm (Forbidden)', color: '#d32f2f' },
    //     ];
    //     return levels;
    // }, []);

    // Create disease category options for filter
    const diseaseCategoryOptions = useMemo(() => {
        const options = [
            { value: null, label: 'Tất cả danh mục bệnh' },
            ...diseaseCategories.map(category => ({
                value: category.id,
                label: category.name,
                color: category.colorCode
            }))
        ];
        return options;
    }, [diseaseCategories]);

    const filteredData = useMemo(() => {
        let filtered = dataSource;

        // Filter by search text
        if (searchText) {
            filtered = filtered.filter(item =>
                item.foodName?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.diseaseCategoryName?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.reason?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by disease category
        if (selectedDiseaseCategory !== null) {
            filtered = filtered.filter(item => item.diseaseCategoryId === selectedDiseaseCategory);
        }

        // Filter by restriction level
        // if (selectedRestrictionLevel !== null) {
        //     filtered = filtered.filter(item => item.restrictionLevel === selectedRestrictionLevel);
        // }

        return filtered;
    }, [dataSource, searchText, selectedDiseaseCategory]);

    // Handle debounced search notifications
    useEffect(() => {
        if (debouncedSearchText && debouncedSearchText.trim()) {
            const searchResults = dataSource.filter(item => {
                let matches = item.foodName?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                    item.diseaseCategoryName?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                    item.reason?.toLowerCase().includes(debouncedSearchText.toLowerCase());

                if (selectedDiseaseCategory !== null) {
                    matches = matches && item.diseaseCategoryId === selectedDiseaseCategory;
                }
                // if (selectedRestrictionLevel !== null) {
                //     matches = matches && item.restrictionLevel === selectedRestrictionLevel;
                // }
                return matches;
            });
        }
    }, [debouncedSearchText, dataSource, selectedDiseaseCategory]);

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
            message.success(`Đã xóa hạn chế thực phẩm cho ${record.foodName}`);
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

    // const handleRestrictionLevelFilter = (value) => {
    //     setSelectedRestrictionLevel(value);
    //     if (value !== null) {
    //         const levelName = restrictionLevelOptions.find(option => option.value === value)?.label;
    //         message.info(`Lọc theo mức độ: ${levelName}`);
    //     } else {
    //         message.info('Đã xóa bộ lọc mức độ');
    //     }
    // };

    const clearAllFilters = () => {
        setSearchText('');
        setDebouncedSearchText('');
        setSelectedDiseaseCategory(null);
        // setSelectedRestrictionLevel(null);
        message.success('Đã xóa tất cả bộ lọc');
    };

    // Helper function to get restriction level display
    // const getRestrictionLevelDisplay = (level) => {
    //     switch (level) {
    //         case 1:
    //             return { text: 'Cảnh báo', color: '#faad14' };
    //         case 2:
    //             return { text: 'Hạn chế', color: '#ff4d4f' };
    //         case 3:
    //             return { text: 'Cấm', color: '#d32f2f' };
    //         default:
    //             return { text: 'Không xác định', color: '#999' };
    //     }
    // };

    const columns = [
        {
            title: 'THỰC PHẨM',
            dataIndex: 'foodName',
            key: 'foodName',
            sorter: (a, b) => a.foodName.localeCompare(b.foodName),
            render: (foodName) => <span className="vietnamese-text">{foodName || '-'}</span>,
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
                        {/* {category?.code && (
                            <Tag color={category.colorCode} style={{ marginLeft: 4 }}>
                                {category.code}
                            </Tag>
                        )} */}
                    </div>
                );
            },
            align: 'center',
        },
        // {
        //     title: 'MỨC ĐỘ HẠN CHẾ',
        //     dataIndex: 'restrictionLevel',
        //     key: 'restrictionLevel',
        //     sorter: (a, b) => a.restrictionLevel - b.restrictionLevel,
        //     render: (restrictionLevel) => {
        //         const levelInfo = getRestrictionLevelDisplay(restrictionLevel);
        //         return (
        //             <Tag color={levelInfo.color}>
        //                 {levelInfo.text}
        //             </Tag>
        //         );
        //     },
        // },
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
                            description={`Bạn có chắc chắn muốn xóa hạn chế cho ${record.foodName}?`}
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
                    {/* Search Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SearchOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                        <Input
                            placeholder="Tìm kiếm theo tên thực phẩm, danh mục bệnh..."
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

                    {/* Disease Category Filter */}
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

                    {/* Restriction Level Filter */}
                    {/* <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FilterOutlined style={{ fontSize: '16px', color: '#faad14' }} />
                        <Select
                            placeholder="Lọc theo mức độ"
                            value={selectedRestrictionLevel}
                            onChange={handleRestrictionLevelFilter}
                            style={{ width: 150 }}
                            allowClear
                            options={restrictionLevelOptions}
                        />
                    </div> */}

                    {/* Clear All Filters Button */}
                    {(searchText || selectedDiseaseCategory !== null) && (
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
                            <Descriptions.Item label="Thực phẩm">
                                {selectedRestriction.foodName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Danh mục bệnh">
                                {selectedRestriction.diseaseCategoryName || '-'}
                            </Descriptions.Item>
                            {/* <Descriptions.Item label="Mức độ hạn chế">
                                <Tag color={selectedRestriction.restrictionLevelColorCode}>
                                    {selectedRestriction.restrictionLevelDisplay}
                                </Tag>
                            </Descriptions.Item> */}
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
            foodId: PropTypes.number.isRequired,
            // restrictionLevel: PropTypes.number.isRequired,
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
            diseaseCategoryCode: PropTypes.string,
            foodName: PropTypes.string,
            foodPrice: PropTypes.number,
            // restrictionLevelName: PropTypes.string,
            // restrictionLevelColor: PropTypes.string,
            // restrictionLevelDisplay: PropTypes.string,
            // restrictionLevelColorCode: PropTypes.string,
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
};

export default DiseaseCategoryFoodRestrictionsTable; 