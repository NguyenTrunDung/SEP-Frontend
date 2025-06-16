// src/components/nurse/PatientComponent.js
import React, { useState } from 'react';
import { ConfigProvider, Typography, Spin, Alert, message } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../../hooks/queries/usePatientQueries';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import withPageWrapper from '../../../components/common/PageWrapper';
import PatientTable from './PatientTable';
import ReusableModal from '../../../components/common/ReusableModal';
import { useAntModal } from '../../../hooks/useAntModal';

const { Title, Text } = Typography;

// Step 1: Extract main content into a separate component
const PatientPageContent = ({
  patientData,
  loading,
  onView,
  onSearch,
  modalProps,
  isError,
  error,
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
          onSearch={onSearch}
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

// Step 2: Wrap content with PageWrapper HOC
const PatientPageWithWrapper = withPageWrapper(PatientPageContent);

// Step 3: Main Patient component
const PatientComponent = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const [searchText, setSearchText] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();

  const {
    data: patientData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = usePatients({ search: searchText.trim() }, {
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

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách bệnh nhân');
  };

  const totalPatients = patients.length;
  const activePatients = patients.filter((patient) => patient.IsActive).length;
  const dischargedPatients = totalPatients - activePatients;

  return (
    <ConfigProvider locale={locale}>
      <NurseLayout>
        <PatientPageWithWrapper
          pageTitle="Danh Sách Bệnh Nhân"
          pageDescription="Quản lý thông tin bệnh nhân một cách hiệu quả"
          pageIcon="🏥"
          loading={isFetching}
          primaryButton={{
            text: 'Thêm Bệnh Nhân',
            icon: <UserOutlined />,
            onClick: () => message.info('Chức năng thêm bệnh nhân đang được phát triển'),
          }}
          onRefresh={handleRefresh}
          refreshText="Làm mới"
          showStatistics={true}
          statistics={[
            {
              title: 'Tổng số bệnh nhân',
              value: totalPatients,
              icon: <UserOutlined />,
              color: '#1890ff',
            },
            {
              title: 'Đang điều trị',
              value: activePatients,
              icon: <EyeOutlined />,
              color: '#52c41a',
            },
            {
              title: 'Đã xuất viện',
              value: dischargedPatients,
              icon: <UserOutlined />,
              color: '#fa8c16',
            },
          ]}
          patientData={patients}
          loading={isFetching}
          onView={handleViewDetails}
          onSearch={handleSearch}
          modalProps={{ open, handleCancel, selectedPatient }}
          isError={isError}
          error={error}
        />
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientComponent;