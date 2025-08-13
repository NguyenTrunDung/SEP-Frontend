import React, { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
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
import { PERMISSIONS } from '../../../constants/permissions';

/**
 * AreasTableV2 - Refactored version using PageWrapperV2 and ReusableTableV2
 * Demonstrates how to use the new reusable components
 */
const AreasTableV2 = () => {
    const [searchText, setSearchText] = useState('');
    const [areasData, setAreasData] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);
    const branchId = environment.multiTenant.getCurrentBranchId() || '1';

    const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
    const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();

    const { areas, isLoading, error, refetch } = useAreas(branchId);
    const createAreaMutation = useCreateArea();
    const updateAreaMutation = useUpdateArea();
    const deleteAreaMutation = useDeleteArea();
    const { handleNonPermissionError } = useGlobalErrorHandler();

    useEffect(() => {
        if (error) {
            handleNonPermissionError(error, 'Không thể tải dữ liệu khu vực.');
            setAreasData([]);
        } else {
            const filtered = (areas || []).filter(area => String(area.branchId) === String(branchId));
            if (environment.features.enableLogging) {
                console.log(`🔍 AreasTableV2: Filtered areas for branch ${branchId}:`, filtered);
            }
            setAreasData(filtered);
        }
    }, [areas, error, handleNonPermissionError, branchId]);

    const filteredData = useMemo(() => {
        return searchText
            ? areasData.filter((item) =>
                item.name.toLowerCase().includes(searchText.toLowerCase())
            )
            : areasData;
    }, [areasData, searchText]);

    const handleCreateOrUpdate = async (formData) => {
        try {
            const payload = { name: formData.name, branchId };
            if (formData.id) {
                await updateAreaMutation.mutateAsync({ areaId: formData.id, areaData: payload, branchId });
                message.success('Cập nhật khu vực thành công');
                handleEditCancel();
            } else {
                await createAreaMutation.mutateAsync({ areaData: payload, branchId });
                message.success('Tạo khu vực thành công');
                handleAddCancel();
            }
            refetch();
        } catch (error) {
            console.error('Failed to save area:', error);
            message.error(error?.response?.data?.message || 'Lỗi khi lưu khu vực!');
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
            refetch();
        } catch (error) {
            console.error('Failed to delete area:', error);
            message.error(error?.response?.data?.message || 'Lỗi khi xóa khu vực!');
        }
    };

    const handleRefresh = () => {
        refetch();
        message.success('Đã làm mới danh sách khu vực');
    };

    const handleAdd = () => {
        showAddModal();
    };

    return (
        <>
            <PageWrapperV2
                title="Danh mục khu vực"
                onAdd={handleAdd}
                onRefresh={handleRefresh}
                loading={isLoading}
                searchProps={{
                    value: searchText,
                    onChange: (e) => setSearchText(e.target.value),
                    placeholder: 'Tìm kiếm khu vực'
                }}
                // Permission controls
                resourceName="areas"
                addPermission={PERMISSIONS.AREAS_ADD}
                viewPermission={PERMISSIONS.AREAS_VIEW}
                hideOnNoPermission={true}
                permissionFallback={<div>Bạn không có quyền truy cập trang quản lý khu vực.</div>}
            >
                <ReusableTableV2
                    dataSource={filteredData}
                    columns={[
                        { dataIndex: 'name', primary: true }
                    ]}
                    loading={isLoading}
                    listHeader="TÊN KHU VỰC"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Không tìm thấy khu vực nào."
                    // Permission controls for table actions
                    resourceName="areas"
                    editPermission={PERMISSIONS.AREAS_EDIT}
                    deletePermission={PERMISSIONS.AREAS_DELETE}
                    hideActionsOnNoPermission={true}
                    showPermissionTooltips={true}
                />
            </PageWrapperV2>

            {/* Modals */}
            <CreateArea
                open={addOpen}
                onCancel={handleAddCancel}
                onSubmit={handleCreateOrUpdate}
                branchId={branchId}
            />
            <EditArea
                open={editOpen}
                onCancel={handleEditCancel}
                onSubmit={handleCreateOrUpdate}
                formData={selectedArea}
                branchId={branchId}
            />
        </>
    );
};

export default AreasTableV2; 