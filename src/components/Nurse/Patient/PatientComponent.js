import React, { useState, useMemo } from 'react';
import { ConfigProvider, Typography, Alert, message, Button } from 'antd';
import { usePatients, useCreatePatient } from '../../../hooks/queries/usePatientQueries';
import { useAuth } from '../../../context/AuthContext';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import PatientTable from '../Patient/PatientTable';
import CreatePatient from '../Patient/CreatePatient';
import BulkFoodSelection from '../Patient/CreatePatient';
import { useAntModal } from '../../../hooks/useAntModal';

const { Title, Text } = Typography;

// Define getFormattedDate function
const getFormattedDate = (dayKey) => {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek; // Calculate days to Monday
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + mondayOffset); // Set to Monday of the current week
  const dayOffset = parseInt(dayKey) - 1; // dayKey starts from 1 (Monday)
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + dayOffset);
  return targetDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

const PatientComponent = () => {
  const [searchText, setSearchText] = useState('');
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const defaultDay = currentDayOfWeek === 0 ? '7' : currentDayOfWeek.toString();
  const [activeDay, setActiveDay] = useState(defaultDay); // Default to current day
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: bulkOpen, showModal: showBulkModal, handleCancel: handleBulkCancel } = useAntModal();

  const { user } = useAuth();
  const currentBranchId = localStorage.getItem('currentBranchId') || '1';
  const selectedBranchName = localStorage.getItem('selectedBranch')
    ? JSON.parse(localStorage.getItem('selectedBranch'))?.name
    : 'N/A';
  const nurseId = user?.id || user?.userId || 'NURSE001';

  console.log('🏥 PatientComponent - Simplified Branch Context:', {
    currentBranchId,
    selectedBranchName,
    user: user ? { id: user.id, name: user.name, role: user.role } : null,
    nurseId,
    activeDay,
  });

  const {
    data: patientData,
    isError,
    error,
    isFetching,
    refetch,
  } = usePatients(
    { branchId: currentBranchId },
    {
      keepPreviousData: true,
      enabled: !!currentBranchId,
      onError: (err) => {
        console.error('❌ Error fetching patients:', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải danh sách bệnh nhân';
        message.error(`Lỗi: ${errorMessage}`);
      },
    }
  );

  const createPatientMutation = useCreatePatient();

  const patients = Array.isArray(patientData?.data)
    ? patientData.data
    : Array.isArray(patientData)
    ? patientData
    : [];

  console.log('👥 PatientComponent - Patient Data:', {
    rawPatientData: patientData,
    extractedPatients: patients,
    patientCount: patients.length,
    totalCount: patientData?.totalCount,
    isLoading: isFetching,
    hasError: isError,
    error: error?.message,
  });

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách bệnh nhân');
  };

  const handleCreate = async (formData) => {
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        medicalRecordNumber: formData.medicalRecordNumber.trim(),
        gender: formData.gender,
        age: formData.age,
        roomNumber: formData.roomNumber?.trim() || '',
        bedNumber: formData.bedNumber?.trim() || '',
        diseaseCategories: formData.diseaseCategories || [],
        attendingPhysician: formData.attendingPhysician?.trim() || '',
        isActive: true,
        isCurrentlyAdmitted: formData.isCurrentlyAdmitted || false,
        requiresDietarySupervision: formData.requiresDietarySupervision || false,
        notes: formData.notes?.trim() || '',
        branchId: currentBranchId,
      };

      await createPatientMutation.mutateAsync(payload);
      message.success('Tạo bệnh nhân thành công');
      handleAddCancel();
      refetch();
    } catch (err) {
      console.error('❌ Lỗi tạo bệnh nhân:', err);
      message.error(err?.response?.data?.message || 'Lỗi khi tạo bệnh nhân!');
    }
  };

  const handleAdd = () => {
    showAddModal();
  };

  const handleBulkFoodSelection = async (payload) => {
    try {
      console.log('🔍 BulkFoodSelection payload:', payload);
      message.success('Đã đặt món ăn cho tất cả bệnh nhân');
    } catch (err) {
      console.error('❌ Error in bulk food selection:', err);
      message.error('Lỗi khi đặt món ăn hàng loạt');
    }
  };

  const filteredData = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return patients.filter(
      (item) =>
        item?.fullName?.toLowerCase()?.includes(keyword) ||
        item?.medicalRecordNumber?.toLowerCase()?.includes(keyword)
    );
  }, [patients, searchText]);

  if (!currentBranchId) {
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Alert
              message="Chưa chọn chi nhánh"
              description="Vui lòng chọn chi nhánh ở thanh điều hướng để xem danh sách bệnh nhân"
              type="warning"
              showIcon
              className="mb-6 rounded-lg shadow-sm"
            />
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={locale}>
      <NurseLayout>
        <PageWrapperV2
          title="Danh Sách Bệnh Nhân"
          description={`Quản lý thông tin bệnh nhân một cách hiệu quả - Chi nhánh: ${selectedBranchName}`}
          onRefresh={handleRefresh}
          onAdd={handleAdd}
          loading={isFetching}
          searchProps={{
            value: searchText,
            onChange: (e) => setSearchText(e.target.value),
            placeholder: 'Tìm kiếm bệnh nhân',
          }}
          extra={
            <Button type="primary" onClick={showBulkModal}>
              Chọn món ăn cho tất cả bệnh nhân
            </Button>
          }
        >
          {isError && (
            <Alert
              message={error?.message || 'Lỗi khi tải danh sách bệnh nhân'}
              type="error"
              showIcon
              className="mb-6 rounded-lg shadow-sm"
            />
          )}
          <PatientTable
            dataSource={filteredData}
            loading={isFetching}
            nurseId={nurseId}
            branchId={currentBranchId}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
          />
          <CreatePatient
            open={addOpen}
            onCancel={handleAddCancel}
            onSubmit={handleCreate}
          />
          <BulkFoodSelection
            open={bulkOpen}
            onCancel={handleBulkCancel}
            onSubmit={handleBulkFoodSelection}
            branchId={currentBranchId}
            activeDay={getFormattedDate(activeDay)}
          />
        </PageWrapperV2>
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientComponent;