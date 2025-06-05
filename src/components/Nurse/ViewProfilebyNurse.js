import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Card, Avatar, Typography, Button, Input, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles';

const { Title, Text } = Typography;

const ProfilePopup = ({ visible, onClose }) => {
  const { user, logout, updateUser, changePassword, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: user?.name || '',
    role: user?.role || '',
    department: user?.department || '',
    avatar: user?.avatar || null,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setEditProfileData({
        name: user.name || '',
        role: user.role || '',
        department: user.department || '',
        avatar: user.avatar || null,
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

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSaveEditProfile = () => {
    if (!user) {
      message.error('Không có thông tin người dùng.');
      return;
    }
    const updatedUser = { ...user, ...editProfileData };
    updateUser(updatedUser);
    message.success('Cập nhật hồ sơ thành công!');
    setIsEditProfileModalVisible(false);
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
      message.error(error.message || 'Đổi mật khẩu thất bại.');
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
                <Avatar size={64} src={user.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <Title level={4} style={{ marginTop: '8px', color: '#262626' }}>
                  {user.name || 'N/A'}
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
                  <Input value={user.department || 'N/A'} readOnly style={{ width: '70%', borderRadius: '4px' }} />
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
              <Avatar size={64} src={editProfileData.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Title level={4} style={{ marginTop: '8px', color: '#262626' }}>
                Chỉnh sửa hồ sơ
              </Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Tên:</Text>
                <Input
                  value={editProfileData.name}
                  onChange={(e) => setEditProfileData((prev) => ({ ...prev, name: e.target.value }))}
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
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Vai trò:</Text>
                <Input
                  value={editProfileData.role}
                  onChange={(e) => setEditProfileData((prev) => ({ ...prev, role: e.target.value }))}
                  style={{ borderRadius: '4px' }}
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Phòng ban:</Text>
                <Input
                  value={editProfileData.department}
                  onChange={(e) => setEditProfileData((prev) => ({ ...prev, department: e.target.value }))}
                  style={{ borderRadius: '4px' }}
                />
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
              <Avatar size={64} src={user?.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
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