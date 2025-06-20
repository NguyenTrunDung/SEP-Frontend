import React, { useState } from 'react';
import { ConfigProvider, Typography, Spin, Alert, message, Modal, Descriptions, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { usePatients } from '../../../hooks/queries/usePatientQueries';
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
            <Descriptions.Item label="Mã Hồ Sơ">{modalProps.selectedPatient.MedicalRecordNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Họ Tên">{modalProps.selectedPatient.FullName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Giới Tính">{modalProps.selectedPatient.Gender || '-'}</Descriptions.Item>
            <Descriptions.Item label="Phòng">{modalProps.selectedPatient.RoomNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Giường">{modalProps.selectedPatient.BedNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nhóm Bệnh">{modalProps.selectedPatient.DiseaseCategoryNames || 'Chưa xác định'}</Descriptions.Item>
            <Descriptions.Item label="Bác Sĩ Điều Trị">{modalProps.selectedPatient.AttendingPhysician || '-'}</Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">{modalProps.selectedPatient.IsActive ? 'Đang điều trị' : 'Đã xuất viện'}</Descriptions.Item>
            <Descriptions.Item label="Ghi Chú">{modalProps.selectedPatient.Notes || 'Không có'}</Descriptions.Item>
            <Descriptions.Item label="Mã Hệ Thống Ngoài">{modalProps.selectedPatient.ExternalSystemId || 'Không có'}</Descriptions.Item>
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
  // const navigate = useNavigate();
  const nurseId = 'NURSE001'; // Giả định, thay bằng logic lấy từ context hoặc auth

  const {
    data: patientData,
    // isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = usePatients({}, {
    keepPreviousData: true,
    onError: (err) => {
      console.error('Error fetching patients:', err);
      message.error('Không thể tải danh sách bệnh nhân');
    },
  });

  const patients = Array.isArray(patientData?.patients) ? patientData.patients : [];

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    showModal();
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách bệnh nhân');
  };

  return (
    <ConfigProvider locale={locale}>
      <NurseLayout>
        <PatientPageWithWrapper
          pageTitle={<Title level={2} className="text-blue-600 mb-2">Danh Sách Bệnh Nhân</Title>}
          pageDescription={<Text className="text-gray-500">Quản lý thông tin bệnh nhân một cách hiệu quả</Text>}
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
        />
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientComponent;