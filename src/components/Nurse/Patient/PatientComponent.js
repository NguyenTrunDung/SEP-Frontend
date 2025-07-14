import React, { useState } from 'react';
import { ConfigProvider, Typography, Spin, Alert, message, Modal, Descriptions, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { usePatients } from '../../../hooks/queries/usePatientQueries';
import { useAuth } from '../../../context/AuthContext';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import withPageWrapper from '../../../components/common/PageWrapper';
import PatientTable from '../Patient/PatientTable';
import { useAntModal } from '../../../hooks/useAntModal';

const { Title, Text } = Typography;

const PatientPageContent = ({
  patientData,
  loading,
  onView,
  modalProps,
  isError,
  error,
  nurseId,
  branchId, // Add branchId prop
}) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {isError && (
        <Alert
          message={error?.message || 'Lỗi khi tải danh sách bệnh nhân'}
          type="error"
          showIcon
          className="mb-6 rounded-lg shadow-sm"
        />
      )}
      {loading && !patientData.length ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : patientData.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <PatientTable
            dataSource={patientData}
            loading={loading}
            onView={onView}
            nurseId={nurseId}
            branchId={branchId} // Pass branchId to PatientTable
            className="rounded-lg overflow-hidden"
          />
        </div>
      ) : (
        <div className="text-center mt-12">
          <Text type="secondary" className="text-lg">
            Không tìm thấy bệnh nhân phù hợp.
          </Text>
        </div>
      )}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-blue-500" />
            <span className="text-xl font-semibold">Chi Tiết Bệnh Nhân</span>
          </div>
        }
        open={modalProps.open}
        onCancel={modalProps.handleCancel}
        footer={[
          <Button key="close" onClick={modalProps.handleCancel}>
            Đóng
          </Button>,
        ]}
        width={600}
        centered
        destroyOnClose
        className="rounded-xl"
      >
        {modalProps.selectedPatient ? (
          <Descriptions bordered column={1} labelStyle={{ width: 150 }}>
            <Descriptions.Item label="Mã Hồ Sơ">{modalProps.selectedPatient.medicalRecordNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Họ Tên">{modalProps.selectedPatient.fullName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Giới Tính">{modalProps.selectedPatient.gender || '-'}</Descriptions.Item>
            <Descriptions.Item label="Tuổi">{modalProps.selectedPatient.age || '-'}</Descriptions.Item>
            <Descriptions.Item label="Phòng">{modalProps.selectedPatient.roomNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Giường">{modalProps.selectedPatient.bedNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Vị Trí">{modalProps.selectedPatient.displayLocation || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nhóm Bệnh">
              {modalProps.selectedPatient.diseaseCategories?.length ?
                modalProps.selectedPatient.diseaseCategories.map(dc => dc.diseaseCategoryName).join(', ') :
                'Chưa xác định'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Bác Sĩ Điều Trị">{modalProps.selectedPatient.attendingPhysician || '-'}</Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">{modalProps.selectedPatient.isActive ? 'Đang điều trị' : 'Đã xuất viện'}</Descriptions.Item>
            <Descriptions.Item label="Đang Nhập Viện">{modalProps.selectedPatient.isCurrentlyAdmitted ? 'Có' : 'Không'}</Descriptions.Item>
            <Descriptions.Item label="Cần Giám Sát Dinh Dưỡng">{modalProps.selectedPatient.requiresDietarySupervision ? 'Có' : 'Không'}</Descriptions.Item>
            <Descriptions.Item label="Ghi Chú">{modalProps.selectedPatient.notes || 'Không có'}</Descriptions.Item>
            <Descriptions.Item label="Mã Hệ Thống Ngoài">{modalProps.selectedPatient.externalSystemId || 'Không có'}</Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Không có dữ liệu bệnh nhân.</p>
        )}
      </Modal>
    </div>
  );
};

const PatientPageWithWrapper = withPageWrapper(PatientPageContent);

const PatientComponent = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Get current user for nurse ID
  const { user } = useAuth();

  // Use single source of truth - branch selected in Navbar
  const currentBranchId = localStorage.getItem('currentBranchId') || '1';
  const selectedBranchName = localStorage.getItem('selectedBranch')
    ? JSON.parse(localStorage.getItem('selectedBranch'))?.name
    : 'N/A';

  // Get nurse ID from current user
  const nurseId = user?.id || user?.userId || 'NURSE001'; // fallback for development

  // Debug logging for development
  console.log('🏥 PatientComponent - Simplified Branch Context:', {
    currentBranchId,
    selectedBranchName,
    user: user ? { id: user.id, name: user.name, role: user.role } : null,
    nurseId
  });

  const {
    data: patientData,
    isError,
    error,
    isFetching,
    refetch,
  } = usePatients(
    { branchId: currentBranchId }, // Pass branch ID to the query
    {
      keepPreviousData: true,
      enabled: !!currentBranchId, // Only fetch when we have a branch ID
      onError: (err) => {
        console.error('❌ Error fetching patients:', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải danh sách bệnh nhân';
        message.error(`Lỗi: ${errorMessage}`);
      },
    }
  );

  // Extract patients from API response - handle the new response structure
  const patients = Array.isArray(patientData?.data)
    ? patientData.data
    : Array.isArray(patientData)
      ? patientData
      : [];

  // Debug logging for patient data
  console.log('👥 PatientComponent - Patient Data:', {
    rawPatientData: patientData,
    extractedPatients: patients,
    patientCount: patients.length,
    totalCount: patientData?.totalCount,
    isLoading: isFetching,
    hasError: isError,
    error: error?.message
  });

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    showModal();
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách bệnh nhân');
  };

  // Show branch selection message if no branch is available
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
        <PatientPageWithWrapper
          pageTitle={<Title level={2} className="text-blue-600 mb-2">Danh Sách Bệnh Nhân</Title>}
          pageDescription={<Text className="text-gray-500">Quản lý thông tin bệnh nhân một cách hiệu quả - Chi nhánh: {selectedBranchName}</Text>}
          pageIcon="🏥"
          loading={isFetching}
          onRefresh={handleRefresh}
          refreshText="Làm mới"
          patientData={patients}
          onView={handleViewDetails}
          modalProps={{ open, handleCancel, selectedPatient }}
          isError={isError}
          error={error}
          nurseId={nurseId}
          branchId={currentBranchId}
        />
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientComponent;