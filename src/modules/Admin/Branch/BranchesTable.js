import React, { useState, useEffect, useMemo } from 'react';
import { message, Button, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Thêm EyeOutlined
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import CreateBranch from './CreateBranch';
import EditBranch from './EditBranch';
import ViewBranchDetail from './ViewBranchDetail';
import { useAntModal } from '../../../hooks/useAntModal';
import {
    useBranches,
    useCreateBranch,
    useUpdateBranch,
    useDeleteBranch,
} from '../../../hooks/queries/userBranchesQueries';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';

const BranchesTableV2 = () => {
    const [searchText, setSearchText] = useState('');
    const [branchesData, setBranchesData] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
    const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
    const { open: viewOpen, showModal: showViewModal, handleCancel: handleViewCancel } = useAntModal(); // Hook cho modal View

    const {
        data: branches,
        isLoading,
        error,
        refetch,
    } = useBranches();

    const createBranchMutation = useCreateBranch();
    const updateBranchMutation = useUpdateBranch();
    const deleteBranchMutation = useDeleteBranch();
    const { handleNonPermissionError } = useGlobalErrorHandler();

    useEffect(() => {
        console.log('🔍 Fetched branches:', branches);
        if (error) {
            handleNonPermissionError(error, 'Không thể tải dữ liệu chi nhánh.');
            setBranchesData([]);
        } else {
            setBranchesData(branches || []);
        }
    }, [branches, error, handleNonPermissionError]);

    const filteredData = useMemo(() => {
        const keyword = searchText.toLowerCase();
        return branchesData.filter(
            (item) =>
                item?.name?.toLowerCase()?.includes(keyword) ||
                item?.phoneNumber?.toLowerCase()?.includes(keyword) ||
                item?.address?.toLowerCase()?.includes(keyword)
        );
    }, [branchesData, searchText]);

    const handleCreateOrUpdate = async (formData) => {
        try {
            const payload = {
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
            };

            if (formData.id) {
                await updateBranchMutation.mutateAsync({ branchId: formData.id, branchData: payload });
                message.success('Cập nhật chi nhánh thành công');
                handleEditCancel();
            } else {
                await createBranchMutation.mutateAsync({ branchData: payload });
                message.success('Tạo chi nhánh thành công');
                handleAddCancel();
            }

            refetch();
        } catch (err) {
            console.error('❌ Lỗi lưu chi nhánh:', err);
            message.error(err?.response?.data?.message || 'Lỗi khi lưu chi nhánh!');
        }
    };

    const handleEdit = (record) => {
        setSelectedBranch(record);
        showEditModal();
    };

    const handleDelete = async (record) => {
        try {
            await deleteBranchMutation.mutateAsync({ branchId: record.id });
            message.success('Xóa chi nhánh thành công');
            refetch();
        } catch (err) {
            console.error('❌ Lỗi xoá chi nhánh:', err);
            message.error(err?.response?.data?.message || 'Lỗi khi xóa chi nhánh!');
        }
    };

    const handleView = (record) => {
        setSelectedBranch(record);
        showViewModal();
    };

    const handleRefresh = () => {
        refetch();
        message.success('Đã làm mới danh sách chi nhánh');
    };

    const handleAdd = () => {
        showAddModal();
    };

    // Định nghĩa actions cho cột Hành động
    const renderActions = (record) => (
        <>
            <Tooltip title="Xem chi tiết">
                <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
            </Tooltip>
        </>
    );

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
            <PageWrapperV2
                title="Danh mục chi nhánh"
                onAdd={handleAdd}
                onRefresh={handleRefresh}
                loading={isLoading}
                searchProps={{
                    value: searchText,
                    onChange: (e) => setSearchText(e.target.value),
                    placeholder: 'Tìm kiếm chi nhánh',
                }}
            >
                <ReusableTableV2
                    dataSource={filteredData}
                    columns={[
                        { dataIndex: 'name', primary: true, align: 'left', title: 'Tên chi nhánh' },
                        { dataIndex: 'phoneNumber', align: 'left', title: 'Số điện thoại' },
                        { dataIndex: 'address', align: 'left', title: 'Địa chỉ' },
                    ]}
                    loading={isLoading}
                    listHeader="TÊN CHI NHÁNH"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    actions={renderActions} // Sử dụng prop actions để thêm nút View Detail
                    emptyMessage="Không tìm thấy chi nhánh nào."
                    pagination={paginationConfig}
                />
            </PageWrapperV2>

            <CreateBranch
                open={addOpen}
                onCancel={handleAddCancel}
                onSubmit={handleCreateOrUpdate}
            />
            <EditBranch
                open={editOpen}
                onCancel={handleEditCancel}
                onSubmit={handleCreateOrUpdate}
                formData={selectedBranch}
            />
            <ViewBranchDetail
                open={viewOpen}
                onCancel={handleViewCancel}
                data={selectedBranch}
            />
        </>
    );
};

export default BranchesTableV2;