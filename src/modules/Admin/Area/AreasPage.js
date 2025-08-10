import React, { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { withPageWrapperV2 } from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import CreateArea from './CreateArea';
import EditArea from './EditArea';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
} from '../../../hooks/queries/useAreas';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import PropTypes from 'prop-types';
import { Tooltip, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const AreasPageContent = ({
  areasData,
  filteredData,
  loading,
  onEdit,
  onDelete,
  createModalProps,
  editModalProps,
  onCreateOrUpdate,
  branchId,
}) => {
  const columns = [
    {
      title: 'TÊN KHU VỰC',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      primary: true,
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              disabled={String(record.branchId) !== String(branchId)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa khu vực"
              description={`Bạn có chắc chắn muốn xóa khu vực ${record.name}?`}
              onConfirm={() => onDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={String(record.branchId) !== String(branchId)}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                disabled={String(record.branchId) !== String(branchId)}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: true,
    showSizeChanger: true,
    total: filteredData.length,
    showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
  };

  return (
    <>
      <ReusableTableV2
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={paginationConfig}
        listHeader="TÊN KHU VỰC"
        emptyMessage="Không tìm thấy khu vực nào."
        className="reusable-table-v2"
      />
      <CreateArea
        open={createModalProps.open}
        onCancel={createModalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
        branchId={branchId}
      />
      <EditArea
        open={editModalProps.open}
        onCancel={editModalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
        formData={editModalProps.formData}
        branchId={branchId}
      />
    </>
  );
};

AreasPageContent.propTypes = {
  areasData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  filteredData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  createModalProps: PropTypes.shape({
    open: PropTypes.bool,
    handleCancel: PropTypes.func,
  }),
  editModalProps: PropTypes.shape({
    open: PropTypes.bool,
    handleCancel: PropTypes.func,
    formData: PropTypes.object,
  }),
  onCreateOrUpdate: PropTypes.func,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const AreasPageWithWrapper = withPageWrapperV2(AreasPageContent);

const AreasPage = () => {
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { open: createOpen, showModal: showCreateModal, handleCancel: handleCreateCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const { areas, isLoading: isFetchingAreas, error, refetch, isRefetching } = useAreas(branchId);
  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();
  const deleteAreaMutation = useDeleteArea();
  const [areasData, setAreasData] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (error) {
      handleNonPermissionError(error, 'Không thể tải dữ liệu khu vực.');
      setAreasData([]);
    } else if (areas) {
      const filteredAreas = areas.filter(area => String(area.branchId) === String(branchId));
      if (environment.features.enableLogging) {
        console.log(`🔍 AreasPage: Filtered areas for branch ${branchId}:`, filteredAreas);
      }
      setAreasData(filteredAreas);
    }
  }, [areas, error, handleNonPermissionError, branchId]);

  const filteredData = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return areasData.filter((item) =>
      item?.name?.toLowerCase()?.includes(keyword)
    );
  }, [areasData, searchText]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      const name = formData.name?.trim();
      if (!name || name.length < 3) {
        message.error('Tên khu vực phải có ít nhất 3 ký tự!');
        return;
      }
      if (name.length > 100) {
        message.error('Tên khu vực không được vượt quá 100 ký tự!');
        return;
      }
      if (!/^[\p{L}0-9\s\-_,()./\\&]+$/u.test(name)) {
        message.error('Tên khu vực chỉ được chứa chữ cái, số và các ký tự đặc biệt (- _ , . ( ) / \\ &)');
        return;
      }
      const payload = { name, branchId };
      if (formData.id) {
        await updateAreaMutation.mutateAsync({ areaId: formData.id, areaData: payload, branchId });
        message.success('Cập nhật khu vực thành công');
        handleEditCancel();
      } else {
        await createAreaMutation.mutateAsync({ areaData: payload, branchId });
        message.success('Tạo khu vực thành công');
        handleCreateCancel();
      }
      setSelectedArea(null);
      await refetch();
    } catch (error) {
      console.error('Failed to save area:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      message.error(error.response?.data?.message || 'Lỗi khi lưu khu vực!');
    }
  };

  const handleEdit = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể chỉnh sửa khu vực từ chi nhánh khác!');
      return;
    }
    setSelectedArea(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xóa khu vực từ chi nhánh khác!');
      return;
    }
    try {
      await deleteAreaMutation.mutateAsync({ areaId: record.id, branchId });
      message.success('Xóa khu vực thành công');
      await refetch();
    } catch (error) {
      console.error('Failed to delete area:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      message.error(error.response?.data?.message || 'Lỗi khi xóa khu vực!');
    }
  };

  const handleRefresh = () => {
    refetch();
    setSearchText('');
    message.success('Đã làm mới danh sách khu vực');
  };

  const handleAdd = () => {
    setSelectedArea(null);
    showCreateModal();
  };

  const isCombinedLoading =
    isFetchingAreas ||
    createAreaMutation.isPending ||
    updateAreaMutation.isPending ||
    deleteAreaMutation.isPending ||
    isRefetching;

  return (
    <AreasPageWithWrapper
      title="Danh mục khu vực"
      onAdd={handleAdd}
      onRefresh={handleRefresh}
      loading={isCombinedLoading}
      addButtonText="Thêm"
      refreshButtonText="Làm mới"
      showAddButton={true}
      showRefreshButton={true}
      showSearch={true}
      searchProps={{
        value: searchText,
        onChange: (e) => setSearchText(e.target.value),
        placeholder: 'Tìm kiếm khu vực',
      }}
      areasData={areasData}
      filteredData={filteredData}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createModalProps={{ open: createOpen, handleCancel: handleCreateCancel }}
      editModalProps={{
        open: editOpen,
        handleCancel: handleEditCancel,
        formData: selectedArea,
      }}
      onCreateOrUpdate={handleCreateOrUpdate}
      branchId={branchId}
    />
  );
};

export default AreasPage;