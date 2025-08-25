import React, { useState, useMemo } from 'react';
import { ConfigProvider, Typography, Alert, message, Modal } from 'antd';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '../../../hooks/queries/usePatientQueries';
import { useAuth } from '../../../context/AuthContext';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import PatientTable from '../Patient/PatientTable';
import CreatePatient from '../Patient/CreatePatient';

const { Title, Text } = Typography;

const PatientComponent = () => {
  const [searchText, setSearchText] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { user } = useAuth();
  const currentBranchId = localStorage.getItem('currentBranchId') || '1';
  const selectedBranchName = localStorage.getItem('selectedBranch')
    ? JSON.parse(localStorage.getItem('selectedBranch'))?.name
    : 'N/A';
  const nurseId = user?.id || user?.userId || 'NURSE001';

  const { data: patientData, isError, error, isFetching, refetch } = usePatients(
    { branchId: parseInt(currentBranchId, 10), search: searchText },
    {
      keepPreviousData: true,
      enabled: !!currentBranchId,
      onError: (err) => {
        console.error('❌ Patient fetch error:', err);
        if (err?.response?.status !== 404) {
          message.error(err?.response?.data?.message || 'Không thể tải danh sách bệnh nhân');
        }
      },
    }
  );

  const patients = useMemo(() => {
    if (!patientData) {
      console.warn('⚠️ patientData is undefined');
      return [];
    }
    if (!Array.isArray(patientData)) {
      console.warn('⚠️ patientData is not an array:', patientData);
      return [];
    }
    return patientData;
  }, [patientData]);

  const noPatientsMessage = useMemo(() => {
    if (isFetching) return null;
    if (patients.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
            🛌 Không có bệnh nhân nào trong khoa của bạn
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            Có thể do:
          </div>
          <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '14px', color: '#999' }}>
            <li>Chưa có bệnh nhân nào được phân công cho khoa</li>
            <li>Bệnh nhân đã được xuất viện</li>
            <li>Vui lòng kiểm tra lại thông tin khoa</li>
          </ul>
        </div>
      );
    }
    return null;
  }, [patients.length, isFetching]);

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();

  const handleCreate = async (formData) => {
    try {
      const payload = {
        id: formData.medicalRecordNumber.trim(),
        fullName: formData.fullName.trim(),
        medicalRecordNumber: formData.medicalRecordNumber.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth?.format('YYYY-MM-DD') || null,
        roomNumber: formData.roomNumber?.trim() || '',
        bedNumber: formData.bedNumber?.trim() || '',
        admissionDate: formData.admissionDate?.format('YYYY-MM-DD') || null,
        attendingPhysician: formData.attendingPhysician?.trim() || '',
        requiresDietarySupervision: formData.requiresDietarySupervision || false,
        notes: formData.notes?.trim() || '',
        branchId: parseInt(currentBranchId, 10),
        diseaseCategoryIds: formData.diseaseCategories || [],
        departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
      };

      await createPatientMutation.mutateAsync({ patientData: payload, branchId: parseInt(currentBranchId, 10) });
      message.success('Tạo bệnh nhân thành công');
      setIsCreateModalVisible(false);
      refetch();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Lỗi khi tạo bệnh nhân!');
    }
  };

  const handleUpdate = async (patientId, formData) => {
    try {
      const payload = {
        id: formData.medicalRecordNumber.trim(),
        fullName: formData.fullName.trim(),
        medicalRecordNumber: formData.medicalRecordNumber.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth?.format('YYYY-MM-DD') || null,
        roomNumber: formData.roomNumber?.trim() || '',
        bedNumber: formData.bedNumber?.trim() || '',
        admissionDate: formData.admissionDate?.format('YYYY-MM-DD') || null,
        dischargeDate: formData.dischargeDate?.format('YYYY-MM-DD') || null,
        attendingPhysician: formData.attendingPhysician?.trim() || '',
        requiresDietarySupervision: formData.requiresDietarySupervision || false,
        isActive: true,
        notes: formData.notes?.trim() || '',
        diseaseCategoryIds: formData.diseaseCategories || [],
        departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
      };

      await updatePatientMutation.mutateAsync({ patientId, patientData: payload, branchId: parseInt(currentBranchId, 10) });
      message.success('Cập nhật bệnh nhân thành công');
      refetch();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Lỗi khi cập nhật bệnh nhân!');
    }
  };

  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(currentBranchId)) {
      message.error('Không thể xóa bệnh nhân từ chi nhánh khác!');
      return;
    }

    try {
      await deletePatientMutation.mutateAsync({ patientId: record.id, branchId: parseInt(currentBranchId, 10) });
      message.success('Xóa bệnh nhân thành công');
      refetch();
    } catch (error) {
      console.error('❌ Failed to delete patient:', error);
      message.error(error.response?.data?.message || 'Lỗi khi xóa bệnh nhân!');
    }
  };

  const handleViewDetail = (patient) => {
    Modal.info({
      title: 'Chi tiết bệnh nhân',
      content: (
        <div>
          <p><strong>Mã hồ sơ:</strong> {patient.medicalRecordNumber}</p>
          <p><strong>Họ tên:</strong> {patient.fullName}</p>
          <p><strong>Giới tính:</strong> {patient.gender}</p>
          <p><strong>Tuổi:</strong> {patient.age}</p>
          <p><strong>Phòng ban:</strong> {patient.departmentName || 'Chưa xác định'}</p>
          <p><strong>Phòng:</strong> {patient.roomNumber}</p>
          <p><strong>Giường:</strong> {patient.bedNumber}</p>
          <p><strong>Ngày vào viện:</strong> {patient.admissionDate}</p>
          <p><strong>Nhóm bệnh:</strong> {patient.diseaseCategories?.map(dc => dc.diseaseCategoryName).join(', ') || 'Chưa xác định'}</p>
          <p><strong>Bác sĩ điều trị:</strong> {patient.attendingPhysician}</p>
          <p><strong>Ghi chú:</strong> {patient.notes}</p>
        </div>
      ),
      width: 600,
      onOk() { },
    });
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

  if (isError) {
    console.error('❌ Patient fetch error:', error);
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Alert
              message="Lỗi tải danh sách bệnh nhân"
              description={error?.message || 'Không thể tải danh sách bệnh nhân.'}
              type="error"
              showIcon
              className="mb-6 rounded-lg shadow-sm"
            />
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  if (isFetching && !patients.length) {
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Text>Đang tải danh sách bệnh nhân...</Text>
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
          showAddButton={true}
          showRefreshButton={false}
          searchProps={{
            value: searchText,
            onChange: (e) => setSearchText(e.target.value),
            placeholder: 'Tìm kiếm bệnh nhân',
          }}
          onAdd={() => setIsCreateModalVisible(true)}
        >
          {noPatientsMessage}
          <PatientTable
            dataSource={patients}
            loading={isFetching && !patients.length}
            nurseId={nurseId}
            branchId={parseInt(currentBranchId, 10)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
            refetch={refetch}
          />
          <CreatePatient
            open={isCreateModalVisible}
            onCancel={() => setIsCreateModalVisible(false)}
            onSubmit={handleCreate}
            branchId={parseInt(currentBranchId, 10)}
            refetch={refetch}
          />
        </PageWrapperV2>
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientComponent;