import React, { useState } from 'react';
import { Card, Avatar, Typography, Button, Form, Input, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ROLES } from '../constants/roles';
import './Profile.css';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{6,}$/;
const { Title, Text } = Typography;

const ChangePassword = () => {
  const { user, loading } = useAuth();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();

  if (loading) {
    return <div className="loading-text">Đang tải...</div>;
  }

  if (!user) {
    return <div className="no-user-text">Không được phép. Vui lòng đăng nhập.</div>;
  }

  const getProfileRoute = () => {
    if (!user?.role) {
      return '/profile';
    }
    switch (user.role) {
      case ROLES.SYSTEM_ADMIN:
      case ROLES.ADMIN:
      case ROLES.BRANCH_MANAGER:
      case ROLES.MANAGER:
      case ROLES.STAFF:
      case ROLES.CASHIER:
      case ROLES.KITCHEN:
        return '/admin/profile';
      case ROLES.DOCTOR:
        return '/admin/profile';
      case ROLES.PATIENT:
        return '/patient/profile';
      default:
        return '/profile';
    }
  };

  const handleSaveChangePassword = async (values) => {
    if (!user) {
      message.error('Không có thông tin người dùng.');
      return;
    }
    try {
      await authService.changePassword({
        Email: user.email,
        OldPassword: values.oldPassword,
        NewPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
      navigate(getProfileRoute());
    } catch (error) {
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Đổi mật khẩu thất bại.';
      message.error(errorMessage);
    }
  };

  return (
    <div className="view-profile-container">
      <Card className="profile-card">
        <div className="profile-header">
          <Avatar
            size={64}
            icon={!user.profilePictureUrl && <UserOutlined />}
            src={user.profilePictureUrl}
          />
          <Title level={3} className="profile-name">Đổi mật khẩu</Title>
        </div>
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleSaveChangePassword}
        >
          <div className="profile-details">
            <div className="profile-detail">
              <Form.Item
                label={<Text strong className="detail-label">Mật khẩu cũ</Text>}
                name="oldPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ.' }]}
              >
                <Input.Password className="detail-input" />
              </Form.Item>
            </div>
            <div className="profile-detail">
              <Form.Item
                label={<Text strong className="detail-label">Mật khẩu mới</Text>}
                name="newPassword"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới.' },
                  {
                    pattern: passwordRegex,
                    message:
                      'Mật khẩu mới phải có ít nhất 6 ký tự, bao gồm ít nhất 1 chữ in hoa, 1 ký tự đặc biệt (!@#$%^&*) và 1 số.',
                  },
                ]}
              >
                <Input.Password className="detail-input" />
              </Form.Item>
            </div>
            <div className="profile-detail">
              <Form.Item
                label={<Text strong className="detail-label">Xác nhận mật khẩu mới</Text>}
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng nhập xác nhận mật khẩu.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu mới và xác nhận mật khẩu không khớp.'));
                    },
                  }),
                ]}
              >
                <Input.Password className="detail-input" />
              </Form.Item>
            </div>
          </div>
          <div className="profile-button-group">
            <Button
              type="primary"
              htmlType="submit"
              className="save-button"
            >
              Lưu
            </Button>
            <Button
              onClick={() => {
                passwordForm.resetFields();
                navigate(getProfileRoute());
              }}
            >
              Hủy
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;