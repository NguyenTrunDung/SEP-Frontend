import React, { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { withPageWrapperV2 } from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import CreateDiseaseCategory from './CreateDiseaseCategory';
import EditDiseaseCategory from './EditDiseaseCategory';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useDiseaseCategories,
  useCreateDiseaseCategory,
  useUpdateDiseaseCategory,
  useDeleteDiseaseCategory,
} from '../../../hooks/queries/useDiseaseCategories';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import PropTypes from 'prop-types';
import { Tooltip, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const DiseaseCategoriesPageContent = ({
  diseaseCategoriesData,
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
      title: 'TÊN DANH MỤC BỆNH',
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
              title="Xóa danh mục bệnh"
              description={`Bạn có chắc chắn muốn xóa danh mục bệnh ${record.name}?`}
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
        listHeader="TÊN DANH MỤC BỆNH"
        emptyMessage="Không tìm thấy danh mục bệnh nào."
        className="reusable-table-v2"
      />
      <CreateDiseaseCategory
        open={createModalProps.open}
        onCancel={createModalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
        branchId={branchId}
      />
      <EditDiseaseCategory
        open={editModalProps.open}
        onCancel={editModalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
        formData={editModalProps.formData}
        branchId={branchId}
      />
    </>
  );
};

DiseaseCategoriesPageContent.propTypes = {
  diseaseCategoriesData: PropTypes.arrayOf(
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

const DiseaseCategoriesPageWithWrapper = withPageWrapperV2(DiseaseCategoriesPageContent);

const DiseaseCategoriesPage = () => {
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { open: createOpen, showModal: showCreateModal, handleCancel: handleCreateCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const { diseaseCategories, isLoading: isFetchingCategories, error, refetch, isRefetching } = useDiseaseCategories(branchId);
  const createCategory = useCreateDiseaseCategory();
  const updateCategory = useUpdateDiseaseCategory();
  const deleteCategory = useDeleteDiseaseCategory();
  const [diseaseCategoriesData, setDiseaseCategoriesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (error) {
      handleNonPermissionError(error, 'Không thể tải danh sách danh mục bệnh.');
      setDiseaseCategoriesData([]);
    } else if (diseaseCategories) {
      const filtered = diseaseCategories.filter(category => String(category.branchId) === String(branchId));
      setDiseaseCategoriesData(filtered);
    }
  }, [diseaseCategories, error, handleNonPermissionError, branchId]);

  const filteredData = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return diseaseCategoriesData.filter((item) =>
      item?.name?.toLowerCase()?.includes(keyword)
    );
  }, [diseaseCategoriesData, searchText]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      const name = formData.name?.trim();
      if (!name || name.length < 3) {
        message.error('Tên danh mục bệnh phải có ít nhất 3 ký tự!');
        return;
      }
      if (name.length > 100) {
        message.error('Tên danh mục bệnh không được vượt quá 100 ký tự!');
        return;
      }
      if (!/^[\p{L}0-9\s\-_,()./\\&]+$/u.test(name)) {
        message.error('Tên danh mục bệnh chỉ được chứa chữ cái, số và các ký tự đặc biệt (- _ , . ( ) / \\ &)');
        return;
      }
      if (formData.id) {
        await updateCategory.mutateAsync({
          id: formData.id,
          name,
          branchId,
        });
        message.success('Cập nhật danh mục bệnh thành công');
        handleEditCancel();
      } else {
        await createCategory.mutateAsync({
          name,
          branchId,
        });
        message.success('Tạo danh mục bệnh thành công');
        handleCreateCancel();
      }
      setSelectedCategory(null);
      await refetch();
    } catch (error) {
      console.error('Failed to save disease category:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      message.error(error.response?.data?.message || 'Lỗi khi lưu danh mục bệnh!');
    }
  };

  const handleEdit = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể chỉnh sửa danh mục bệnh từ chi nhánh khác!');
      return;
    }
    setSelectedCategory(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xóa danh mục bệnh từ chi nhánh khác!');
      return;
    }
    try {
      await deleteCategory.mutateAsync({
        id: record.id,
        branchId,
      });
      message.success('Xóa danh mục bệnh thành công');
      await refetch();
    } catch (error) {
      console.error('Failed to delete disease category:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      message.error(error.response?.data?.message || 'Lỗi khi xóa danh mục bệnh!');
    }
  };

  const handleRefresh = () => {
    refetch();
    setSearchText('');
    message.success('Đã làm mới danh sách danh mục bệnh');
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    showCreateModal();
  };

  const isCombinedLoading =
    isFetchingCategories ||
    createCategory.isPending ||
    updateCategory.isPending ||
    deleteCategory.isPending ||
    isRefetching;

  return (
    <DiseaseCategoriesPageWithWrapper
      title="Danh mục bệnh"
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
        placeholder: 'Tìm kiếm danh mục bệnh',
      }}
      diseaseCategoriesData={diseaseCategoriesData}
      filteredData={filteredData}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createModalProps={{ open: createOpen, handleCancel: handleCreateCancel }}
      editModalProps={{
        open: editOpen,
        handleCancel: handleEditCancel,
        formData: selectedCategory,
      }}
      onCreateOrUpdate={handleCreateOrUpdate}
      branchId={branchId}
    />
  );
};

export default DiseaseCategoriesPage;