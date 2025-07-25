import React, { useState, useMemo } from 'react';
import { ConfigProvider, Typography, Alert, message } from 'antd';
import { usePatients, useCreatePatientMutation } from '../../../hooks/queries/usePatientQueries'; // Import the mutation hook
import { useAuth } from '../../../context/AuthContext';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import PatientTable from '../Patient/PatientTable';
import CreatePatient from '../Patient/CreatePatient';
import { useAntModal } from '../../../hooks/useAntModal';

const { Title, Text } = Typography;

const PatientComponent = () => {
  const [searchText, setSearchText] = useState('');
  const [activeDay, setActiveDay] = useState('6'); // Default to Saturday, July 26, 2025
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();

  const { user } = useAuth();
  const currentBranchId = localStorage.getItem('currentBranchId') || '1';
  const selectedBranchName = localStorage.getItem('selectedBranch')
    ? JSON.parse(localStorage.getItem('selectedBranch'))?.name
    : 'N/A';
  const nurseId = user?.id || user?.userId || 'NURSE001';

  const createPatientMutation = useCreatePatientMutation(); // Add the mutation hook

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

  // Rest of the component remains unchanged
  const patients = Array.isArray(patientData?.data)
    ? patientData.data
    : Array.isArray(patientData)
      ? patientData
      : [];

  // ... other code ...

  return (
    <ConfigProvider locale={locale}>
      <NurseLayout>
        <PageWrapperV2
          title="Danh Sách Bệnh Nhân"
          description={`Quản lý thông tin bệnh nhân một cách hiệu quả - Chi nhánh: ${selectedBranchName}`}
          onRefresh={handleRefresh}
          onAdd={handleSelectAllFoods}
          addButtonText="Chọn tất cả món ăn"
          loading={isFetching}
          searchProps={{
            value: searchText,
            onChange: (e) => setSearchText(e.target.value),
            placeholder: 'Tìm kiếm bệnh nhân',
          }}
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
            onSelectAllFoods={handleSelectAllFoods}
          />
          <CreatePatient
            open={addOpen}
            onCancel={handleAddCancel}
            onSubmit={async (formData) => {
              try {
                const payload = {
                  fullName: formData.FullName.trim(),
                  medicalRecordNumber: formData.MedicalRecordNumber.trim(),
                  gender: formData.Gender,
                  roomNumber: formData.RoomNumber?.toString() || '',
                  bedNumber: formData.BedNumber?.toString() || '',
                  attendingPhysician: formData.AttendingPhysician?.trim() || '',
                  isActive: formData.IsActive,
                  notes: formData.Notes?.trim() || '',
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
            }}
          />
        </PageWrapperV2>
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientComponent;