import React, { useState } from 'react';
import { ConfigProvider, Typography, Spin, Alert, message, Modal, Descriptions, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { usePatients } from '../../../hooks/queries/usePatientQueries';
import { useAuth } from '../../../context/AuthContext';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import PatientTable from '../Patient/PatientTable';
import { useAntModal } from '../../../hooks/useAntModal';

const { Title, Text } = Typography;

const PatientComponent = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { user } = useAuth();

  const currentBranchId = localStorage.getItem('currentBranchId') || '1';
  const selectedBranchName = localStorage.getItem('selectedBranch')
    ? JSON.parse(localStorage.getItem('selectedBranch'))?.name
    : 'N/A';

  const nurseId = user?.id || user?.userId || 'NURSE001';

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
        message.error(`Lỗi: ${err?.response?.data?.message || 'Không thể tải danh sách bệnh nhân'}`);
      },
    }
  );

  const patients = Array.isArray(patientData?.data)
    ? patientData.data
    : Array.isArray(patientData)
    ? patientData
    : [];

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    showModal();
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách bệnh nhân');
  };

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
          description={<Text className="text-gray-500">Quản lý thông tin bệnh nhân một cách hiệu quả - Chi nhánh: {selectedBranchName}</Text>}
          onRefresh={handleRefresh}
          loading={isFetching}
          searchProps={{
            value: '',
            onChange: (e) => {}, // Search is handled in PatientTable
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
          {isFetching && !patients.length ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : patients.length > 0 ? (
            <PatientTable
              dataSource={patients}
              loading={isFetching}
              onView={handleViewDetails}
              nurseId={nurseId}
              branchId={currentBranchId}
            />
          ) : (
            <Text type="secondary" className="text-lg text-center block mt-12">
              Không tìm thấy bệnh nhân phù hợp.
            </Text>
          )}
          <Modal
            title={
              <div className="flex items-center gap-2">
                <EyeOutlined className="text-blue-500" />
                <span className="text-xl font-semibold">Chi Tiết Bệnh Nhân</span>
              </div>
            }
            open={open}
            onCancel={handleCancel}
            footer={[<Button key="close" onClick={handleCancel}>Đóng</Button>]}
            width={600}
            centered
            destroyOnClose
            className="rounded-xl"
          >
            {selectedPatient ? (
              <Descriptions bordered column={1} labelStyle={{ width: 150 }}>
                <Descriptions.Item label="Mã Hồ Sơ">{selectedPatient.medicalRecordNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label="Họ Tên">{selectedPatient.fullName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Giới Tính">{selectedPatient.gender || '-'}</Descriptions.Item>
                <Descriptions.Item label="Tuổi">{selectedPatient.age || '-'}</Descriptions.Item>
                <Descriptions.Item label="Phòng">{selectedPatient.roomNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label="Giường">{selectedPatient.bedNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label="Vị Trí">{selectedPatient.displayLocation || '-'}</Descriptions.Item>
                <Descriptions.Item label="Nhóm Bệnh">
                  {selectedPatient.diseaseCategories?.length
                    ? selectedPatient.diseaseCategories.map((dc) => dc.diseaseCategoryName).join(', ')
                    : 'Chưa xác định'}
                </Descriptions.Item>
                <Descriptions.Item label="Bác Sĩ Điều Trị">{selectedPatient.attendingPhysician || '-'}</Descriptions.Item>
                <Descriptions.Item label="Trạng Thái">{selectedPatient.isActive ? 'Đang điều trị' : 'Đã xuất viện'}</Descriptions.Item>
                <Descriptions.Item label="Đang Nhập Viện">{selectedPatient.isCurrentlyAdmitted ? 'Có' : 'Không'}</Descriptions.Item>
                <Descriptions.Item label="Cần Giám Sát Dinh Dưỡng">{selectedPatient.requiresDietarySupervision ? 'Có' : 'Không'}</Descriptions.Item>
                <Descriptions.Item label="Ghi Chú">{selectedPatient.notes || 'Không có'}</Descriptions.Item>
                <Descriptions.Item label="Mã Hệ Thống Ngoài">{selectedPatient.externalSystemId || 'Không có'}</Descriptions.Item>
              </Descriptions>
            ) : (
              <p>Không có dữ liệu bệnh nhân.</p>
            )}
          </Modal>
        </PageWrapperV2>
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientComponent;