import React, { useState, useEffect, useCallback } from 'react';
import { Card, Avatar, Typography, Button, Input, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { departmentService } from '../services/departmentService';
import { useDepartments } from '../hooks/queries/useDepartments';
import { ROLES } from '../constants/roles';
import './Profile.css';

const { Title } = Typography;

const EditProfile = () => {
  const { user, updateUser, loading } = useAuth();
  const { departments, isLoading: isDepartmentsLoading } = useDepartments();
  const [editProfileData, setEditProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    profilePictureUrl: user?.profilePictureUrl || null,
    departmentId: user?.departmentId || '',
  });
  const navigate = useNavigate();
  const { id } = useParams();

  // Move useCallback to top level to comply with Rules of Hooks
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

  useEffect(() => {
    if (user) {
      setEditProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        profilePictureUrl: user.profilePictureUrl || null,
        departmentId: user.departmentId || '',
      });
    }
  }, [user]);

  if (loading || isDepartmentsLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.id !== id) {
    return <div>Unauthorized or invalid user ID</div>;
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

  const handleSave = async () => {
    try {
      const updatedUser = {
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        phoneNumber: editProfileData.phoneNumber,
        profilePictureUrl: editProfileData.profilePictureUrl,
      };

      // Update user profile via API
      await authService.editProfile(updatedUser);

      // Update department if changed
      if (editProfileData.departmentId && editProfileData.departmentId !== user.departmentId) {
        await departmentService.updateUserDepartment(user.id, editProfileData.departmentId);
      }

      // Fetch updated user data
      const updatedUserData = await authService.getProfile();

      // Update local context
      updateUser({
        ...user,
        ...updatedUserData,
        departmentId: editProfileData.departmentId,
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        phoneNumber: editProfileData.phoneNumber,
        profilePictureUrl: editProfileData.profilePictureUrl,
      });

      message.success('Cập nhật hồ sơ thành công!');
      const profileRoute = getProfileRoute();
      navigate(profileRoute);
    } catch (error) {
      message.error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    }
  };

  return (
    <div className="edit-profile-container">
      <Card className="profile-card">
        <div className="profile-header">
          <Avatar size={64} icon={!editProfileData.profilePictureUrl && <UserOutlined />} src={editProfileData.profilePictureUrl} />
          <Title level={3} className="profile-name">Chỉnh sửa hồ sơ</Title>
        </div>

        <div className="profile-details">
          <div className="profile-detail">
            <label className="detail-label">Tên:</label>
            <Input
              value={editProfileData.firstName}
              onChange={(e) => setEditProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
              className="detail-input"
            />
          </div>
          <div className="profile-detail">
            <label className="detail-label">Họ:</label>
            <Input
              value={editProfileData.lastName}
              onChange={(e) => setEditProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
              className="detail-input"
            />
          </div>
          <div className="profile-detail">
            <label className="detail-label">Email:</label>
            <Input
              type="email"
              value={user.email || 'N/A'}
              disabled
              className="detail-input"
            />
          </div>
          <div className="profile-detail">
            <label className="detail-label">Số điện thoại:</label>
            <Input
              value={editProfileData.phoneNumber}
              onChange={(e) => setEditProfileData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="detail-input"
            />
          </div>
          <div className="profile-detail">
            <label className="detail-label">Phòng ban:</label>
            <select
              value={editProfileData.departmentId}
              onChange={(e) => setEditProfileData((prev) => ({ ...prev, departmentId: e.target.value }))}
              className="detail-input"
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
          <div className="profile-detail">
            <label className="detail-label">Avatar:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="detail-input"
            />
          </div>
        </div>

        <div className="profile-button-group">
          <Button type="primary" onClick={handleSave} className="save-button">
            Lưu
          </Button>
          <Button onClick={() => navigate(getProfileRoute())}>
            Hủy
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditProfile;