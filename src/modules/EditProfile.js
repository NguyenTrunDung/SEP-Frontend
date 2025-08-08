import React, { useState, useEffect, useCallback } from 'react';
import { Card, Avatar, Typography, Button, Input, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { departmentService } from '../services/departmentService';
import { branchService } from '../services/branchService';
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
    branch: user?.branch || 'N/A', // Use branch name for display
  });
  const navigate = useNavigate();
  const { id } = useParams();

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
    const fetchProfileAndBranch = async () => {
      if (user) {
        let updatedUserData = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || '',
          profilePictureUrl: user.profilePictureUrl || null,
          departmentId: user.departmentId || '',
          branch: user.branch || 'N/A',
        };

        const rolesWithBranch = [
          ROLES.STAFF,
          ROLES.CASHIER,
          ROLES.KITCHEN,
          ROLES.DOCTOR,
          ROLES.NURSE,
        ];

        // Fetch branch information if the user role requires it and branch is not already set
        if (rolesWithBranch.includes(user.role) && !user.branch) {
          try {
            const branchData = await branchService.getCurrentBranch();
            updatedUserData = {
              ...updatedUserData,
              branch: branchData?.name || 'N/A',
            };
            updateUser({ ...user, branch: branchData?.name || 'N/A' });
          } catch (error) {
            console.error('Failed to fetch branch:', error);
            updatedUserData.branch = 'N/A';
          }
        }

        setEditProfileData(updatedUserData);
      }
    };

    fetchProfileAndBranch();
  }, [user, updateUser]);

  if (loading || isDepartmentsLoading) {
    return <div className="loading-text">Loading...</div>;
  }

  if (!user || user.id !== id) {
    return <div className="no-user-text">Unauthorized or invalid user ID</div>;
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
      case ROLES.DOCTOR:
      case ROLES.NURSE:
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

      await authService.editProfile(updatedUser);

      if (editProfileData.departmentId && editProfileData.departmentId !== user.departmentId) {
        await departmentService.updateUserDepartment(user.id, editProfileData.departmentId);
      }

      const updatedUserData = await authService.getProfile();

      updateUser({
        ...user,
        ...updatedUserData,
        departmentId: editProfileData.departmentId,
        firstName: editProfileData.firstName,
        lastName: editProfileData.lastName,
        phoneNumber: editProfileData.phoneNumber,
        profilePictureUrl: editProfileData.profilePictureUrl,
        branch: editProfileData.branch, // Preserve branch info
      });

      message.success('Cập nhật hồ sơ thành công!');
      navigate(getProfileRoute());
    } catch (error) {
      message.error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    }
  };

  const rolesWithoutBranch = [
    ROLES.SYSTEM_ADMIN,
    ROLES.ADMIN,
    ROLES.BRANCH_MANAGER,
    ROLES.MANAGER,
  ];
  const showBranch = !rolesWithoutBranch.includes(user.role);
  const isNurseOrDoctor = [ROLES.NURSE, ROLES.DOCTOR].includes(user.role);

  return (
    <div className="view-profile-container">
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
          {isNurseOrDoctor && (
            <div className="profile-detail">
              <label className="detail-label">Phòng ban:</label>
              <select
                value={editProfileData.departmentId}
                onChange={(e) => setEditProfileData((prev) => ({ ...prev, departmentId: e.target.value }))}
                className="detail-input"
                disabled={isDepartmentsLoading || !Array.isArray(departments)}
              >
                <option value="">Chọn phòng ban</option>
                {Array.isArray(departments) && departments.length > 0 ? (
                  departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Không có phòng ban
                  </option>
                )}
              </select>
            </div>
          )}
          {showBranch && (
            <div className="profile-detail">
              <label className="detail-label">Chi nhánh:</label>
              <Input
                type="text"
                value={editProfileData.branch || 'N/A'}
                readOnly
                className="detail-input"
              />
            </div>
          )}
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
          <Button
            type="primary"
            className="save-button"
            onClick={handleSave}
          >
            Lưu
          </Button>
          <Button
            onClick={() => navigate(getProfileRoute())}
          >
            Hủy
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditProfile;