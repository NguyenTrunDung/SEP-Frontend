import React, { useState } from 'react';
import { ConfigProvider, Typography, Spin, Alert, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../../hooks/queries/usePatientQueries';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import withPageWrapper from '../../../components/common/PageWrapper';
import PatientTable from '../Patient/PatientTable';
import ReusableModal from '../../../components/common/ReusableModal';
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
    <>
      {isError && (
        <Alert
          message={error?.message || 'Lỗi khi tải danh sách bệnh nhân'}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {loading && !patientData.length ? (
        <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
      ) : patientData.length > 0 ? (
        <PatientTable
          dataSource={patientData}
          loading={loading}
          onView={onView}
          nurseId={nurseId}
        />
      ) : (
        <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 24 }}>
          Không tìm thấy bệnh nhân phù hợp.
        </Text>
      )}
      <ReusableModal
        open={modalProps.open}
        onCancel={modalProps.handleCancel}
        footer={null}
        title="Chi Tiết Bệnh Nhân"
        centered
        width={600}
        destroyOnClose
      >
        {modalProps.selectedPatient && (
          <div>
            <Text strong>Mã Hồ Sơ: </Text>
            <Text>{modalProps.selectedPatient.MedicalRecordNumber}</Text>
            <br />
            <Text strong>Họ Tên: </Text>
            <Text>{modalProps.selectedPatient.FullName}</Text>
            <br />
            <Text strong>Giới Tính: </Text>
            <Text>{modalProps.selectedPatient.Gender}</Text>
            <br />
            <Text strong>Phòng: </Text>
            <Text>{modalProps.selectedPatient.RoomNumber}</Text>
            <br />
            <Text strong>Giường: </Text>
            <Text>{modalProps.selectedPatient.BedNumber}</Text>
            <br />
            <Text strong>Nhóm Bệnh: </Text>
            <Text>{modalProps.selectedPatient.DiseaseCategoryNames || 'Chưa xác định'}</Text>
            <br />
            <Text strong>Bác Sĩ Điều Trị: </Text>
            <Text>{modalProps.selectedPatient.AttendingPhysician}</Text>
            <br />
            <Text strong>Ghi Chú: </Text>
            <Text>{modalProps.selectedPatient.Notes || 'Không có'}</Text>
            <br />
            <Text strong>Trạng Thái: </Text>
            <Text>{modalProps.selectedPatient.IsActive ? 'Đang điều trị' : 'Đã xuất viện'}</Text>
            <br />
            <Text strong>Mã Hệ Thống Ngoài: </Text>
            <Text>{modalProps.selectedPatient.ExternalSystemId || 'Không có'}</Text>
          </div>
        )}
      </ReusableModal>
    </>
  );
};

const PatientPageWithWrapper = withPageWrapper(PatientPageContent);

const PatientComponent = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();
  const nurseId = 'NURSE001'; // Giả định, thay bằng logic lấy từ context hoặc auth

  const {
    data: patientData,
    isLoading,
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
          pageTitle="Danh Sách Bệnh Nhân"
          pageDescription="Quản lý thông tin bệnh nhân một cách hiệu quả"
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