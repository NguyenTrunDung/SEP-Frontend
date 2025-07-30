import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Card, Avatar, Typography, Button, Input, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { departmentService } from '../../services/departmentService';
import { useDepartments } from '../../hooks/queries/useDepartments';

const { Title, Text } = Typography;

const ProfilePopup = ({ visible, onClose }) => {
  const { user, logout, updateUser, changePassword, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profilePictureUrl: user?.profilePictureUrl || null,
    departmentId: user?.departmentId || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { departments, isLoading: isDepartmentsLoading } = useDepartments();

  useEffect(() => {
    if (user) {
      setEditProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profilePictureUrl: user.profilePictureUrl || null,
        departmentId: user.departmentId || '',
      });
    }
  }, [user]);

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

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileData((prev) => ({ ...prev, profilePictureUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSaveEditProfile = async () => {
    if (!user) {
      message.error('Không có thông tin người dùng.');
      return;
    }
    try {
      const updatedUser = {
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        profilePictureUrl: editProfileData.profilePictureUrl,
      };

      // Update user profile via API
      await authService.editProfile(updatedUser);

      // If departmentId has changed, update department assignment
      if (editProfileData.departmentId && editProfileData.departmentId !== user.departmentId) {
        await departmentService.updateUserDepartment(user.id, editProfileData.departmentId);
      }

      // Fetch updated user data from the server
      const updatedUserData = await authService.getProfile();

      // Update local user context with the latest data
      updateUser({ 
        ...user, 
        ...updatedUserData, 
        departmentId: editProfileData.departmentId,
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        profilePictureUrl: editProfileData.profilePictureUrl
      });

      // Show success message
      message.success('Cập nhật hồ sơ thành công!');

      // Close both edit profile modal and main profile popup
      setIsEditProfileModalVisible(false);
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại.');
    }
  };

  const isValidPassword = useCallback((password) => {
    const regex = /^[a-zA-Z0-9@]{8,}$/;
    return regex.test(password);
  }, []);

  const handlePasswordChange = useCallback((field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveChangePassword = useCallback(async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      message.error('Vui lòng điền đầy đủ các trường.');
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (!isValidPassword(newPassword)) {
      message.error('Mật khẩu mới phải dài ít nhất 8 ký tự và chỉ chứa chữ cái, số, và ký tự "@".');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn đổi mật khẩu không?')) {
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      message.success('Đổi mật khẩu thành công!');
      setIsChangePasswordModalVisible(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại.');
    }
  }, [passwordData, changePassword, isValidPassword]);

  const handleCloseChangePasswordModal = useCallback(() => {
    setIsChangePasswordModalVisible(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, []);

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
        onCancel={() => setIsEditProfileModalVisible(false)}
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
              <Avatar size={64} src={editProfileData.profilePictureUrl} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Title level={4} style={{ marginTop: '8px', color: '#262626' }}>
                Chỉnh sửa hồ sơ
              </Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Họ:</Text>
                <Input
                  value={editProfileData.firstName}
                  onChange={(e) => setEditProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                  style={{ borderRadius: '4px' }}
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Tên:</Text>
                <Input
                  value={editProfileData.lastName}
                  onChange={(e) => setEditProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                  style={{ borderRadius: '4px' }}
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Email:</Text>
                <Input
                  value={user?.email || 'N/A'}
                  disabled
                  style={{ borderRadius: '4px' }}
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Phòng ban:</Text>
                <select
                  value={editProfileData.departmentId}
                  onChange={(e) => setEditProfileData((prev) => ({ ...prev, departmentId: e.target.value }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                  disabled={isDepartmentsLoading}
                >
                  <option value="">Chọn phòng ban</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Avatar:</Text>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Button
                onClick={handleSaveEditProfile}
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
                onClick={() => setIsEditProfileModalVisible(false)}
                style={{
                  borderRadius: '4px',
                  padding: '8px 16px',
                }}
              >
                Hủy
              </Button>
            </div>
          </Card>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={isChangePasswordModalVisible}
        onCancel={handleCloseChangePasswordModal}
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
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Avatar size={64} src={user?.profilePictureUrl} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Title level={4} style={{ marginTop: '8px', color: '#262626' }}>
                Đổi mật khẩu
              </Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Mật khẩu hiện tại:</Text>
                <Input.Password
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  style={{ borderRadius: '4px' }}
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Mật khẩu mới:</Text>
                <Input.Password
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  style={{ borderRadius: '4px' }}
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Xác nhận mật khẩu mới:</Text>
                <Input.Password
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  style={{ borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Button
                onClick={handleSaveChangePassword}
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
                onClick={handleCloseChangePasswordModal}
                style={{
                  borderRadius: '4px',
                  padding: '8px 16px',
                }}
              >
                Hủy
              </Button>
            </div>
          </Card>
        </div>
      </Modal>
    </>
  );
};

export default ProfilePopup;