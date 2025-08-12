import React, { useEffect } from 'react';
import { Form, Input, Button, Space, Select, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import './UserAccountModal.css';

const EditUserAccountModal = ({ visible, onCancel, onOk, initialValues = {}, groupOptions = [] }) => {
  const { form, handleSubmit, resetForm } = useAntForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...initialValues,
        phone: initialValues.phone || initialValues.phoneNumber,
      });
      window.__userAccountModalForm__ = form;
    } else {
      resetForm();
      if (window.__userAccountModalForm__ === form) {
        window.__userAccountModalForm__ = undefined;
      }
    }
  }, [visible, initialValues, form, resetForm]);

  const handleFormSubmit = async (values) => {
    try {
      await handleSubmit(() => {
        onOk({
          ...values,
          phone: values.phone?.trim() || '',
        });
      });
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật tài khoản:', error);
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật tài khoản!');
    }
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px', color: '#000' }}>Chỉnh sửa</span>}
      open={visible}
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
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="custom-floating" style={{ flex: 1 }}>
            <label className="floating-label">Họ</label>
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
              style={{ marginBottom: 0 }}
            >
              <Input className="input-label" placeholder="Họ" />
            </Form.Item>
          </div>
          <div className="custom-floating" style={{ flex: 1 }}>
            <label className="floating-label">Tên</label>
            <Form.Item
              name="lastName"
              rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              style={{ marginBottom: 0 }}
            >
              <Input className="input-label" placeholder="Tên" />
            </Form.Item>
          </div>
        </div>

        <div className="custom-floating">
          <label className="floating-label">Tài khoản</label>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
            style={{ marginBottom: 0 }}
          >
            <Input className="input-label" placeholder="Tài khoản" />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="custom-floating" style={{ flex: 1 }}>
            <label className="floating-label">Nhóm người dùng</label>
            <Form.Item
              name="groupId"
              rules={[{ required: true, message: 'Vui lòng chọn nhóm người dùng!' }]}
              style={{ marginBottom: 0 }}
            >
              <Select className="input-label" placeholder="Nhóm người dùng" options={groupOptions} />
            </Form.Item>
          </div>
          <div className="custom-floating" style={{ flex: 1 }}>
            <label className="floating-label">Email</label>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input className="input-label" placeholder="Email" />
            </Form.Item>
          </div>
        </div>

        <div className="custom-floating">
          <label className="floating-label">Số điện thoại</label>
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              {
                pattern: /^0[0-9]{9}$/,
                message: 'Số điện thoại phải là 10 số, bắt đầu bằng 0!',
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input className="input-label" placeholder="Số điện thoại" />
          </Form.Item>
        </div>
      </ReusableForm>
    </ReusableModal>
  );
};

export default EditUserAccountModal;