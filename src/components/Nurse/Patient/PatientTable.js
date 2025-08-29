import React, { useState, useMemo, useRef } from 'react';
import { message, Button, Typography, Tooltip, Popconfirm, Form, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';
import { useDepartments } from '../../../hooks/queries/useDepartments';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/vi_VN';
import moment from 'moment';
import 'moment/locale/vi';
import UpdatePatient from './UpdatePatient';
import PatientDetailPopup from './PatientDetailPopup';

moment.locale('vi');

const { Title, Text } = Typography;

const PatientTable = ({
  dataSource = [],
  loading,
  nurseId,
  branchId,
  onUpdate,
  onDelete,
  onViewDetail,
  refetch,
}) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { departments } = useDepartments(branchId);
  const currentBranchId = parseInt(branchId || localStorage.getItem('currentBranchId') || '1', 10);

  const enrichedDataSource = useMemo(() => {
    if (!Array.isArray(dataSource)) {
      console.warn('⚠️ dataSource is not an array:', dataSource);
      return [];
    }

    // Lọc bệnh nhân chưa xuất viện
    const currentDate = moment();
    return dataSource
      .filter(patient => {
        return !patient.dischargeDate || moment(patient.dischargeDate).isAfter(currentDate, 'day');
      })
      .map(patient => {
        let diseaseCategoryNames = 'Không có nhóm bệnh';
        if (Array.isArray(patient.diseaseCategories) && patient.diseaseCategories.length > 0) {
          diseaseCategoryNames = patient.diseaseCategories
            .map(dc => dc.diseaseCategoryName)
            .filter(name => name)
            .join(', ') || 'Không có nhóm bệnh';
        } else if (Array.isArray(patient.diseaseCategoryIds) && patient.diseaseCategoryIds.length > 0) {
          diseaseCategoryNames = patient.diseaseCategoryIds
            .map(id => {
              const category = patient.diseaseCategories?.find(dc => dc.id === id);
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
  }, [dataSource, departments]);

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
      // Avoid calling onUpdate if it's handled by UpdatePatient
      // Since UpdatePatient already handles the API call, we only need to close the modal and refetch
      setEditModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      // Silently handle errors without displaying messages
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
  refetch: PropTypes.func,
};

export default PatientTable;