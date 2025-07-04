import React, { useEffect } from 'react';
import { Form, Input, Button, Space } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { locationService } from '../../../services/locationService';
import { areaService } from '../../../services/areaService';

const EditLocation = ({ open, onCancel, onSubmit, formData, branchId, areaId }) => {
  const { form, handleSubmit, resetForm } = useAntForm();

  useEffect(() => {
    console.log('✅ EditLocation - formData:', formData, 'branchId:', branchId, 'areaId:', areaId); // Log để kiểm tra
    if (formData && open) {
      form.setFieldsValue({
        name: formData.name,
        roomNumber: formData.roomNumber || '',
      });
    } else if (!open) {
      resetForm();
    }
  }, [formData, open, form, resetForm]);

  const handleFormSubmit = async (values) => {
    try {
      const areaResponse = await areaService.getAreaById(areaId);
      if (!areaResponse.data || areaResponse.data.branchId !== parseInt(branchId, 10)) {
        form.setFields([
          { name: 'name', errors: ['Khu vực không hợp lệ hoặc không thuộc chi nhánh này!'] },
        ]);
        return;
      }

      const isNameUnique = await locationService.validateLocationName(areaId, values.name.trim(), formData.id);
      if (!isNameUnique) {
        form.setFields([
          { name: 'name', errors: ['Tên vị trí đã tồn tại trong khu vực này!'] },
        ]);
        return;
      }

      await handleSubmit(async () => {
        if (onSubmit) {
          const payload = {
            id: formData.id,
            name: values.name.trim(),
            description: formData.description || '',
            roomNumber: values.roomNumber?.trim() || '',
            capacity: formData.capacity || 0,
            sort: formData.sort || 0,
            isActive: formData.isActive !== undefined ? formData.isActive : true,
            areaId: parseInt(areaId, 10),
            branchId: parseInt(branchId, 10),
          };
          console.log('🚀 EditLocation - payload:', payload);
          await onSubmit(payload);
        }
      });
    } catch (error) {
      console.error('❌ Failed to validate location:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi kiểm tra tên vị trí!';
      form.setFields([
        {
          name: 'name',
          errors: [errorMessage.includes('area does not belong') ? 'Khu vực không thuộc chi nhánh này!' : errorMessage],
        },
      ]);
    }
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px' }}>Chỉnh sửa vị trí</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      closable={false}
    >
      <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 1 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => form.submit()}
            style={{
              backgroundColor: '#52c41a',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14,
            }}
          >
            Lưu
          </Button>
          <Button
            onClick={onCancel}
            style={{
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14,
            }}
          >
            X
          </Button>
        </Space>
      </div>

      <ReusableForm form={form} onFinish={handleFormSubmit} layout="vertical">
        <Form.Item
          name="name"
          label="Tên vị trí"
          rules={[
            { required: true, message: 'Vui lòng nhập tên vị trí!' },
            { whitespace: true, message: 'Tên vị trí không được chỉ chứa khoảng trắng!' },
            { max: 100, message: 'Tên vị trí không được dài quá 100 ký tự!' },
          ]}
        >
          <Input placeholder="Tên vị trí" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="roomNumber"
          label="Số phòng"
          rules={[
            { max: 50, message: 'Số phòng không được dài quá 50 ký tự!' },
          ]}
        >
          <Input placeholder="Số phòng (tùy chọn)" style={{ width: '100%' }} />
        </Form.Item>
      </ReusableForm>
    </ReusableModal>
  );
};

export default EditLocation;