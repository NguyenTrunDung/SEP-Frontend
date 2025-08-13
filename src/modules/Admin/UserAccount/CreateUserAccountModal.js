import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Space, Select, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import './UserAccountModal.css';

const CreateUserAccountModal = ({ visible, onCancel, onOk, groupOptions = [] }) => {
  const { form, handleSubmit, resetForm } = useAntForm();
  const [focus, setFocus] = useState('');

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({});
      window.__userAccountModalForm__ = form;
    } else {
      resetForm();
      if (window.__userAccountModalForm__ === form) {
        window.__userAccountModalForm__ = undefined;
      }
    }
  }, [visible, form, resetForm]);

  const handleFormSubmit = async (values) => {
    try {
      await handleSubmit(() => {
        onOk({
          ...values,
          phone: values.phone?.trim() || '',
        });
      });
    } catch (error) {
      console.error('❌ Lỗi khi tạo tài khoản:', error);
      message.error(error.response?.data?.message || 'Lỗi khi tạo tài khoản!');
    }
  };

  const renderFormFields = () => (
    <>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div className="custom-floating" style={{ flex: 1 }}>
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
            style={{ marginBottom: 0 }}
          >
            <div className="branch-floating-input-wrapper">
              <Input
                className="branch-custom-input"
                onFocus={() => setFocus('firstName')}
                onBlur={(e) => {
                  if (!e.target.value) setFocus('');
                }}
                value={form.getFieldValue('firstName')}
                onChange={(e) => form.setFieldValue('firstName', e.target.value)}
              />
              <label
                className={`branch-floating-label ${
                  focus === 'firstName' || form.getFieldValue('firstName') ? 'focused' : ''
                }`}
              >
                Họ
              </label>
            </div>
          </Form.Item>
        </div>
        <div className="custom-floating" style={{ flex: 1 }}>
          <Form.Item
            name="lastName"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
            style={{ marginBottom: 0 }}
          >
            <div className="branch-floating-input-wrapper">
              <Input
                className="branch-custom-input"
                onFocus={() => setFocus('lastName')}
                onBlur={(e) => {
                  if (!e.target.value) setFocus('');
                }}
                value={form.getFieldValue('lastName')}
                onChange={(e) => form.setFieldValue('lastName', e.target.value)}
              />
              <label
                className={`branch-floating-label ${
                  focus === 'lastName' || form.getFieldValue('lastName') ? 'focused' : ''
                }`}
              >
                Tên
              </label>
            </div>
          </Form.Item>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div className="custom-floating" style={{ flex: 1 }}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
            style={{ marginBottom: 0 }}
          >
            <div className="branch-floating-input-wrapper">
              <Input
                className="branch-custom-input"
                onFocus={() => setFocus('username')}
                onBlur={(e) => {
                  if (!e.target.value) setFocus('');
                }}
                value={form.getFieldValue('username')}
                onChange={(e) => form.setFieldValue('username', e.target.value)}
              />
              <label
                className={`branch-floating-label ${
                  focus === 'username' || form.getFieldValue('username') ? 'focused' : ''
                }`}
              >
                Tài khoản
              </label>
            </div>
          </Form.Item>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div className="custom-floating" style={{ flex: 1 }}>
          <Form.Item
            name="groupId"
            rules={[{ required: true, message: 'Vui lòng chọn nhóm người dùng!' }]}
            style={{ marginBottom: 0 }}
          >
            <div className="branch-floating-input-wrapper">
              <Select
                className="branch-custom-input"
                options={groupOptions}
                onFocus={() => setFocus('groupId')}
                onBlur={() => {
                  if (!form.getFieldValue('groupId')) setFocus('');
                }}
                value={form.getFieldValue('groupId')}
                onChange={(value) => form.setFieldValue('groupId', value)}
              />
              <label
                className={`branch-floating-label ${
                  focus === 'groupId' || form.getFieldValue('groupId') ? 'focused' : ''
                }`}
              >
                Nhóm người dùng
              </label>
            </div>
          </Form.Item>
        </div>

        <div className="custom-floating" style={{ flex: 1 }}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <div className="branch-floating-input-wrapper">
              <Input
                className="branch-custom-input"
                onFocus={() => setFocus('email')}
                onBlur={(e) => {
                  if (!e.target.value) setFocus('');
                }}
                value={form.getFieldValue('email')}
                onChange={(e) => form.setFieldValue('email', e.target.value)}
              />
              <label
                className={`branch-floating-label ${
                  focus === 'email' || form.getFieldValue('email') ? 'focused' : ''
                }`}
              >
                Email
              </label>
            </div>
          </Form.Item>
        </div>
      </div>

      <div className="custom-floating">
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
          <div className="branch-floating-input-wrapper">
            <Input
              className="branch-custom-input"
              onFocus={() => setFocus('phone')}
              onBlur={(e) => {
                if (!e.target.value) setFocus('');
              }}
              value={form.getFieldValue('phone')}
              onChange={(e) => form.setFieldValue('phone', e.target.value)}
            />
            <label
              className={`branch-floating-label ${
                focus === 'phone' || form.getFieldValue('phone') ? 'focused' : ''
              }`}
            >
              Số điện thoại
            </label>
          </div>
        </Form.Item>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div className="custom-floating" style={{ flex: 1 }}>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              {
                pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
                message:
                  'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt (VD: Example@123123)!',
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <div className="branch-floating-input-wrapper">
              <Input.Password
                className="branch-custom-input"
                onFocus={() => setFocus('password')}
                onBlur={(e) => {
                  if (!e.target.value) setFocus('');
                }}
                value={form.getFieldValue('password')}
                onChange={(e) => form.setFieldValue('password', e.target.value)}
              />
              <label
                className={`branch-floating-label ${
                  focus === 'password' || form.getFieldValue('password') ? 'focused' : ''
                }`}
              >
                Mật khẩu
              </label>
            </div>
          </Form.Item>
        </div>
      </div>
    </>
  );

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px', color: '#000' }}>Thêm</span>}
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
        {renderFormFields()}
      </ReusableForm>
    </ReusableModal>
  );
};

export default CreateUserAccountModal;