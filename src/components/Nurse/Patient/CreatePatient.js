import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Button, Space, message, Select, InputNumber, Alert, Typography } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { usePatients, usePatient } from '../../../hooks/queries/usePatientQueries'; // Hypothetical hooks for patient data
import { patientService } from '../../../services/patientService'; // Hypothetical service for patient API calls
import PropTypes from 'prop-types';
import environment from '../../../config/environment';
import './CreatePatient.css'; // New CSS file for styling

const { Text } = Typography;

const CreatePatient = ({
  open,
  onCancel,
  onSubmit,
  initialValues = {},
  formData,
  editMode = false,
  patientId = null,
  onSuccess = null,
}) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isUsingTemplate, setIsUsingTemplate] = useState(false);

  // API hooks
  const { data: existingPatientData, loading: patientLoading, error: patientError } = usePatient(patientId, {
    enabled: editMode && !!patientId && open,
  });

  const { data: allPatients = [], isLoading: patientsLoading } = usePatients({
    enabled: open, // Fetch all patients for validation
  });

  // Enhanced validation for MedicalRecordNumber
  const validateMedicalRecordNumber = async (value) => {
    if (!value) return Promise.resolve();

    // Skip validation if in edit mode and the MedicalRecordNumber hasn't changed
    if (editMode && existingPatientData?.MedicalRecordNumber === value) {
      return Promise.resolve();
    }

    // Check for duplicate MedicalRecordNumber
    const isDuplicate = allPatients.some(
      (patient) => patient.MedicalRecordNumber === value && (!editMode || patient.id !== patientId)
    );

    if (isDuplicate) {
      return Promise.reject(new Error('Mã hồ sơ đã tồn tại! Vui lòng sử dụng mã khác.'));
    }

    return Promise.resolve();
  };

  // Load existing patient data in edit mode
  useEffect(() => {
    if (editMode && existingPatientData && !isDataLoaded && open && !patientsLoading) {
      if (environment.features.enableLogging) {
        console.log('📝 Loading existing patient data for editing:', existingPatientData);
      }

      form.setFieldsValue({
        id: existingPatientData.id,
        MedicalRecordNumber: existingPatientData.MedicalRecordNumber,
        FullName: existingPatientData.FullName,
        Gender: existingPatientData.Gender,
        RoomNumber: existingPatientData.RoomNumber,
        BedNumber: existingPatientData.BedNumber,
        AttendingPhysician: existingPatientData.AttendingPhysician,
        Notes: existingPatientData.Notes,
        IsActive: existingPatientData.IsActive,
        ExternalSystemId: existingPatientData.ExternalSystemId,
      });

      setIsDataLoaded(true);
    }
  }, [editMode, existingPatientData, form, isDataLoaded, open, patientsLoading]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open || !editMode) {
      setIsDataLoaded(false);
      setIsUsingTemplate(false);
    }
  }, [open, editMode]);

  // Handle template data loading (hypothetical feature to copy from an existing patient)
  const handleTemplateSelected = async (templatePatientId) => {
    try {
      const templateData = await patientService.getPatient(templatePatientId);
      if (!templateData) {
        throw new Error('Không thể tải dữ liệu bệnh nhân mẫu!');
      }

      setIsUsingTemplate(true);
      form.setFieldsValue({
        FullName: templateData.FullName,
        Gender: templateData.Gender,
        RoomNumber: templateData.RoomNumber,
        BedNumber: templateData.BedNumber,
        AttendingPhysician: templateData.AttendingPhysician,
        Notes: templateData.Notes,
        IsActive: templateData.IsActive,
        ExternalSystemId: templateData.ExternalSystemId,
      });

      message.success('Đã tải dữ liệu bệnh nhân mẫu thành công!');
    } catch (error) {
      message.error(`Không thể tải dữ liệu bệnh nhân mẫu: ${error.message}`);
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      const result = await handleSubmit(async (formData) => {
        if (onSubmit) {
          await onSubmit(formData);
        }
      });

      if (result.success) {
        message.success(formData.id ? 'Cập nhật bệnh nhân thành công!' : 'Thêm bệnh nhân thành công!');
        handleCancel();
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (error) {
      message.error(`Lỗi khi ${editMode ? 'cập nhật' : 'thêm'} bệnh nhân: ${error.message}`);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsUsingTemplate(false);
    if (onCancel) {
      onCancel();
    }
  };

  const modalTitle = editMode ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <EditOutlined style={{ color: '#1890ff' }} />
      {existingPatientData ? `Sửa Bệnh Nhân - ${existingPatientData.FullName}` : 'Sửa Bệnh Nhân'}
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <PlusOutlined style={{ color: '#52c41a' }} />
      Thêm Bệnh Nhân Mới
    </div>
  );

  if (patientError) {
    return (
      <ReusableModal
        title={modalTitle}
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Alert
          message="Lỗi tải dữ liệu"
          description={patientError?.message || 'Không thể tải dữ liệu bệnh nhân.'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Tải lại
            </Button>
          }
        />
      </ReusableModal>
    );
  }

  return (
    <ReusableModal
      title={modalTitle}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
      style={{ top: 20 }}
      className="create-patient"
    >
      <Spin spinning={patientLoading || patientsLoading} tip="Đang tải dữ liệu bệnh nhân...">
        <ReusableForm
          form={form}
          onFinish={handleFormSubmit}
          initialValues={initialValues}
          layout="vertical"
          className={formLoading ? 'form-loading' : ''}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <div className="custom-floating">
            <Form.Item
              name="MedicalRecordNumber"
              label="Mã Hồ Sơ"
              rules={[
                { required: true, message: 'Vui lòng nhập mã hồ sơ!' },
                { validator: validateMedicalRecordNumber },
              ]}
            >
              <Input placeholder="Nhập mã hồ sơ" className="input-label" />
            </Form.Item>
            <label className="floating-label">Mã Hồ Sơ</label>
          </div>

          <div className="custom-floating">
            <Form.Item
              name="FullName"
              label="Họ Tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input placeholder="Nhập họ tên" className="input-label" />
            </Form.Item>
            <label className="floating-label">Họ Tên</label>
          </div>

          <div className="custom-floating">
            <Form.Item
              name="Gender"
              label="Giới Tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
            >
              <Select
                placeholder="Chọn giới tính"
                options={[
                  { value: 'Nam', label: 'Nam' },
                  { value: 'Nữ', label: 'Nữ' },
                  { value: 'Khác', label: 'Khác' },
                ]}
              />
            </Form.Item>
            <label className="floating-label">Giới Tính</label>
          </div>

          <div className="custom-floating">
            <Form.Item
              name="RoomNumber"
              label="Phòng"
              rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
            >
              <InputNumber
                placeholder="Nhập số phòng"
                style={{ width: '100%' }}
                min={1}
                className="input-label"
              />
            </Form.Item>
            <label className="floating-label">Phòng</label>
          </div>

          <div className="custom-floating">
            <Form.Item
              name="BedNumber"
              label="Giường"
              rules={[{ required: true, message: 'Vui lòng nhập số giường!' }]}
            >
              <InputNumber
                placeholder="Nhập số giường"
                style={{ width: '100%' }}
                min={1}
                className="input-label"
              />
            </Form.Item>
            <label className="floating-label">Giường</label>
          </div>

          <div className="custom-floating">
            <Form.Item
              name="AttendingPhysician"
              label="Bác Sĩ Điều Trị"
              rules={[{ required: true, message: 'Vui lòng nhập tên bác sĩ!' }]}
            >
              <Input placeholder="Nhập tên bác sĩ" className="input-label" />
            </Form.Item>
            <label className="floating-label">Bác Sĩ Điều Trị</label>
          </div>

          <div className="custom-floating">
            <Form.Item name="Notes" label="Ghi Chú">
              <Input.TextArea placeholder="Nhập ghi chú" rows={4} className="input-label" />
            </Form.Item>
            <label className="floating-label">Ghi Chú</label>
          </div>

          <div className="custom-floating">
            <Form.Item
              name="IsActive"
              label="Trạng Thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select
                placeholder="Chọn trạng thái"
                options={[
                  { value: true, label: 'Đang điều trị' },
                  { value: false, label: 'Đã xuất viện' },
                ]}
              />
            </Form.Item>
            <label className="floating-label">Trạng Thái</label>
          </div>

          <div className="custom-floating">
            <Form.Item name="ExternalSystemId" label="Mã Hệ Thống Ngoài">
              <Input placeholder="Nhập mã hệ thống ngoài" className="input-label" />
            </Form.Item>
            <label className="floating-label">Mã Hệ Thống Ngoài</label>
          </div>

          <Form.Item className="form-actions">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel} size="large">
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={formLoading || patientLoading || patientsLoading}
                size="large"
              >
                {editMode ? 'Cập Nhật' : 'Lưu Bệnh Nhân'}
              </Button>
            </Space>
          </Form.Item>
        </ReusableForm>
      </Spin>
    </ReusableModal>
  );
};

CreatePatient.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  formData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    MedicalRecordNumber: PropTypes.string,
    FullName: PropTypes.string,
    Gender: PropTypes.string,
    RoomNumber: PropTypes.number,
    BedNumber: PropTypes.number,
    AttendingPhysician: PropTypes.string,
    Notes: PropTypes.string,
    IsActive: PropTypes.bool,
    ExternalSystemId: PropTypes.string,
  }),
  editMode: PropTypes.bool,
  patientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
};

export default CreatePatient;