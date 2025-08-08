import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Card, Avatar, Typography, Button, Form, Input, Select, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { departmentService } from '../../services/departmentService';
import { useDepartments } from '../../hooks/queries/useDepartments';

const { Title, Text } = Typography;
const { Option } = Select;

// Password validation regex: at least 6 characters, 1 uppercase, 1 special character, 1 number
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{6,}$/;

const ProfilePopup = ({ visible, onClose }) => {
  const { user, logout, updateUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { departments, isLoading: isDepartmentsLoading } = useDepartments();

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profilePictureUrl: user.profilePictureUrl || null,
        departmentId: user.departmentId || '',
      });
    }
  }, [user, profileForm]);

  const handleEditProfile = () => {
    if (!user) {
      message.error('Thông tin người dùng không hợp lệ.');
      navigate('/login');
      return;
    }
    setIsEditProfileModalVisible(true);
  };

  const handleChangePassword = () => {
    if (!user) {
      message.error('Thông tin người dùng không hợp lệ.');
      navigate('/login');
      return;
    }
    setIsChangePasswordModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      onClose();
      logout();
      navigate('/login');
      message.success('Đăng xuất thành công!');
    } catch (error) {
      message.error('Đăng xuất thất bại.');
    }
  };

  const handleAvatarChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          profileForm.setFieldsValue({ profilePictureUrl: reader.result });
        };
        reader.readAsDataURL(file);
      }
    },
    [profileForm]
  );

  const handleSaveEditProfile = async (values) => {
    if (!user) {
      message.error('Không có thông tin người dùng.');
      return;
    }

    try {
      const updatedUser = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        profilePictureUrl: values.profilePictureUrl,
      };

      await authService.editProfile(updatedUser);

      if (values.departmentId && values.departmentId !== user.departmentId) {
        await departmentService.updateUserDepartment(user.id, values.departmentId);
      }

      const updatedUserData = await authService.getProfile();

      updateUser({
        ...user,
        ...updatedUserData,
        departmentId: values.departmentId,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        profilePictureUrl: values.profilePictureUrl,
      });

      message.success('Cập nhật hồ sơ thành công!');
      setIsEditProfileModalVisible(false);
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại.');
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
      setIsChangePasswordModalVisible(false);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Đổi mật khẩu thất bại.';
      message.error(errorMessage);
    }
  };

  return (
    <>
      {/* Profile Modal */}
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width="min(100vw, 600px)"
        styles={{
          mask: { background: 'rgba(0, 0, 0, 0.6)' },
          content: { padding: 0, borderRadius: 8 },
          body: { padding: 0, background: '#fff' },
        }}
      >
        <div style={{ backgroundColor: '#b4c80f', padding: '12px 16px', color: '#000', fontSize: '18px', fontWeight: 600 }}>
          Thông tin cá nhân
        </div>
        <div style={{ padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải thông tin...</div>
          ) : user ? (
            <Card bordered={false}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Avatar size={64} src={user.profilePictureUrl} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <Title level={4} style={{ marginTop: '8px', color: '#262626' }}>
                  {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
                </Title>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>Email:</Text>
                  <Input value={user.email || 'N/A'} readOnly style={{ width: '70%', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>Vai trò:</Text>
                  <Input value={user.role || 'N/A'} readOnly style={{ width: '70%', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>Phòng ban:</Text>
                  <Input
                    value={departments.find((dept) => dept.id === user.departmentId)?.name || 'N/A'}
                    readOnly
                    style={{ width: '70%', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Button
                  onClick={handleEditProfile}
                  style={{
                    backgroundColor: '#b4c80f',
                    borderColor: '#b4c80f',
                    color: '#000',
                    borderRadius: '4px',
                    padding: '8px 16px',
                  }}
                >
                  Chỉnh sửa hồ sơ
                </Button>
                <Button
                  onClick={handleChangePassword}
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '8px 16px',
                  }}
                >
                  Đổi mật khẩu
                </Button>
                <Button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '8px 16px',
                  }}
                >
                  Đăng xuất
                </Button>
              </div>
            </Card>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Không có dữ liệu người dùng. Vui lòng đăng nhập.
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        open={isEditProfileModalVisible}
        onCancel={() => {
          profileForm.resetFields();
          setIsEditProfileModalVisible(false);
        }}
        footer={null}
        centered
        width="min(100vw, 600px)"
        styles={{
          mask: { background: 'rgba(0, 0, 0, 0.6)' },
          content: { padding: 0, borderRadius: 8 },
          body: { padding: 0, background: '#fff' },
        }}
      >
        <div style={{ backgroundColor: '#b4c80f', padding: '12px 16px', color: '#000', fontSize: '18px', fontWeight: 600 }}>
          Chỉnh sửa hồ sơ
        </div>
        <div style={{ padding: '16px' }}>
          <Card bordered={false}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Avatar
                size={64}
                src={profileForm.getFieldValue('profilePictureUrl')}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              <Title level={4} style={{ marginTop: '8px', color: '#262626' }}>
                Chỉnh sửa hồ sơ
              </Title>
            </div>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleSaveEditProfile}
            >
              <Form.Item
                label={<Text strong>Họ</Text>}
                name="firstName"
                rules={[{ required: true, message: 'Họ không được để trống.' }]}
              >
                <Input style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item
                label={<Text strong>Tên</Text>}
                name="lastName"
                rules={[{ required: true, message: 'Tên không được để trống.' }]}
              >
                <Input style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item
                label={<Text strong>Email</Text>}
                name="email"
                initialValue={user?.email || 'N/A'}
              >
                <Input disabled style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item
                label={<Text strong>Phòng ban</Text>}
                name="departmentId"
                rules={[{ required: true, message: 'Vui lòng chọn phòng ban.' }]}
              >
                <Select
                  style={{ borderRadius: '4px' }}
                  disabled={isDepartmentsLoading}
                  placeholder="Chọn phòng ban"
                >
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={<Text strong>Avatar</Text>}
                name="profilePictureUrl"
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ borderRadius: '4px' }}
                />
              </Form.Item>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    backgroundColor: '#b4c80f',
                    borderColor: '#b4c80f',
                    color: '#000',
                    borderRadius: '4px',
                    padding: '8px 16px',
                  }}
                  loading={isDepartmentsLoading}
                >
                  Lưu thay đổi
                </Button>
                <Button
                  onClick={() => {
                    profileForm.resetFields();
                    setIsEditProfileModalVisible(false);
                  }}
                  style={{
                    borderRadius: '4px',
                    padding: '8px 16px',
                  }}
                >
                  Hủy
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={isChangePasswordModalVisible}
        onCancel={() => {
          passwordForm.resetFields();
          setIsChangePasswordModalVisible(false);
        }}
        footer={null}
        centered
        width="min(100vw, 600px)"
        styles={{
          mask: { background: 'rgba(0, 0, 0, 0.6)' },
          content: { padding: 0, borderRadius: 8 },
          body: { padding: 0, background: '#fff' },
        }}
      >
        <div style={{ backgroundColor: '#b4c80f', padding: '12px 16px', color: '#000', fontSize: '18px', fontWeight: 600 }}>
          Đổi mật khẩu
        </div>
        <div style={{ padding: '16px' }}>
          <Card bordered={false}>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleSaveChangePassword}
            >
              <Form.Item
                label={<Text strong>Mật khẩu cũ</Text>}
                name="oldPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ.' }]}
              >
                <Input.Password style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item
                label={<Text strong>Mật khẩu mới</Text>}
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
                <Input.Password style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item
                label={<Text strong>Xác nhận mật khẩu mới</Text>}
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
                <Input.Password style={{ borderRadius: '4px' }} />
              </Form.Item>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    backgroundColor: '#b4c80f',
                    borderColor: '#b4c80f',
                    color: '#000',
                    borderRadius: '4px',
                    padding: '8px 16px',
                  }}
                >
                  Lưu thay đổi
                </Button>
                <Button
                  onClick={() => {
                    passwordForm.resetFields();
                    setIsChangePasswordModalVisible(false);
                  }}
                  style={{
                    borderRadius: '4px',
                    padding: '8px 16px',
                  }}
                >
                  Hủy
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </Modal>
    </>
  );
};

export default ProfilePopup;