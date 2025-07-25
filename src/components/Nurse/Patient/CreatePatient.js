import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Select, InputNumber } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import PropTypes from 'prop-types';

const CreatePatient = ({
  open,
  onCancel,
  onSubmit,
  initialValues = {},
  formData,
}) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);

  useEffect(() => {
    if (formData) {
      form.setFieldsValue({
        id: formData.id,
        MedicalRecordNumber: formData.MedicalRecordNumber,
        FullName: formData.FullName,
        Gender: formData.Gender,
        RoomNumber: formData.RoomNumber,
        BedNumber: formData.BedNumber,
        AttendingPhysician: formData.AttendingPhysician,
        Notes: formData.Notes,
        IsActive: formData.IsActive,
        ExternalSystemId: formData.ExternalSystemId,
      });
    } else {
      form.resetFields();
    }
  }, [formData, form]);

  const handleFormSubmit = async (values) => {
    const result = await handleSubmit(async (formData) => {
      if (onSubmit) {
        await onSubmit(formData);
      }
    });

    if (result.success) {
      message.success(formData && formData.id ? 'Cập nhật bệnh nhân thành công!' : 'Thêm bệnh nhân thành công!');
      handleCancel();
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <ReusableModal
      title={formData && formData.id ? 'Sửa Bệnh Nhân' : 'Thêm Bệnh Nhân Mới'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <ReusableForm
        form={form}
        onFinish={handleFormSubmit}
        initialValues={initialValues}
        layout="vertical"
        className={formLoading ? 'form-loading' : ''}
      >
        <Form.Item
          name="id"
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="MedicalRecordNumber"
          label="Mã Hồ Sơ"
          rules={[{ required: true, message: 'Vui lòng nhập mã hồ sơ!' }]}
        >
          <Input placeholder="Nhập mã hồ sơ" />
        </Form.Item>

        <Form.Item
          name="FullName"
          label="Họ Tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input placeholder="Nhập họ tên" />
        </Form.Item>

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

        <Form.Item
          name="RoomNumber"
          label="Phòng"
          rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
        >
          <InputNumber
            placeholder="Nhập số phòng"
            style={{ width: '100%' }}
            min={1}
          />
        </Form.Item>

        <Form.Item
          name="BedNumber"
          label="Giường"
          rules={[{ required: true, message: 'Vui lòng nhập số giường!' }]}
        >
          <InputNumber
            placeholder="Nhập số giường"
            style={{ width: '100%' }}
            min={1}
          />
        </Form.Item>

        <Form.Item
          name="AttendingPhysician"
          label="Bác Sĩ Điều Trị"
          rules={[{ required: true, message: 'Vui lòng nhập tên bác sĩ!' }]}
        >
          <Input placeholder="Nhập tên bác sĩ" />
        </Form.Item>

        <Form.Item
          name="Notes"
          label="Ghi Chú"
        >
          <Input.TextArea placeholder="Nhập ghi chú" rows={4} />
        </Form.Item>

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

        <Form.Item
          name="ExternalSystemId"
          label="Mã Hệ Thống Ngoài"
        >
          <Input placeholder="Nhập mã hệ thống ngoài" />
        </Form.Item>

        <Form.Item className="form-actions">
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={formLoading} size="large">
              {formData && formData.id ? 'Cập Nhật' : 'Lưu Bệnh Nhân'}
            </Button>
          </Space>
        </Form.Item>
      </ReusableForm>
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
    BedNumber: PropTypes.string,
    AttendingPhysician: PropTypes.string,
    Notes: PropTypes.string,
    IsActive: PropTypes.bool,
    ExternalSystemId: PropTypes.string,
  }),
};

export default CreatePatient;